from sqlalchemy.orm import Session
from . import models, schemas
from datetime import date, timedelta
from typing import Optional

# -- Snapshot helpers (για ιστορική ακεραιότητα τιμών) --

def _get_daily_wage(rec) -> float:
    """Snapshot ή fallback στην τρέχουσα τιμή employee (για legacy records)."""
    if rec.daily_wage_snapshot is not None:
        return rec.daily_wage_snapshot
    return (rec.employee.daily_wage or 0.0) if rec.employee else 0.0


def _get_overtime_rate(rec) -> float:
    if rec.overtime_rate_snapshot is not None:
        return rec.overtime_rate_snapshot
    return (rec.employee.overtime_rate or 0.0) if rec.employee else 0.0


def _get_bank_daily(rec) -> float:
    if rec.bank_daily_amount_snapshot is not None:
        return rec.bank_daily_amount_snapshot
    return (rec.employee.bank_daily_amount or 0.0) if rec.employee else 0.0

def _get_employee_name(rec) -> str:
    """Snapshot name or fallback for employee."""
    if rec.employee_name_snapshot:
        return rec.employee_name_snapshot
    return rec.employee.name if rec.employee else "—"

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
    if not db_employee:
        return "NOT_FOUND"

    has_records = db.query(models.Attendance).filter(
        models.Attendance.employee_id == employee_id
    ).count()

    if has_records > 0:
        return "BLOCKED"   
    
    name = db_employee.name
    db.delete(db_employee)
    db.commit()
    return {"status" : "ok", 
            "name" : name }

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

    records = db.query(models.Attendance).filter(
        (models.Attendance.boat_id == boat_id) | (models.Attendance.overtime_boat_id == boat_id),
        models.Attendance.date >= start_date,
        models.Attendance.date <= end_date,
    ).all()

    analysis_data = []
    total_sum = 0.0

    for rec in records:
        wage = 0.0
        ot_cost = 0.0
        extra = 0.0

        if rec.boat_id == boat_id:
            if rec.present or rec.is_half_day:
                multiplier = 0.5 if rec.is_half_day else 1.0
                wage = _get_daily_wage(rec) * multiplier
            extra = rec.extra_amount or 0.0

        if rec.overtime_boat_id == boat_id:
            ot_cost = rec.overtime_hours * _get_overtime_rate(rec)

        daily_total = wage + ot_cost + extra

        if daily_total > 0:
            total_sum += daily_total
            analysis_data.append({
                "date": rec.date,
                "employee_name": _get_employee_name(rec),
                "daily_cost": wage + extra,
                "overtime_cost": ot_cost,
                "total_cost": daily_total
            })

    return {"boat_name": boat.name, "total_cost": total_sum, "analysis_data": analysis_data}

# -- Short Analysis Boat (Per Employee) --
def get_short_boat_analysis_data(db: Session, boat_id: int, start_date: date, end_date: date):
    boat = db.query(models.Boat).filter(models.Boat.id == boat_id).first()
    if not boat: return None

    records = db.query(models.Attendance).filter(
        (models.Attendance.boat_id == boat_id) | (models.Attendance.overtime_boat_id == boat_id),
        models.Attendance.date >= start_date,
        models.Attendance.date <= end_date,
    ).all()

    emp_totals = {}
    grand_total = 0.0

    for rec in records:
        emp_key = rec.employee_id if rec.employee_id is not None else -1
        if emp_key not in emp_totals:
            emp_totals[emp_key] = {"name": _get_employee_name(rec), "days": 0.0, "ot_hours": 0.0, "cost": 0.0}

        daily_cost = 0.0

        if rec.boat_id == boat_id:
            multiplier = 0.5 if rec.is_half_day else 1.0 if rec.present else 0.0
            emp_totals[emp_key]["days"] += multiplier                    # ✅
            wage = _get_daily_wage(rec) * multiplier
            extra = rec.extra_amount or 0.0
            daily_cost += (wage + extra)

        if rec.overtime_boat_id == boat_id:
            emp_totals[emp_key]["ot_hours"] += rec.overtime_hours or 0.0 # ✅
            ot_cost = (rec.overtime_hours or 0.0) * _get_overtime_rate(rec)
            daily_cost += ot_cost

        emp_totals[emp_key]["cost"] += daily_cost                        # ✅
        grand_total += daily_cost

    valid_employees = [e for e in emp_totals.values() if e["cost"] > 0 or e["days"] > 0 or e["ot_hours"] > 0]
    valid_employees.sort(key=lambda x: x["name"])

    return {
        "boat_name": boat.name,
        "start_date": start_date,
        "end_date": end_date,
        "total_cost": grand_total,
        "employees": valid_employees
    }

# -- Expenses Report --
def get_expenses_report(db: Session, start:date, end:date, boat_id: int=None, emp_id: int=None):
    query = db.query(models.Attendance).filter(
        models.Attendance.date >= start,
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


        multiplier = 0.5 if rec.is_half_day else 1.0 if rec.present else 0.0
        wage = _get_daily_wage(rec) * multiplier
        ot_cost = (rec.overtime_hours or 0.0) * _get_overtime_rate(rec)   
        extra = rec.extra_amount or 0.0

        if (wage > 0 or extra > 0) and (not boat_id or rec.boat_id == boat_id):
            total_sum += (wage + extra)
            report_data.append({
                "date": rec.date, "employee_name": _get_employee_name(rec),
                "boat_name": rec.boat.name if rec.boat else "-",
                "daily_cost": wage + extra, "overtime_cost": 0.0, "total_cost": wage + extra
            })

        if ot_cost > 0 and (not boat_id or rec.overtime_boat_id == boat_id):
            total_sum += ot_cost
            report_data.append({
                "date": rec.date, "employee_name": _get_employee_name(rec),
                "boat_name": (rec.overtime_boat.name + " (Υπερ)") if rec.overtime_boat else "-",
                "daily_cost": 0.0, "overtime_cost": ot_cost, "total_cost": ot_cost
            })

    report_data.sort(key=lambda x: x["date"])
    return {"total_sum": total_sum, "results": report_data}

# -- Attendance --

# -- Attendance (Update or Create) --
def create_attendance(db: Session, attendance: schemas.AttendanceCreate):
    existing_record = db.query(models.Attendance).filter(
        models.Attendance.date == attendance.date,
        models.Attendance.employee_id == attendance.employee_id
    ).first()

    if existing_record:
        if attendance.boat_id is not None: existing_record.boat_id = attendance.boat_id
        if attendance.overtime_boat_id is not None: existing_record.overtime_boat_id = attendance.overtime_boat_id
        if attendance.present is not None: existing_record.present = attendance.present
        if attendance.is_half_day is not None: existing_record.is_half_day = attendance.is_half_day
        if attendance.overtime_hours is not None: existing_record.overtime_hours = attendance.overtime_hours
        if attendance.extra_amount is not None: existing_record.extra_amount = attendance.extra_amount
        if attendance.extra_reason is not None: existing_record.extra_reason = attendance.extra_reason
        db.commit()
        db.refresh(existing_record)
        return existing_record

    employee = db.query(models.Employee).filter(
        models.Employee.id == attendance.employee_id
    ).first()

    db_attendance = models.Attendance(
        date = attendance.date, employee_id = attendance.employee_id,
        boat_id = attendance.boat_id,
        overtime_boat_id = attendance.overtime_boat_id,
        present = attendance.present if attendance.present is not None else False,
        is_half_day = attendance.is_half_day if attendance.is_half_day is not None else False,
        overtime_hours = attendance.overtime_hours if attendance.overtime_hours is not None else 0.0,
        extra_amount = attendance.extra_amount if attendance.extra_amount is not None else 0.0,
        extra_reason = attendance.extra_reason if attendance.extra_reason is not None else "",
        daily_wage_snapshot = employee.daily_wage if employee else None,
        overtime_rate_snapshot = employee.overtime_rate if employee else None,
        bank_daily_amount_snapshot = employee.bank_daily_amount if employee else None,
        employee_name_snapshot = employee.name if employee else None,
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

    period_length = (end - start).days + 1
    max_bank_days = 26 if period_length > 16 else 13

    for emp in employees:
        records = db.query(models.Attendance).filter(
            models.Attendance.employee_id == emp.id,
            models.Attendance.date >= start,
            models.Attendance.date <= end
        ).order_by(models.Attendance.date).all()

        days_worked = 0.0
        sum_wage = 0.0
        sum_overtime = 0.0
        sum_overtime_hours = 0.0
        sum_extra = 0.0
        reasons_list = []

        bank_days_used = 0.0
        target_bank = 0.0

        for rec in records:
            if rec.present or rec.is_half_day:
                multiplier = 0.5 if rec.is_half_day else 1.0
                days_worked += multiplier

                # Μισθός με snapshot
                sum_wage += _get_daily_wage(rec) * multiplier

                # Τράπεζα με snapshot + cap
                if bank_days_used < max_bank_days:
                    remaining = max_bank_days - bank_days_used
                    eligible = min(multiplier, remaining)
                    target_bank += _get_bank_daily(rec) * eligible
                    bank_days_used += eligible

            if rec.overtime_hours and rec.overtime_hours > 0:
                sum_overtime += rec.overtime_hours * _get_overtime_rate(rec)
                sum_overtime_hours += rec.overtime_hours

            if rec.extra_amount and rec.extra_amount > 0:
                sum_extra += rec.extra_amount
                if rec.extra_reason:
                    reasons_list.append(rec.extra_reason)

        final_reasons = ", ".join(list(set(reasons_list)))
        grand_total = sum_wage + sum_overtime + sum_extra

        if days_worked == 0 and sum_extra == 0 and sum_overtime == 0:
            continue

        # Bank/Cash split
        target_cash = grand_total - target_bank

        if target_cash < 0:
            target_cash = 0
            target_bank = grand_total

        remainder = target_cash % 50

        if target_bank == 0 or target_bank < remainder:
            final_cash = target_cash
            final_bank = target_bank
        else:
            final_cash = target_cash - remainder
            final_bank = grand_total - final_cash

        results.append({
            "employee_id": emp.id,
            "employee_name": emp.name,
            "days_worked": days_worked,
            "total_wage": sum_wage,
            "total_overtime_hours": sum_overtime_hours,
            "total_overtime": sum_overtime,
            "total_extra": sum_extra,
            "extra_reasons": final_reasons,
            "grand_total": grand_total,
            "bank_pay": final_bank,
            "cash_pay": final_cash
        })

    return {"start_date": start, "end_date": end, "payments": results}


# -- Materials --

def get_materials(db: Session):
    return db.query(models.Material).all()

def create_material(db: Session, material: schemas.MaterialCreate):
    db_material = models.Material(
        name = material.name,
        category = material.category,
        unit = material.unit,
        price = material.price
    )
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material

def update_material(db: Session, material_id: int, material: schemas.MaterialCreate):
    db_material = db.query(models.Material).filter(models.Material.id == material_id).first()
    if not db_material:
        return None
    db_material.name = material.name
    db_material.category = material.category
    db_material.unit = material.unit
    db_material.price = material.price
    db.commit()
    db.refresh(db_material)
    return db_material

def delete_material(db: Session, material_id: int):
    db_material = db.query(models.Material).filter(models.Material.id == material_id).first()
    if not db_material:
        return None
    db.delete(db_material)
    db.commit()
    return db_material


# -- Material Usage --

def get_material_usages(db: Session):
    return db.query(models.MaterialUsage).order_by(
        models.MaterialUsage.date.desc(),
        models.MaterialUsage.id.desc()
    ).all()

def create_material_usage(db: Session, usage: schemas.MaterialUsageCreate):

    existing = db.query(models.MaterialUsage).filter(
        models.MaterialUsage.date == usage.date,
        models.MaterialUsage.material_id == usage.material_id,
        models.MaterialUsage.boat_id == usage.boat_id
    ).first()

    if existing:
        existing.quantity += usage.quantity
        existing.unit_price = usage.unit_price         
        existing.total_price = existing.quantity * existing.unit_price
        db.commit()
        db.refresh(existing)
        return existing

    db_usage = models.MaterialUsage(
        date=usage.date,
        material_id=usage.material_id,
        boat_id=usage.boat_id,
        quantity=usage.quantity,
        unit_price=usage.unit_price,
        total_price=usage.total_price
    )
    db.add(db_usage)
    db.commit()
    db.refresh(db_usage)
    return db_usage

def update_material_usage(db: Session, usage_id: int, usage_data: schemas.MaterialUsageCreate):
    db_usage = db.query(models.MaterialUsage).filter(models.MaterialUsage.id == usage_id).first()
    if not db_usage:
        return None
    db_usage.date = usage_data.date
    db_usage.material_id = usage_data.material_id
    db_usage.boat_id = usage_data.boat_id
    db_usage.quantity = usage_data.quantity
    db_usage.unit_price = usage_data.unit_price
    db_usage.total_price = usage_data.total_price
    db.commit()
    db.refresh(db_usage)
    return db_usage

def delete_material_usage(db: Session, usage_id: int):
    db_usage = db.query(models.MaterialUsage).filter(models.MaterialUsage.id == usage_id).first()
    if not db_usage:
        return None
    db.delete(db_usage)
    db.commit()
    return db_usage


# -- Suppliers --

def get_suppliers(db: Session):
    return db.query(models.Supplier).order_by(models.Supplier.name).all()

def create_supplier(db: Session, supplier: schemas.SupplierCreate):
    db_supplier = models.Supplier(
        name=supplier.name,
        afm=supplier.afm,
        phone=supplier.phone,
        email=supplier.email,
        notes=supplier.notes
    )
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

def update_supplier(db: Session, supplier_id: int, supplier_data: schemas.SupplierCreate):
    db_supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if not db_supplier:
        return None
    db_supplier.name = supplier_data.name
    db_supplier.afm = supplier_data.afm
    db_supplier.phone = supplier_data.phone
    db_supplier.email = supplier_data.email
    db_supplier.notes = supplier_data.notes
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

def delete_supplier(db: Session, supplier_id: int):
    db_supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if not db_supplier:
        return None
    db.delete(db_supplier)
    db.commit()
    return db_supplier


# -- Generic NamedItem helpers (InvoiceCategory / MaterialUnit / MaterialCategory) --

def get_named_items(db: Session, model):
    return db.query(model).order_by(model.name).all()

def create_named_item(db: Session, model, name: str):
    item = model(name=name)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

def update_named_item(db: Session, model, item_id: int, name: str):
    item = db.query(model).filter(model.id == item_id).first()
    if not item:
        return None
    item.name = name
    db.commit()
    db.refresh(item)
    return item

def delete_named_item(db: Session, model, item_id: int):
    item = db.query(models.MaterialUnit).filter(models.MaterialUnit.id == item_id).first() if model is models.MaterialUnit else \
               db.query(model).filter(model.id == item_id).first()
    if not item:
        return None
    db.delete(item)
    db.commit()
    return item

# -- Invoices --

def get_invoices(db: Session):
    return db.query(models.Invoice).order_by(
        models.Invoice.date.desc(),
        models.Invoice.id.desc()
    ).all()

def create_invoice(db: Session, invoice: schemas.InvoiceCreate):
    db_invoice = models.Invoice(
        date=invoice.date,
        amount=invoice.amount,
        supplier_id=invoice.supplier_id,
        boat_id=invoice.boat_id
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def update_invoice(db: Session, invoice_id: int, invoice_data: schemas.InvoiceCreate):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not db_invoice:
        return None
    db_invoice.date = invoice_data.date
    db_invoice.amount = invoice_data.amount
    db_invoice.supplier_id = invoice_data.supplier_id
    db_invoice.boat_id = invoice_data.boat_id
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def delete_invoice(db: Session, invoice_id: int):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not db_invoice:
        return None
    db.delete(db_invoice)
    db.commit()
    return db_invoice


def _attendance_cost(rec) -> float:
    """Calculate cost for attendance using snapshots."""
    cost = 0.0
    if rec.present or rec.is_half_day:
        mult = 0.5 if rec.is_half_day else 1.0
        cost += _get_daily_wage(rec) * mult
    if rec.overtime_hours and rec.overtime_hours > 0:
        cost += rec.overtime_hours * _get_overtime_rate(rec)
    if rec.extra_amount and rec.extra_amount > 0:
        cost += rec.extra_amount
    return cost


# -- Dashboard --

def get_dashboard_data(db: Session, year: int, month: int):
    # ---------- Ranges ----------
    start = date(year, month, 1)
    if month == 12:
        end = date(year, 12, 31)
    else:
        end = date(year, month + 1, 1) - timedelta(days=1)

    if month == 1:
        prev_start = date(year - 1, 12, 1)
        prev_end = date(year - 1, 12, 31)
    else:
        prev_start = date(year, month - 1, 1)
        prev_end = start - timedelta(days=1)

    # ---------- Current month records ----------
    month_att = db.query(models.Attendance).filter(
        models.Attendance.date >= start,
        models.Attendance.date <= end,
    ).all()

    month_usages = db.query(models.MaterialUsage).filter(
        models.MaterialUsage.date >= start,
        models.MaterialUsage.date <= end,
    ).all()

    month_invoices = db.query(models.Invoice).filter(
        models.Invoice.date >= start,
        models.Invoice.date <= end,
    ).all()

    # ---------- Current month totals ----------
    payroll_total = sum(_attendance_cost(r) for r in month_att)
    materials_total = sum(u.total_price for u in month_usages)
    invoices_total = sum(i.amount for i in month_invoices)
    grand_total = payroll_total + materials_total + invoices_total

    # ---------- Previous month totals ----------
    prev_att = db.query(models.Attendance).filter(
        models.Attendance.date >= prev_start,
        models.Attendance.date <= prev_end,
    ).all()
    prev_usages = db.query(models.MaterialUsage).filter(
        models.MaterialUsage.date >= prev_start,
        models.MaterialUsage.date <= prev_end,
    ).all()
    prev_invoices = db.query(models.Invoice).filter(
        models.Invoice.date >= prev_start,
        models.Invoice.date <= prev_end,
    ).all()

    prev_total = (
        sum(_attendance_cost(r) for r in prev_att)
        + sum(u.total_price for u in prev_usages)
        + sum(i.amount for i in prev_invoices)
    )

    # ---------- Daily trend ----------
    daily: dict = {}
    d = start
    while d <= end:
        daily[d] = {"payroll": 0.0, "materials": 0.0, "invoices": 0.0}
        d += timedelta(days=1)

    for rec in month_att:
        cost = _attendance_cost(rec)
        if cost > 0 and rec.date in daily:
            daily[rec.date]["payroll"] += cost

    for u in month_usages:
        if u.date in daily:
            daily[u.date]["materials"] += u.total_price

    for inv in month_invoices:
        if inv.date in daily:
            daily[inv.date]["invoices"] += inv.amount

    daily_trend = [
        {"date": day.isoformat(), **vals}
        for day, vals in sorted(daily.items())
    ]

    # ---------- Today status ----------
    today = date.today()
    today_count = db.query(models.Attendance).filter(
        models.Attendance.date == today,
        models.Attendance.employee_id.isnot(None),
    ).count()

    today_status = {
        "date": today,
        "attendance_recorded": today_count > 0,
    }

    # ---------- Boats ranking YTD ----------
    ytd_start = date(year, 1, 1)
    ytd_end = today

    boat_totals = {
        b.id: {"boat_id": b.id, "boat_name": b.name, "total": 0.0}
        for b in db.query(models.Boat).all()
    }

    # Payroll costs (split between main boat + overtime boat)
    ytd_att = db.query(models.Attendance).filter(
        models.Attendance.date >= ytd_start,
        models.Attendance.date <= ytd_end,
    ).all()

    for rec in ytd_att:


        if rec.boat_id and rec.boat_id in boat_totals:
            daily_cost = 0.0
            if rec.present or rec.is_half_day:
                mult = 0.5 if rec.is_half_day else 1.0
                daily_cost += _get_daily_wage(rec) * mult
            daily_cost += rec.extra_amount or 0.0
            boat_totals[rec.boat_id]["total"] += daily_cost

        if rec.overtime_boat_id and rec.overtime_boat_id in boat_totals:
            if rec.overtime_hours and rec.overtime_hours > 0:
                boat_totals[rec.overtime_boat_id]["total"] += (
                    rec.overtime_hours * _get_overtime_rate(rec)
                )
    # Materials YTD
    ytd_usages = db.query(models.MaterialUsage).filter(
        models.MaterialUsage.date >= ytd_start,
        models.MaterialUsage.date <= ytd_end,
    ).all()
    for u in ytd_usages:
        if u.boat_id in boat_totals:
            boat_totals[u.boat_id]["total"] += u.total_price

    # Invoices YTD
    ytd_invoices = db.query(models.Invoice).filter(
        models.Invoice.date >= ytd_start,
        models.Invoice.date <= ytd_end,
    ).all()
    for inv in ytd_invoices:
        if inv.boat_id in boat_totals:
            boat_totals[inv.boat_id]["total"] += inv.amount

    boats_ranking = sorted(
        boat_totals.values(),
        key=lambda x: x["total"],
        reverse=True,
    )[:5]

    return {
        "month": f"{year}-{month:02d}",
        "total": grand_total,
        "prev_month_total": prev_total,
        "breakdown": {
            "employees": payroll_total,
            "materials": materials_total,
            "invoices": invoices_total,
        },
        "daily_trend": daily_trend,
        "today_status": today_status,
        "boats_ranking": boats_ranking,
    }

# -- Attendance Report --

def get_attendance_report(db: Session, start: date, end: date, employee_id: Optional[int] = None):
    query = db.query(models.Attendance).filter(
        models.Attendance.date >= start,
        models.Attendance.date <= end,
    )
    if employee_id:
        query = query.filter(models.Attendance.employee_id == employee_id)

    records = query.order_by(models.Attendance.date).all()

    results = []
    total = 0.0

    for rec in records:


        if rec.is_half_day:
            mult = 0.5
        elif rec.present:
            mult = 1.0
        else:
            mult = 0.0

        daily_wage = _get_daily_wage(rec) * mult                             
        overtime_cost = (rec.overtime_hours or 0.0) * _get_overtime_rate(rec)  
        extra = rec.extra_amount or 0.0
        total_cost = daily_wage + overtime_cost + extra

        if total_cost == 0 and not rec.is_half_day and not rec.present:
            continue

        boat_name = rec.boat.name if rec.boat else None

        results.append({
            "id": rec.id,
            "date": rec.date,
            "employee_id": rec.employee_id,
            "employee_name": _get_employee_name(rec),
            "boat_id": rec.boat_id,
            "boat_name": boat_name,
            "is_half_day": bool(rec.is_half_day),
            "overtime_hours": rec.overtime_hours or 0.0,
            "daily_wage": daily_wage,
            "overtime_cost": overtime_cost,
            "extra_amount": extra,
            "extra_reason": rec.extra_reason,
            "total_cost": total_cost,
        })
        total += total_cost

    return {"start": start, "end": end, "total": total, "records": results}


# -- Aggregations for PDF export --

def _build_usage_filter_text(db: Session, material_id, category, boat_id) -> str:
    parts = []
    if material_id:
        mat = db.query(models.Material).filter(models.Material.id == material_id).first()
        if mat:
            parts.append(f"Υλικό: {mat.name}")
    if category:
        parts.append(f"Κατηγορία: {category}")
    if boat_id:
        boat = db.query(models.Boat).filter(models.Boat.id == boat_id).first()
        if boat:
            parts.append(f"Σκάφος: {boat.name}")
    return " | ".join(parts)


def get_material_usages_aggregate(
    db: Session,
    start: date,
    end: date,
    material_id: Optional[int] = None,
    category: Optional[str] = None,
    boat_id: Optional[int] = None,
):
    query = db.query(models.MaterialUsage).filter(
        models.MaterialUsage.date >= start,
        models.MaterialUsage.date <= end,
    )

    if material_id:
        query = query.filter(models.MaterialUsage.material_id == material_id)
    if boat_id:
        query = query.filter(models.MaterialUsage.boat_id == boat_id)

    records = query.all()

    agg: dict = {}
    for rec in records:
        if not rec.material:
            continue
        if category and rec.material.category != category:
            continue

        key = (rec.material_id, rec.boat_id)
        if key not in agg:
            agg[key] = {
                "material_name": rec.material.name,
                "unit": rec.material.unit,
                "category": rec.material.category,
                "boat_name": rec.boat.name if rec.boat else "-",
                "quantity": 0.0,
                "total": 0.0,
            }
        agg[key]["quantity"] += rec.quantity or 0.0
        agg[key]["total"] += rec.total_price or 0.0

    items = list(agg.values())
    items.sort(key=lambda x: (x["material_name"], x["boat_name"]))

    return {
        "start": start,
        "end": end,
        "total": sum(i["total"] for i in items),
        "filter_text": _build_usage_filter_text(db, material_id, category, boat_id),
        "items": items,
    }


def _build_invoice_filter_text(db: Session, supplier_id, boat_id) -> str:
    parts = []
    if supplier_id:
        s = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
        if s:
            parts.append(f"Προμηθευτής: {s.name}")
    if boat_id:
        b = db.query(models.Boat).filter(models.Boat.id == boat_id).first()
        if b:
            parts.append(f"Σκάφος: {b.name}")
    return " | ".join(parts)


def get_invoices_aggregate(
    db: Session,
    start: date,
    end: date,
    supplier_id: Optional[int] = None,
    boat_id: Optional[int] = None,
):
    query = db.query(models.Invoice).filter(
        models.Invoice.date >= start,
        models.Invoice.date <= end,
    )

    if supplier_id:
        query = query.filter(models.Invoice.supplier_id == supplier_id)
    if boat_id:
        query = query.filter(models.Invoice.boat_id == boat_id)

    records = query.all()

    agg: dict = {}
    for rec in records:
        key = (rec.supplier_id, rec.boat_id)
        if key not in agg:
            agg[key] = {
                "supplier_name": rec.supplier.name if rec.supplier else "-",
                "boat_name": rec.boat.name if rec.boat else "-",
                "total": 0.0,
                "count": 0,
            }
        agg[key]["total"] += rec.amount or 0.0
        agg[key]["count"] += 1

    items = list(agg.values())
    items.sort(key=lambda x: (x["supplier_name"], x["boat_name"]))

    return {
        "start": start,
        "end": end,
        "total": sum(i["total"] for i in items),
        "filter_text": _build_invoice_filter_text(db, supplier_id, boat_id),
        "items": items,
    }   

def get_last_attendance_before(db: Session, target_date: date):
    """Επιστρέφει την τελευταία μέρα με attendance πριν την target_date."""
    last_date_row = db.query(models.Attendance.date).filter(
        models.Attendance.date < target_date,
        models.Attendance.employee_id.isnot(None),
    ).order_by(models.Attendance.date.desc()).first()

    if not last_date_row:
        return None

    last_date = last_date_row[0]
    records = db.query(models.Attendance).filter(
        models.Attendance.date == last_date,
        models.Attendance.employee_id.isnot(None),
    ).all()

    return {
        "date": last_date,
        "records": [
            {
                "employee_id": r.employee_id,
                "boat_id": r.boat_id,
                "present": bool(r.present),
                "is_half_day": bool(r.is_half_day),
            }
            for r in records
        ]
    }