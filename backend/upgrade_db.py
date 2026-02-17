import sqlite3

def upgrade():
    conn = sqlite3.connect('payroll.db')
    cursor = conn.cursor()

    try:
        cursor.execute("ALTER TABLE attendance ADD COLUMN is_half_day BOOLEAN DEFAULT 0;")
        conn.commit()
        print("Success: Database has been upgrade with half day section")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("The column half day already exists")
        else:
            print(f"Σφάλμα: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    upgrade()