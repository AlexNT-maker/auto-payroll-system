from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Date
from sqlalchemy.orm import relationship
from .database import Base

# -- Board No.1 Employeer --

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key = True, index = True)
    name = Column(String, index = True)
    daily_wage = Column(Float)
    overtime_rate = Column(Float)
    bank_daily_amount = Column(Float)

    attendance_records = relationship("Attendance", back_populates="employee")

# -- Board No.2 Boats --

class Boat(Base):
    __tablename__ = "boats"

    id = Column(Integer, primary_key = True, index = True)
    name = Column(String, unique=True, index=True)

    attendance_records = relationship(
        "Attendance", 
        foreign_keys="[Attendance.boat_id]", 
        back_populates="boat"
    )

# -- Board No.3 Calendar/Attendance --

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key = True, index = True)
    date = Column(Date, index=True)

    employee_id = Column(Integer, ForeignKey("employees.id"))
    boat_id = Column(Integer, ForeignKey("boats.id"))
    overtime_boat_id = Column(Integer, ForeignKey("boats.id"), nullable=True)

    present = Column(Boolean, default=False) 
    is_half_day = Column(Boolean, default=False)
    overtime_hours = Column(Float, default = 0.0)

    extra_amount = Column(Float, default = 0.0)
    extra_reason = Column(String, nullable = True)

    employee = relationship("Employee", back_populates = "attendance_records")
    boat = relationship("Boat", foreign_keys=[boat_id], back_populates = "attendance_records")
    overtime_boat = relationship("Boat", foreign_keys=[overtime_boat_id])

#Snapshots for stable history
    daily_wage_snapshot = Column(Float, nullable=True)
    overtime_rate_snapshot = Column(Float, nullable=True)
    bank_daily_amount_snapshot = Column(Float, nullable=True)

    employee = relationship("Employee", back_populates = "attendance_records")
    boat = relationship("Boat", foreign_keys=[boat_id], back_populates = "attendance_records")
    overtime_boat = relationship("Boat", foreign_keys=[overtime_boat_id])

 # -- Board No.4 Materials --

class Material(Base):
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True)
    unit = Column(String)
    price = Column(Float)


class MaterialUsage(Base):
    __tablename__ = "material_usages"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    material_id = Column(Integer, ForeignKey("materials.id"))
    boat_id = Column(Integer, ForeignKey("boats.id"))

    quantity = Column(Float, default=0.0)
    unit_price = Column(Float, default=0.0)   
    total_price = Column(Float, default=0.0)

    material = relationship("Material")
    boat = relationship("Boat")


# -- Board No.6 Suppliers --

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    afm = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    notes = Column(String, nullable=True)


# -- Board No.7 Invoice Categories --

class InvoiceCategory(Base):
    __tablename__ = "invoice_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)


# -- Board No.8 Material Units --

class MaterialUnit(Base):
    __tablename__ = "material_units"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)


# -- Board No.9 Material Categories --

class MaterialCategory(Base):
    __tablename__ = "material_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)


# -- Board No.10 Invoices --

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True, nullable=False)
    amount = Column(Float, nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    boat_id = Column(Integer, ForeignKey("boats.id"), nullable=False)

    supplier = relationship("Supplier")
    boat = relationship("Boat")