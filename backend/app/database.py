from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./payroll.db"  # Creates a file payroll.db at the current path

engine = create_engine (
    SQLALCHEMY_DATABASE_URL, connect_args= {"check_same_thread" : False} # We allow a lot of threads to use the base at the same time
)

SessionLocal = sessionmaker(autocommit = False, autoflush = False, bind = engine) # Not permanent save if the user does not give permission

Base = declarative_base()


def ensure_employee_status_columns(database_engine: Engine) -> None:
    columns = {
        column["name"]
        for column in inspect(database_engine).get_columns("employees")
    }

    with database_engine.begin() as connection:
        if "is_active" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE employees "
                    "ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT 1"
                )
            )
        if "is_deleted" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE employees "
                    "ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT 0"
                )
            )