import sqlite3

def upgrade():
    conn = sqlite3.connect('payroll.db')
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE attendance ADD COLUMN overtime_boat_id INTEGER REFERENCES boats(id);")
        conn.commit()
        print("Success")
    except sqlite3.OperationalError as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    upgrade()