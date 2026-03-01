"""
Chat Feature Migration Script
Adds new columns to users table and creates chat_messages table
Safe to re-run (uses try/except for ALTER TABLE)
"""
from sqlalchemy import text
from app.core.database import engine, Base
from app.models import ChatMessage, User


def run_migration():
    # Create new tables (safe to re-run - create_all skips existing)
    Base.metadata.create_all(bind=engine)
    print("[OK] Tables created/verified: chat_messages")

    # Add new columns to users table
    alter_statements = [
        "ALTER TABLE users ADD COLUMN field_of_study VARCHAR",
        "ALTER TABLE users ADD COLUMN subjects JSON",
        "ALTER TABLE users ADD COLUMN onboarding_done VARCHAR",
    ]

    with engine.connect() as conn:
        for stmt in alter_statements:
            try:
                conn.execute(text(stmt))
                conn.commit()
                col_name = stmt.split("ADD COLUMN ")[1].split(" ")[0]
                print(f"[OK] Added column: users.{col_name}")
            except Exception as e:
                if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                    print(f"[SKIP] Column already exists: {stmt.split('ADD COLUMN ')[1].split(' ')[0]}")
                else:
                    print(f"[WARN] {e}")
                conn.rollback()

    print("\nChat feature migration complete.")


if __name__ == "__main__":
    run_migration()
