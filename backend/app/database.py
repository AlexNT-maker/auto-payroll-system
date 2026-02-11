from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./payroll.db"  # Creates a file payroll.db at the current path

engine = create_engine (
    SQLALCHEMY_DATABASE_URL, connect_args= {"check_same_thread" : False} # We allow a lot of threads to use the base at the same time
)

SessionLocal = sessionmaker(autocommit = False, autoflush = False, bind = engine) # Not permanent save if the user does not give permission

Base = declarative_base()