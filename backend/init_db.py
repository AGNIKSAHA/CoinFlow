import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import sys

def init_postgres_db():
    passwords = ['postgres', 'admin', 'root', '1234', 'password', '']
    connected = False

    for pwd in passwords:
        try:
            conn = psycopg2.connect(host='localhost', port=5432, user='postgres', password=pwd, dbname='postgres')
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            cur = conn.cursor()
            cur.execute("SELECT 1 FROM pg_database WHERE datname='coinflow_db'")
            exists = cur.fetchone()
            if not exists:
                cur.execute("CREATE DATABASE coinflow_db;")
                print("Successfully created database coinflow_db!")
            else:
                print("Database coinflow_db already exists.")
            cur.close()
            conn.close()
            connected = True
            print(f"POSTGRES_PASSWORD={pwd}")
            break
        except Exception as e:
            continue

    if not connected:
        print("ERROR: Could not connect to local PostgreSQL 18. Check password/service.")
        sys.exit(1)

if __name__ == "__main__":
    init_postgres_db()
