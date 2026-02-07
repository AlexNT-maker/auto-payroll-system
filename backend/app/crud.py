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

# Update employee
def update_employee(db: Session, employee_id: int, employee_data: schemas.EmployeeCreate):
    db_employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not db_employee:
        return None
    
    db_employee.name = employee_data.name
    db_employee.daily_wage = employee_data.daily_wage
    db_employee.overtime_rate = employee_data.overtime_rate
    db_employee.bank_daily_amount = employee_data.bank_daily_amount

    db.commit()
    db.refresh(db_employee)
    return db_employee

# Delete employee
def delete_employee(db: Session, employee_id: int):
    db_employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if db_employee:
        db.delete(db_employee)
        db.commit()
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

# Update Boat
def update_boat(db: Session, boat_id: int, boat_data: schemas.BoatCreate):
    db_boat = db.query(models.Boat).filter(models.Boat.id == boat_id).first()
    if not db_boat:
        return None
    db_boat.name = boat_data.name
    db.commit()
    db.refresh(db_boat)
    return db_boat

# Delete Boat
def delete_boat(db: Session, boat_id: int):
    db_boat = db.query(models.Boat).filter(models.Boat.id == boat_id).first()
    if db_boat:
        db.delete(db_boat)
        db.commit()
    return db_boat

# Analysis Boat
def get_boat_analysis(db: Session, boat_id: int, start_date: date, end_date: date):
    
    boat = db.query(models.Boat).filter(models.Boat.id == boat_id).first()
    if not boat:
        return None
    
    records = db.query(models.Attendance).join(models.Employee).filter(
        models.Attendance.boat_id == boat_id,
        models.Attendance.date >= start_date,
        models.Attendance.date <= end_date,
        models.Attendance.present == True
    ).all ()
    analysis_data = []
    total_sum = 0.0

    for rec in records:
        wage = rec.employee.daily_wage
        ot_cost = rec.overtime_hours * rec.employee.overtime_rate
        daily_total = wage + ot_cost + rec.extra_amount

        total_sum += daily_total

        analysis_data.append({
            "date": rec.date,
            "employee_name": rec.employee.name,
            "daily_cost": wage,
            "overtime_cost": ot_cost,
            "total_cost": daily_total
        })

        return {
            "boat_name": boat.name,
            "total_cost": total_sum,
            "analysis_data": analysis_data
        }

# -- Expenses Report --
def get_expenses_report(db: Session, start:date, end:date, boat_id: int=None, emp_id: int=None):
    query = db.query(models.Attendance).filter(
        models.Attendance.date >= start ,
        models.Attendance.date <= end,
        models.Attendance.present == True
    )

    if boat_id:
        query = query.filter(models.Attendance.boat_id == boat_id)
    
    if emp_id:
        query = query.filter(models.Attendance.employee_id == emp_id)

    records = query.all()
    
    report_data = []
    total_sum = 0.0

    for rec in records:
        if not rec.employee:
            continue

        wage = rec.employee.daily_wage if rec.employee.daily_wage else 0.0
        ot_rate = rec.employee.overtime_rate if rec.employee.overtime_rate else 0.0
        
        ot_cost = rec.overtime_hours * ot_rate
        line_total = wage + ot_cost + rec.extra_amount

        total_sum += line_total
        boat_name = "-"
        if rec.boat:
            boat_name = rec.boat.name
        elif rec.boat_id:
            boat_name = f"Διεγραμμένο ({rec.boat_id})"

        report_data.append({
            "date": rec.date,
            "employee_name": rec.employee.name,
            "boat_name": boat_name, 
            "daily_cost": wage,
            "overtime_cost": ot_cost,
            "total_cost": line_total
        })

    return {
        "total_sum": total_sum,
        "results": report_data
    }
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

# -- Fetch attendance for a specific date --
def get_attendance_by_date(db: Session, target_date: date):
    return db.query(models.Attendance).filter(models.Attendance.date == target_date).all()