import sqlite3

def upgrade():
    conn = sqlite3.connect('payroll.db')
    cursor = conn.cursor()

    # 1. Προσθήκη columns (αν δεν υπάρχουν)
    columns = [
        ("daily_wage_snapshot", "FLOAT"),
        ("overtime_rate_snapshot", "FLOAT"),
        ("bank_daily_amount_snapshot", "FLOAT"),
    ]

    for col_name, col_type in columns:
        try:
            cursor.execute(f"ALTER TABLE attendance ADD COLUMN {col_name} {col_type};")
            print(f"✅ Added column: {col_name}")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"ℹ️  Column already exists: {col_name}")
            else:
                print(f"❌ Error on {col_name}: {e}")
                return

    # 2. Γέμισμα με τις τρέχουσες τιμές των employees
    cursor.execute("""
        UPDATE attendance
        SET
            daily_wage_snapshot = (
                SELECT daily_wage FROM employees WHERE employees.id = attendance.employee_id
            ),
            overtime_rate_snapshot = (
                SELECT overtime_rate FROM employees WHERE employees.id = attendance.employee_id
            ),
            bank_daily_amount_snapshot = (
                SELECT bank_daily_amount FROM employees WHERE employees.id = attendance.employee_id
            )
        WHERE daily_wage_snapshot IS NULL
          AND attendance.employee_id IS NOT NULL
    """)

    updated = cursor.rowcount
    conn.commit()
    conn.close()

    print(f"\n✅ Migration complete. Updated {updated} attendance records.")


if __name__ == "__main__":
    upgrade()