import unittest
from datetime import date

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app import crud, models, schemas
from app.database import Base, ensure_employee_status_columns


class EmployeeArchiveTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://")
        Base.metadata.create_all(self.engine)
        self.db = sessionmaker(bind=self.engine)()

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def test_archive_and_restore_preserves_employee_identity_and_history(self):
        employee = models.Employee(
            name="Test Employee",
            daily_wage=100,
            overtime_rate=20,
            bank_daily_amount=50,
        )
        attendance = models.Attendance(
            date=date(2026, 1, 1),
            employee=employee,
            present=True,
            daily_wage_snapshot=80,
            overtime_rate_snapshot=15,
            bank_daily_amount_snapshot=40,
            employee_name_snapshot="Test Employee",
        )
        legacy_attendance = models.Attendance(
            date=date(2026, 1, 2),
            employee=employee,
            present=True,
        )
        self.db.add_all([attendance, legacy_attendance])
        self.db.commit()
        employee_id = employee.id

        archived = crud.set_employee_active(self.db, employee_id, False)

        self.assertEqual(archived.id, employee_id)
        self.assertFalse(archived.is_active)
        saved_attendances = (
            self.db.query(models.Attendance)
            .order_by(models.Attendance.date)
            .all()
        )
        self.assertEqual(len(saved_attendances), 2)
        self.assertTrue(
            all(record.employee_id == employee_id for record in saved_attendances)
        )
        self.assertEqual(saved_attendances[1].employee_name_snapshot, "Test Employee")
        self.assertEqual(saved_attendances[1].daily_wage_snapshot, 100)

        archived_attendance = crud.create_attendance(
            self.db,
            schemas.AttendanceCreate(
                date=date(2026, 1, 3),
                employee_id=employee_id,
                present=True,
            ),
        )
        self.assertEqual(archived_attendance, "EMPLOYEE_ARCHIVED")
        self.assertEqual(self.db.query(models.Attendance).count(), 2)

        report_while_archived = crud.get_attendance_report(
            self.db,
            start=date(2026, 1, 1),
            end=date(2026, 1, 3),
            employee_id=employee_id,
        )
        self.assertEqual(len(report_while_archived["records"]), 2)
        self.assertEqual(
            [record["employee_name"] for record in report_while_archived["records"]],
            ["Test Employee", "Test Employee"],
        )
        self.assertEqual(
            [record["daily_wage"] for record in report_while_archived["records"]],
            [80, 100],
        )

        restored = crud.set_employee_active(self.db, employee_id, True)

        self.assertEqual(restored.id, employee_id)
        self.assertTrue(restored.is_active)
        new_attendance = crud.create_attendance(
            self.db,
            schemas.AttendanceCreate(
                date=date(2026, 1, 3),
                employee_id=employee_id,
                present=True,
            ),
        )
        self.assertIsInstance(new_attendance, models.Attendance)
        self.assertEqual(new_attendance.employee_id, employee_id)

        report_after_restore = crud.get_attendance_report(
            self.db,
            start=date(2026, 1, 1),
            end=date(2026, 1, 3),
            employee_id=employee_id,
        )
        self.assertEqual(len(report_after_restore["records"]), 3)
        self.assertEqual(
            [record["daily_wage"] for record in report_after_restore["records"]],
            [80, 100, 100],
        )

    def test_migration_marks_existing_employees_active(self):
        legacy_engine = create_engine("sqlite://")
        try:
            with legacy_engine.begin() as connection:
                connection.exec_driver_sql(
                    "CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT)"
                )
                connection.exec_driver_sql(
                    "INSERT INTO employees (name) VALUES ('Existing Employee')"
                )

            ensure_employee_status_columns(legacy_engine)

            with legacy_engine.connect() as connection:
                is_active, is_deleted = connection.exec_driver_sql(
                    "SELECT is_active, is_deleted FROM employees"
                ).one()
            self.assertEqual((is_active, is_deleted), (1, 0))
        finally:
            legacy_engine.dispose()

    def test_soft_delete_keeps_history_and_blocks_future_actions(self):
        employee = models.Employee(
            name="Deleted Employee",
            daily_wage=90,
            overtime_rate=18,
            bank_daily_amount=45,
        )
        attendance = models.Attendance(
            date=date(2026, 1, 1),
            employee=employee,
            present=True,
        )
        self.db.add(attendance)
        self.db.commit()
        employee_id = employee.id

        deleted = crud.soft_delete_employee(self.db, employee_id)

        self.assertEqual(deleted.id, employee_id)
        self.assertFalse(deleted.is_active)
        self.assertTrue(deleted.is_deleted)
        saved_attendance = self.db.query(models.Attendance).one()
        self.assertEqual(saved_attendance.employee_id, employee_id)
        self.assertEqual(saved_attendance.employee_name_snapshot, "Deleted Employee")
        self.assertEqual(saved_attendance.daily_wage_snapshot, 90)
        self.assertIsNone(crud.set_employee_active(self.db, employee_id, True))
        self.assertIsNone(
            crud.update_employee(
                self.db,
                employee_id,
                schemas.EmployeeCreate(
                    name="Changed",
                    daily_wage=100,
                    overtime_rate=20,
                    bank_daily_amount=50,
                ),
            )
        )

        future_attendance = crud.create_attendance(
            self.db,
            schemas.AttendanceCreate(
                date=date(2026, 1, 2),
                employee_id=employee_id,
                present=True,
            ),
        )
        self.assertEqual(future_attendance, "EMPLOYEE_DELETED")
        self.assertEqual(self.db.query(models.Attendance).count(), 1)

        report = crud.get_attendance_report(
            self.db,
            start=date(2026, 1, 1),
            end=date(2026, 1, 2),
            employee_id=employee_id,
        )
        self.assertEqual(len(report["records"]), 1)
        self.assertEqual(report["records"][0]["employee_name"], "Deleted Employee")
        self.assertEqual(report["records"][0]["daily_wage"], 90)


if __name__ == "__main__":
    unittest.main()
