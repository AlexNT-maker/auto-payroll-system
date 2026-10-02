import sqlite3
from pathlib import Path

def upgrade():
    db_path = Path(__file__).resolve().parent / "payroll.db"
    print(f"📂 Opening DB: {db_path}")

    if not db_path.exists():
        print(f"❌ Δεν βρέθηκε το payroll.db στο {db_path}")
        return

    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()

    try:
        cursor.execute("ALTER TABLE attendance ADD COLUMN employee_name_snapshot VARCHAR;")
        print("✅ Added column: employee_name_snapshot")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("ℹ️  Column already exists")
        else:
            print(f"❌ Error: {e}")
            conn.close()
            return

    cursor.execute("""
        UPDATE attendance
        SET employee_name_snapshot = (
            SELECT name FROM employees WHERE employees.id = attendance.employee_id
        )
        WHERE employee_name_snapshot IS NULL
          AND attendance.employee_id IS NOT NULL
    """)

    updated = cursor.rowcount
    conn.commit()
    conn.close()
    print(f"\n✅ Migration complete. Updated {updated} records.")


if __name__ == "__main__":
    upgrade()