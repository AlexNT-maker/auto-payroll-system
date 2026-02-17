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
    ).all ()

    analysis_data = []
    total_sum = 0.0

    for rec in records:
        if rec.present or rec.is_half_day:
            multiplier = 0.5 if rec.is_half_day else 1.0
            wage = rec.employee.daily_wage * multiplier
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
    )

    if boat_id:
        query = query.filter(models.Attendance.boat_id == boat_id)
    
    if emp_id:
        query = query.filter(models.Attendance.employee_id == emp_id)

    records = query.all()
    
    report_data = []
    total_sum = 0.0

    for rec in records:
        if not (rec.present or rec.is_half_day):
            continue

        multiplier = 0.5 if rec.is_half_day else 1.0
        wage = (rec.employee.daily_wage * multiplier) if rec.employee.daily_wage else 0.0

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

# -- Attendance (Update or Create) --
def create_attendance(db: Session, attendance: schemas.AttendanceCreate):
    existing_record = db.query(models.Attendance).filter(
        models.Attendance.date == attendance.date,
        models.Attendance.employee_id == attendance.employee_id
    ).first()

    if existing_record:
        if attendance.boat_id is not None:
            existing_record.boat_id = attendance.boat_id
        if attendance.present is not None:
            existing_record.present = attendance.present
        if attendance.overtime_hours is not None:
            existing_record.overtime_hours = attendance.overtime_hours
        
        if attendance.extra_amount is not None:
            existing_record.extra_amount = attendance.extra_amount
        if attendance.extra_reason is not None:
            existing_record.extra_reason = attendance.extra_reason

        if attendance.is_half_day is not None:
            existing_record.is_half_day = attendance.is_half_day
        
        db.commit()
        db.refresh(existing_record)
        return existing_record
    else:
        db_attendance = models.Attendance(
            date = attendance.date, 
            employee_id = attendance.employee_id,
            boat_id = attendance.boat_id if attendance.boat_id is not None else 1, 
            present = attendance.present if attendance.present is not None else False, 
            overtime_hours = attendance.overtime_hours if attendance.overtime_hours is not None else 0.0,
            extra_amount = attendance.extra_amount if attendance.extra_amount is not None else 0.0,
            extra_reason = attendance.extra_reason if attendance.extra_reason is not None else "",
            is_half_day = attendance.is_half_day if attendance.is_half_day is not None else False
        )
        db.add(db_attendance)
        db.commit()
        db.refresh(db_attendance)
        return db_attendance

# -- Fetch attendance for a specific date --
def get_attendance_by_date(db: Session, target_date: date):
    return db.query(models.Attendance).filter(
        models.Attendance.date == target_date,
        models.Attendance.employee_id.isnot(None) 
    ).all()


# -- Payroll calculation --
def calculate_payroll(db: Session, start: date, end: date):
    employees = get_employees(db)
    results = []

    for emp in employees:
        records = db.query(models.Attendance).filter(
            models.Attendance.employee_id == emp.id,
            models.Attendance.date >= start,
            models.Attendance.date <= end
        ).all()

        days_worked = 0.0
        sum_wage = 0.0
        sum_overtime = 0.0
        sum_extra = 0.0
        reasons_list = []

        for rec in records:
            if rec.present or rec.is_half_day:
                multiplier = 0.5 if rec.is_half_day else 1.0
                days_worked += multiplier
                sum_wage += (emp.daily_wage * multiplier)
                sum_overtime += (rec.overtime_hours * emp.overtime_rate)
            if rec.extra_amount > 0:
                sum_extra += rec.extra_amount
                if rec.extra_reason:
                    reasons_list.append(rec.extra_reason)

        final_reasons = ", ".join(list(set(reasons_list)))

        grand_total = sum_wage + sum_overtime + sum_extra
        
        if days_worked == 0 and sum_extra == 0:
            continue

        target_bank = emp.bank_daily_amount * days_worked
        target_cash = grand_total - target_bank

        if target_cash < 0 :
            target_cash = 0
            target_bank = grand_total

        remainder = target_cash % 50

        final_cash = target_cash - remainder
        final_bank = grand_total - final_cash

        results.append({
            "employee_id": emp.id,
            "employee_name": emp.name,
            "days_worked": days_worked,
            "total_wage": sum_wage,
            "total_overtime": sum_overtime,
            "total_extra": sum_extra,      
            "extra_reasons": final_reasons,
            "grand_total": grand_total,
            "bank_pay": final_bank,
            "cash_pay": final_cash
        })

    return{
    "start_date": start,
    "end_date": end,
    "payments": results
    }
