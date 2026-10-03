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
    employee_id: Optional[int] = None
    boat_id: Optional[int] = None
    overtime_boat_id: Optional[int] = None
    present: bool = False
    is_half_day: bool = False
    overtime_hours: float = 0.0
    extra_amount: float = 0.0
    extra_reason: Optional[str] = None
    daily_wage_snapshot: Optional[float] = None
    overtime_rate_snapshot: Optional[float] = None
    bank_daily_amount_snapshot: Optional[float] = None
    employee_name_snapshot: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    boat_id: Optional[int] = None
    overtime_boat_id: Optional[int] = None
    present: Optional[bool] = None
    is_half_day: Optional[bool] = None
    overtime_hours: Optional[float] = None
    extra_amount: Optional[float] = None
    extra_reason: Optional[str] = None

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
    days_worked: float
    total_wage: float 
    total_overtime_hours: float
    total_overtime: float
    total_extra: float
    extra_reasons: str
    grand_total: float
    bank_pay: float
    cash_pay: float

class PayrollReport (BaseModel):
    start_date: date
    end_date: date 
    payments: List[PaymentItem]

# -- Schemas for materials --

class MaterialBase(BaseModel):
    name: str
    category: str
    unit: str
    price: float

class MaterialCreate(MaterialBase):
    pass

class Material(MaterialBase):
    id: int

    class Config:
        from_attributes = True


class MaterialUsageBase(BaseModel):
    date: date
    material_id: int
    boat_id: int
    quantity: float
    unit_price: float
    total_price: float

class MaterialUsageCreate(MaterialUsageBase):
    pass

class MaterialUsage(MaterialUsageBase):
    id: int

    class Config:
        from_attributes = True


# -- Schemas for suppliers --

class SupplierBase(BaseModel):
    name: str
    afm: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class Supplier(SupplierBase):
    id: int

    class Config:
        from_attributes = True


# -- Schemas for simple named items (κατηγορίες / μονάδες) --

class NamedItemBase(BaseModel):
    name: str

class NamedItemCreate(NamedItemBase):
    pass

class NamedItem(NamedItemBase):
    id: int

    class Config:
        from_attributes = True


# -- Schemas for invoices --

class InvoiceBase(BaseModel):
    date: date
    amount: float
    supplier_id: int
    boat_id: int

class InvoiceCreate(InvoiceBase):
    pass

class Invoice(InvoiceBase):
    id: int

    class Config:
        from_attributes = True

# -- Schemas for dashboard --

class DashboardBreakdown(BaseModel):
    employees: float
    materials: float
    invoices: float


class DashboardDailyPoint(BaseModel):
    date: date
    payroll: float
    materials: float
    invoices: float


class DashboardTodayStatus(BaseModel):
    date: date
    attendance_recorded: bool


class BoatRankingItem(BaseModel):
    boat_id: int
    boat_name: str
    total: float


class DashboardResponse(BaseModel):
    month: str
    total: float
    prev_month_total: float
    breakdown: DashboardBreakdown
    daily_trend: List[DashboardDailyPoint]
    today_status: DashboardTodayStatus
    boats_ranking: List[BoatRankingItem]


# -- Schemas for attendance report (per employee) --

class AttendanceReportItem(BaseModel):
    id: int
    date: date
    employee_id: Optional[int] = None
    employee_name: str
    boat_id: Optional[int] = None
    boat_name: Optional[str] = None
    is_half_day: bool = False
    overtime_hours: float = 0.0
    daily_wage: float = 0.0
    overtime_cost: float = 0.0
    extra_amount: float = 0.0
    extra_reason: Optional[str] = None
    total_cost: float = 0.0


class AttendanceReportResponse(BaseModel):
    start: date
    end: date
    total: float
    records: List[AttendanceReportItem]


class LastAttendanceItem(BaseModel):
    employee_id: int
    boat_id: Optional[int] = None
    present: bool = False
    is_half_day: bool = False


class LastAttendanceResponse(BaseModel):
    date: date
    records: List[LastAttendanceItem]