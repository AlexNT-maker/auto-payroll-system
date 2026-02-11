from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# -- Schemas for boats -- 

# Basic schema
class BoatBase(BaseModel):
    name: str

class BoatCreate(BoatBase):
    pass 

class Boat(BoatBase):
    id: int

    class Config:
        from_attributes = True  # Allows Pydantic to read SQLAlchemy Models

# -- Schemas for employees --

class EmployeeBase(BaseModel):
    name: str
    daily_wage: float
    overtime_rate: float
    bank_daily_amount: float

class EmployeeCreate(EmployeeBase):
    pass 

class Employee(EmployeeBase):
    id: int

    class Config:
        from_attributes = True

# -- Schemas for attendance --

class AttendanceBase(BaseModel):
    date: date 
    employee_id: int 
    boat_id: int 
    present: bool = False
    overtime_hours: float = 0.0
    extra_amount: float = 0.0
    extra_reason: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    pass

class Attendance(AttendanceBase):
    id: int

    class Config:
        from_attributes = True

# -- Schemas for analysis --
class AnalysisItem(BaseModel):
    date: date
    employee_name: str
    daily_cost: float
    overtime_cost: float 
    total_cost: float

class BoatAnalysisResponse(BaseModel):
    boat_name: str
    total_cost: float
    analysis_data: List[AnalysisItem]

# -- Schemas for expense report --

class ExpenseItem(BaseModel):
    date: date
    employee_name: str 
    boat_name: str 
    daily_cost: float
    overtime_cost: float
    total_cost: float

class ExpensesResponse(BaseModel):
    total_sum: float
    results: List[ExpenseItem]

# -- Schemas for payroll --
class PaymentItem(BaseModel):
    employee_id: int
    employee_name: str
    days_worked: int
    total_wage: float 
    total_overtime: float
    grand_total: float
    bank_pay: float
    cash_pay: float

class PayrollReport (BaseModel):
    start_date: date
    end_date: date 
    payments: List[PaymentItem]
