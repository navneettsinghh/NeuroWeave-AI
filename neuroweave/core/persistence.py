from __future__ import annotations

import json
import os
import sqlite3
from pathlib import Path
from typing import Generic, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class SQLiteModelStore(Generic[T]):
    """Simple SQLite-backed key/value store for Pydantic models."""

    def __init__(self, table: str, model_type: type[T], db_path: str | None = None) -> None:
        self.table = table
        self.model_type = model_type
        self.db_path = db_path or os.getenv("NEUROWEAVE_DB_PATH", "neuroweave.db")
        self._ensure_db()

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def _ensure_db(self) -> None:
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as conn:
            conn.execute(
                f"""
                CREATE TABLE IF NOT EXISTS {self.table} (
                    id TEXT PRIMARY KEY,
                    payload TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.execute(
                f"""
                CREATE TRIGGER IF NOT EXISTS trg_{self.table}_updated_at
                AFTER UPDATE ON {self.table}
                FOR EACH ROW
                BEGIN
                    UPDATE {self.table} SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
                END;
                """
            )

    def set(self, key: str, model: T) -> None:
        payload = json.dumps(model.model_dump(mode="json"))
        with self._connect() as conn:
            conn.execute(
                f"INSERT INTO {self.table}(id, payload) VALUES(?, ?) "
                f"ON CONFLICT(id) DO UPDATE SET payload=excluded.payload",
                (key, payload),
            )

    def get(self, key: str) -> Optional[T]:
        with self._connect() as conn:
            row = conn.execute(f"SELECT payload FROM {self.table} WHERE id = ?", (key,)).fetchone()
        if not row:
            return None
        return self.model_type.model_validate_json(row[0])
