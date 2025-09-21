import os
from pathlib import Path

import psycopg

CONN_STR = os.environ.get("POSTGRES_URL_NON_POOLING") or os.environ.get("POSTGRES_URL")

if not CONN_STR:
    raise SystemExit("POSTGRES_URL_NON_POOLING or POSTGRES_URL environment variable is required")

sql_dir = Path(__file__).resolve().parent
sql_files = sorted(sql_dir.glob("*.sql"))

if not sql_files:
    raise SystemExit("No SQL files found in scripts directory")

print("Executing SQL files:")
for path in sql_files:
    print(f" - {path.name}")

with psycopg.connect(CONN_STR) as conn:
    conn.execute("SET statement_timeout TO '5min'")
    for path in sql_files:
        sql = path.read_text()
        print(f"\nRunning {path.name}...")
        try:
            with conn.cursor() as cur:
                cur.execute(sql, prepare=False)
            conn.commit()
        except Exception as exc:
            conn.rollback()
            print(f"Error while executing {path.name}: {exc}")
            raise
        else:
            print(f"Completed {path.name}")

print("\nAll SQL files executed successfully.")
