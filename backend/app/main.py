from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from fastapi.responses import StreamingResponse
from . import crud, models, schemas, pdf_utils
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine) # Creates the base if not exists
app = FastAPI()

# Here we will define who is allowed to talk with our frontend
origins = [
    "http://localhost:5173" , # Our frontend adrees
    "http://127.0.0.1:5173" , # Alternative adress of our frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins ,  # We allow only the origins of the uplist
    allow_credentials = True , # Enables cookies / auth headers
    allow_methods = ["*"] , # We allow all the request methods
    allow_headers = ["*"] , # We allow all kind of headers
)

# -- Dependency --

# Creates a connection at base for every request. Also close the base when request has finish.
def get_db():
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()

# -- Routes --

@app.get("/")
def read_root():
    return{"message" : "API works fine"}

# 1. -- Employee --
# When we read the database we will ask from the code to bring max 100 registrations
@app.post("/employees/", response_model = schemas.Employee)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    return crud.create_employee(db= db, employee= employee)

@app.get("/employees/", response_model= List[schemas.Employee])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    employees = crud.get_employees(db)
    return employees

@app.put("/employees/{employee_id}", response_model= schemas.Employee)
def update_employee(employee_id: int, employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    updated_employee = crud.update_employee(db, employee_id, employee)
    if updated_employee is None:
        raise HTTPException(status_code= 404, detail= "Ο εργαζόμενος δεν βρέθηκε")
    return updated_employee

@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    deleted_employee = crud.delete_employee(db, employee_id)
    if deleted_employee is None:
        raise HTTPException(status_code=404, detail="Ο εργαζόμενος δεν βρέθηκε")
    return {"message": "Επιτυχής διαγραφή", "name": deleted_employee.name}

# 2. -- Boats --
@app.post("/boats/", response_model= schemas.Boat)
def create_boat(boat: schemas.BoatCreate, db: Session = Depends(get_db)):
    return crud.create_boat(db= db, boat= boat)

@app.get("/boats/", response_model= List[schemas.Boat])
def read_boats(skip: int = 0, limit: int = 100, db: Session =Depends (get_db)):
    boats = crud.get_boats(db)
    return boats

@app.put("/boats/{boat_id}", response_model= schemas.Boat)
def update_boat(boat_id: int, boat: schemas.BoatCreate, db: Session = Depends(get_db)):
    updated_boat = crud.update_boat(db, boat_id, boat)
    if updated_boat is None:
        raise HTTPException(status_code=404, detail="Το σκάφος δεν βρέθηκε")
    return updated_boat

@app.delete("/boats/{boat_id}")
def delete_boat(boat_id: int, db: Session = Depends(get_db)):
    deleted_boat = crud.delete_boat(db, boat_id)
    if deleted_boat is None:
        raise HTTPException(status_code=404, detail="Το σκάφος δεν βρέθηκε")
    return {"message": "Επιτυχής διαγραφή", "name": deleted_boat.name}

@app.get("/boats/{boat_id}/analysis", response_model = schemas.BoatAnalysisResponse)
def get_boat_analysis(boat_id: int, start: date, end: date, db: Session = Depends(get_db)):
    report = crud.get_boat_analysis(db, boat_id, start_date=start, end_date=end)
    if not report:
        raise HTTPException(status_code=404, detail= "Το σκάφος δεν βρέθηκε")
    return report

# 3. -- Attendance --
@app.post("/attendance/", response_model=schemas.Attendance)
def create_attendance_record(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    return crud.create_attendance(db=db, attendance=attendance)

@app.get("/attendance/{target_date}", response_model=List[schemas.Attendance])
def read_attendance_by_date(target_date: date, db: Session = Depends(get_db)):
    return crud.get_attendance_by_date(db, target_date)

# 4. -- Expenses endpoint --
@app.get("/expenses/", response_model=schemas.ExpensesResponse)
def read_expenses(
    start: date, 
    end: date, 
    boat_id: Optional[int] = None, 
    emp_id: Optional[int] = None, 
    db: Session = Depends(get_db)
):
    return crud.get_expenses_report(db, start, end, boat_id, emp_id)

# 5. -- Payment Endpoint -- 
@app.get("/payroll/", response_model= schemas.PayrollReport)
def get_payroll(start: date, end: date, db: Session = Depends(get_db)):
    return crud.calculate_payroll(db, start, end)

# 6. -- PDF Export --
@app.get("/payroll/pdf")
def export_payroll_pdf(start: date, end: date, db: Session = Depends(get_db)):
    payroll_data = crud.calculate_payroll(db, start, end)
    data_dict = {
        "start_date": payroll_data["start_date"],
        "end_date": payroll_data["end_date"],
        "payments": [
            {
                "employee_name": p["employee_name"],
                "days_worked": p["days_worked"],
                "total_wage": p["total_wage"],
                "total_overtime": p["total_overtime"],
                "grand_total": p["grand_total"],
                "bank_pay": p["bank_pay"],
                "cash_pay": p["cash_pay"]
            } 
            for p in payroll_data["payments"]
        ]
    }

    pdf_buffer = pdf_utils.generate_payroll_pdf(data_dict)
    filename = f"payroll_{start}_{end}.pdf"
    return StreamingResponse(
        pdf_buffer, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )