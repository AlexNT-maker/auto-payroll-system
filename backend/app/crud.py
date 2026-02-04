from sqlalchemy.orm import Session
from . import models, schemas
from datetime import date

# -- Employee --

# Fetch all the workers
def get_employees(db : Session):
    return db.query(models.Employee).all()

# Create new employee
def create_employee(db: Session, employee: schemas.EmployeeCreate):
    db_employee = models.Employee(
        name = employee.name ,
        daily_wage = employee.daily_wage ,
        overtime_rate = employee.overtime_rate ,
        bank_daily_amount = employee.bank_daily_amount
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

# -- Boats --

def get_boats(db: Session):
    return db.query(models.Boat).all()

# Create new boat
def create_boat(db: Session, boat: schemas.BoatCreate):
    db_boat = models.Boat(
        name = boat.name )
    db.add(db_boat)
    db.commit()
    db.refresh(db_boat)
    return db_boat

# -- Attendance --

def create_attendance(db: Session, attendance: schemas.AttendanceCreate):
    db_attendance = models.Attendance(
        date = attendance.date , 
        employee_id = attendance.employee_id,
        boat_id = attendance.boat_id , 
        present = attendance.present , 
        overtime_hours = attendance.overtime_hours ,
        extra_amount = attendance.extra_amount ,
        extra_reason = attendance.extra_reason
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def get_attendance_by_date(db: Session, target_date: date):
    return db.query(models.Attendance).filter(models.Attendance.date == target_date).all()