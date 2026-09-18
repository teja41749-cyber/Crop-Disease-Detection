"""
Simple SQLite persistence layer for Agrigaurd.

This is intentionally minimal (no ORM) so it's easy to read and modify
during the hackathon. All scan records go into a single 'scans' table.
"""

import sqlite3
from contextlib import contextmanager

DB_PATH = "agrigaurd.db"


def init_db():
    """Create the scans table if it doesn't already exist. Call once at startup."""
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                disease TEXT NOT NULL,
                confidence REAL NOT NULL,
                latitude REAL,
                longitude REAL,
                district TEXT,
                confirmed INTEGER DEFAULT NULL,   -- NULL = no feedback yet, 1 = confirmed correct, 0 = incorrect
                actual_disease TEXT,              -- filled in if farmer says prediction was wrong
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)


@contextmanager
def get_db():
    """Context manager that yields a connection and commits/closes automatically."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def insert_scan(disease, confidence, latitude=None, longitude=None, district=None):
    """Insert a new scan record and return its id."""
    with get_db() as conn:
        cursor = conn.execute(
            """INSERT INTO scans (disease, confidence, latitude, longitude, district)
               VALUES (?, ?, ?, ?, ?)""",
            (disease, confidence, latitude, longitude, district)
        )
        return cursor.lastrowid


def get_all_scans(only_with_location=False):
    with get_db() as conn:
        query = "SELECT * FROM scans"
        if only_with_location:
            query += " WHERE latitude IS NOT NULL AND longitude IS NOT NULL"
        query += " ORDER BY created_at DESC"
        rows = conn.execute(query).fetchall()
        return [dict(r) for r in rows]


def update_feedback(scan_id, confirmed, actual_disease=None):
    """Record farmer feedback on a past scan."""
    with get_db() as conn:
        conn.execute(
            "UPDATE scans SET confirmed = ?, actual_disease = ? WHERE id = ?",
            (1 if confirmed else 0, actual_disease, scan_id)
        )
def get_dashboard_stats():
    with get_db() as conn:
        total_scans = conn.execute(
            "SELECT COUNT(*) FROM scans"
        ).fetchone()[0]

        pending_confirmations = conn.execute(
            "SELECT COUNT(*) FROM scans WHERE confirmed IS NULL"
        ).fetchone()[0]

        disease_counts = conn.execute(
            """
            SELECT disease, COUNT(*) AS count
            FROM scans
            GROUP BY disease
            ORDER BY count DESC
            """
        ).fetchall()

        district_counts = conn.execute(
            """
            SELECT COALESCE(district, 'Unknown') AS district,
                   COUNT(*) AS count
            FROM scans
            GROUP BY district
            ORDER BY count DESC
            """
        ).fetchall()

        return {
            "total_scans": total_scans,
            "pending_confirmations": pending_confirmations,
            "disease_counts": [dict(row) for row in disease_counts],
            "district_counts": [dict(row) for row in district_counts],
        }