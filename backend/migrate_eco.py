import sqlite3
from database import engine, Base
import models

def migrate():
    conn = sqlite3.connect("envi_connect.db")
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(users)")
    cols = [r[1] for r in cursor.fetchall()]

    migrations = [
        ("eco_credits", "INTEGER", "340"),
        ("green_score", "INTEGER", "765"),
        ("tier", "VARCHAR(50)", "'Prakrithi Mitra'"),
        ("certificate_id", "VARCHAR(100)", "'AP-MCT-EC-2026-78421'")
    ]

    for col, ctype, default_val in migrations:
        if col not in cols:
            print(f"Adding column {col} to users table...")
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col} {ctype} DEFAULT {default_val}")
    
    conn.commit()
    conn.close()

    # Create new tables
    Base.metadata.create_all(bind=engine)
    print("Database tables and schema upgraded successfully!")

if __name__ == "__main__":
    migrate()
