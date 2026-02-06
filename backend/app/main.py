from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import crud, models, schemas
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

@app.put("/employees/", response_model= schemas.Employee)
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

# 3. -- Attendance --
@app.post("/attendance", response_model= schemas.Attendance)
def create_attendance_record(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    return crud.create_attendance(db= db, attendance= attendance)