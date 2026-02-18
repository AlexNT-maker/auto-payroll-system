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
