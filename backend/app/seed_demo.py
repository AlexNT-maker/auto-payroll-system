"""
Demo data seeder for the Boat Repair ERP.

Generates realistic fake data for demo/deployment purposes.
Deterministic: same data every run (fixed random seed).

CLI usage:
    python -m app.seed_demo            # seed only if empty
    python -m app.seed_demo --reset    # wipe + re-seed

Programmatic usage:
    from .seed_demo import seed_all
    seed_all(reset=False)
"""

import random
import sys
from datetime import date, timedelta

from .database import SessionLocal, engine
from . import models

# Fixed seed -> deterministic output (same demo data every restart)
SEED = 42

# ============================================================
# DATA POOLS
# ============================================================

EMPLOYEE_NAMES = [
    "Γιώργος Παπαδόπουλος",
    "Νίκος Αντωνίου",
    "Γιάννης Γεωργίου",
    "Δημήτρης Νικολάου",
    "Κώστας Βασιλείου",
    "Βασίλης Ιωάννου",
    "Παναγιώτης Οικονόμου",
    "Χρήστος Κωνσταντίνου",
    "Αντώνης Αθανασίου",
    "Μανώλης Μακρής",
    "Στέλιος Κουτσός",
    "Θανάσης Φωτόπουλος",
    "Ηλίας Ρούσσος",
    "Σπύρος Καραγιάννης",
    "Μιχάλης Ζέρβας",
]

BOAT_NAMES = [
    "ΑΡΤΕΜΙΣ",
    "ΠΟΣΕΙΔΩΝ",
    "ΘΑΛΑΣΣΑ",
    "ΑΙΓΑΙΟΝ",
    "ΟΔΥΣΣΕΑΣ",
]

SUPPLIERS = [
    ("Marine Paints SA", "123456789"),
    ("Nautical Supplies Ltd", "234567890"),
    ("Aegean Ship Chandlers", "345678901"),
    ("Poseidon Marine", "456789012"),
    ("Hellenic Boat Equipment", "567890123"),
    ("Attiki Marine Products", "678901234"),
    ("Piraeus Yacht Supplies", "789012345"),
    ("Mediterranean Yacht Services", "890123456"),
]

# (name, category, unit, (min_price, max_price))
MATERIALS = [
    ("Antifouling Primer", "Χρώματα", "5L", (45, 75)),
    ("Top Coat White", "Χρώματα", "5L", (55, 90)),
    ("Epoxy Primer", "Χρώματα", "5L", (65, 100)),
    ("Varnish Gloss", "Χρώματα", "1L", (18, 35)),
    ("Anti-Slip Paint", "Χρώματα", "5L", (60, 85)),
    ("Sanding Discs 120", "Αναλώσιμα", "PCS", (2, 5)),
    ("Sanding Discs 240", "Αναλώσιμα", "PCS", (2, 5)),
    ("Masking Tape", "Αναλώσιμα", "PCS", (3, 8)),
    ("Paint Brushes", "Αναλώσιμα", "PCS", (4, 12)),
    ("Paint Rollers", "Αναλώσιμα", "PCS", (5, 15)),
    ("Nitrile Gloves", "Αναλώσιμα", "SET", (8, 18)),
    ("Respirator Filters", "Αναλώσιμα", "SET", (15, 35)),
    ("Mixing Cups", "Αναλώσιμα", "PCS", (1, 3)),
    ("Thinner Standard", "Διαλυτικά είδη", "5L", (18, 30)),
    ("Acetone", "Διαλυτικά είδη", "5L", (22, 38)),
    ("White Spirit", "Διαλυτικά είδη", "5L", (15, 25)),
    ("Epoxy Cleaner", "Διαλυτικά είδη", "3L", (25, 45)),
    ("Polish Compound", "Γυαλιστικά είδη", "1L", (25, 45)),
    ("Carnauba Wax", "Γυαλιστικά είδη", "1L", (30, 55)),
    ("Buffing Pads", "Γυαλιστικά είδη", "PCS", (8, 20)),
    ("Microfiber Cloths", "Γυαλιστικά είδη", "PCS", (3, 8)),
]

EXTRA_REASONS = [
    "Καθαρισμός σκάφους",
    "Έκτακτη βάρδια",
    "Μεταφορά υλικών",
    "Αλλαγή λαδιών",
    "Νυχτερινή εργασία",
]

MATERIAL_UNITS = ["GAL", "KG", "PCS", "M", "5L", "1L", "3L", "SET"]
MATERIAL_CATEGORIES = ["Χρώματα", "Αναλώσιμα", "Διαλυτικά είδη", "Γυαλιστικά είδη"]
INVOICE_CATEGORIES = [
    "Καύσιμα", "Τρόφιμα & Προμήθειες",
    "Συντήρηση & Ανταλλακτικά", "Εξοπλισμός",
    "Υπηρεσίες", "Άλλο",
]

# ============================================================
# LOOKUP TABLES
# ============================================================

def seed_lookups(db):
    for name in MATERIAL_UNITS:
        db.add(models.MaterialUnit(name=name))

    for name in MATERIAL_CATEGORIES:
        db.add(models.MaterialCategory(name=name))

    for name in INVOICE_CATEGORIES:
        db.add(models.InvoiceCategory(name=name))

    db.commit()


# ============================================================
# CORE ENTITIES
# ============================================================

def seed_employees(db):
    employees = []
    for name in EMPLOYEE_NAMES:
        daily = round(random.uniform(55, 75), 2)
        ot_rate = round(daily * 0.15, 2)
        bank = round(daily * 0.7, 2)

        emp = models.Employee(
            name=name,
            daily_wage=daily,
            overtime_rate=ot_rate,
            bank_daily_amount=bank,
        )
        db.add(emp)
        employees.append(emp)

    db.commit()
    for e in employees:
        db.refresh(e)
    return employees


def seed_boats(db):
    boats = []
    for name in BOAT_NAMES:
        boat = models.Boat(name=name)
        db.add(boat)
        boats.append(boat)

    db.commit()
    for b in boats:
        db.refresh(b)
    return boats


def seed_suppliers(db):
    suppliers = []
    for name, afm in SUPPLIERS:
        s = models.Supplier(
            name=name,
            afm=afm,
            phone=f"21{random.randint(10000000, 99999999)}",
            email=f"info@{name.lower().replace(' ', '')}.gr",
            notes=None,
        )
        db.add(s)
        suppliers.append(s)

    db.commit()
    for s in suppliers:
        db.refresh(s)
    return suppliers


def seed_materials(db):
    materials = []
    for name, category, unit, (lo, hi) in MATERIALS:
        m = models.Material(
            name=name,
            category=category,
            unit=unit,
            price=round(random.uniform(lo, hi), 2),
        )
        db.add(m)
        materials.append(m)

    db.commit()
    for m in materials:
        db.refresh(m)
    return materials


# ============================================================
# TRANSACTIONAL DATA
# ============================================================

def seed_attendance(db, employees, boats, start, end):
    """Generate attendance records for every working day (Mon-Sat)."""
    d = start
    count = 0

    while d <= end:
        if d.weekday() == 6:      # Skip Sundays
            d += timedelta(days=1)
            continue

        for emp in employees:
            roll = random.random()

            if roll < 0.08:
                continue                                  # 8% absent
            elif roll < 0.15:
                present, is_half = False, True            # 7% half day
            else:
                present, is_half = True, False            # 85% present

            boat = random.choice(boats)

            # Overtime: 20% chance
            if random.random() < 0.20:
                ot_hours = random.choice([1.0, 1.5, 2.0, 2.5, 3.0])
                if random.random() < 0.70:
                    ot_boat = boat
                else:
                    others = [b for b in boats if b.id != boat.id]
                    ot_boat = random.choice(others)
            else:
                ot_hours = 0.0
                ot_boat = None

            # Extra: 5% chance
            if random.random() < 0.05:
                extra_amt = round(random.uniform(10, 50), 2)
                extra_reason = random.choice(EXTRA_REASONS)
            else:
                extra_amt = 0.0
                extra_reason = ""

            rec = models.Attendance(
                date=d,
                employee_id=emp.id,
                boat_id=boat.id,
                overtime_boat_id=ot_boat.id if ot_boat else None,
                present=present,
                is_half_day=is_half,
                overtime_hours=ot_hours,
                extra_amount=extra_amt,
                extra_reason=extra_reason,
                daily_wage_snapshot=emp.daily_wage,
                overtime_rate_snapshot=emp.overtime_rate,
                bank_daily_amount_snapshot=emp.bank_daily_amount,
                employee_name_snapshot=emp.name,
            )
            db.add(rec)
            count += 1

        if d.day == 1:
            db.commit()

        d += timedelta(days=1)

    db.commit()
    return count


def seed_material_usages(db, materials, boats, start, end):
    d = start
    count = 0

    while d <= end:
        if random.random() < 0.40:
            for _ in range(random.randint(1, 3)):
                material = random.choice(materials)
                boat = random.choice(boats)
                qty = round(random.uniform(0.5, 5.0), 1)
                total = round(qty * material.price, 2)

                db.add(models.MaterialUsage(
                    date=d,
                    material_id=material.id,
                    boat_id=boat.id,
                    quantity=qty,
                    unit_price=material.price,
                    total_price=total,
                ))
                count += 1

        if d.day == 1:
            db.commit()

        d += timedelta(days=1)

    db.commit()
    return count


def seed_invoices(db, suppliers, boats, start, end):
    d = start
    count = 0

    while d <= end:
        if random.random() < 0.20:
            supplier = random.choice(suppliers)
            boat = random.choice(boats)
            amount = round(random.uniform(150, 1500), 2)

            db.add(models.Invoice(
                date=d,
                amount=amount,
                supplier_id=supplier.id,
                boat_id=boat.id,
            ))
            count += 1

        if d.day == 1:
            db.commit()

        d += timedelta(days=1)

    db.commit()
    return count


# ============================================================
# MAIN
# ============================================================

def seed_all(reset: bool = False) -> None:
    """
    Seed the database with demo data.

    Args:
        reset: if True, wipe all data first (drop + recreate tables).
    """
    db = SessionLocal()
    try:
        if reset:
            print("[seed] Resetting database...")
            models.Base.metadata.drop_all(bind=engine)
            models.Base.metadata.create_all(bind=engine)
        else:
            if db.query(models.Employee).count() > 0:
                print("[seed] Database already seeded. Skipping.")
                return

        # Deterministic output
        random.seed(SEED)

        print("[seed] Creating lookups...")
        seed_lookups(db)

        print("[seed] Creating employees...")
        employees = seed_employees(db)

        print("[seed] Creating boats...")
        boats = seed_boats(db)

        print("[seed] Creating suppliers...")
        suppliers = seed_suppliers(db)

        print("[seed] Creating materials...")
        materials = seed_materials(db)

        today = date.today()
        end = today
        start = today - timedelta(days=365)

        print(f"[seed] Generating transactional data from {start} to {end}...")

        att_count = seed_attendance(db, employees, boats, start, end)
        usage_count = seed_material_usages(db, materials, boats, start, end)
        inv_count = seed_invoices(db, suppliers, boats, start, end)

        print()
        print("=" * 55)
        print("  Seeding complete")
        print("=" * 55)
        print(f"  Employees:        {len(employees)}")
        print(f"  Boats:            {len(boats)}")
        print(f"  Suppliers:        {len(suppliers)}")
        print(f"  Materials:        {len(materials)}")
        print(f"  Attendance:       {att_count}")
        print(f"  Material usages:  {usage_count}")
        print(f"  Invoices:         {inv_count}")
        print("=" * 55)
        print()

    except Exception as e:
        db.rollback()
        print(f"[seed] FAILED: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    reset_flag = "--reset" in sys.argv
    seed_all(reset=reset_flag)