import time
import uuid

import pytest
from sqlalchemy import event
from sqlalchemy.engine import Engine

from app import create_app
from config import BenchConfig, TestConfig
from models import MeetingStatus


class SqlStats:
    query_count = 0
    elapsed_ms = 0.0

    @classmethod
    def reset(cls):
        cls.query_count = 0
        cls.elapsed_ms = 0.0


SQL_STATS = SqlStats()


@event.listens_for(Engine, "before_cursor_execute")
def _sql_before(conn, cursor, statement, parameters, context, executemany):
    conn.info.setdefault("bench_query_starts", []).append(time.perf_counter())


@event.listens_for(Engine, "after_cursor_execute")
def _sql_after(conn, cursor, statement, parameters, context, executemany):
    starts = conn.info.get("bench_query_starts")

    if not starts:
        return

    started = starts.pop()
    SQL_STATS.query_count += 1
    SQL_STATS.elapsed_ms += (time.perf_counter() - started) * 1000.0


def reset_sql_stats():
    SQL_STATS.reset()


def meeting_data(**overrides):
    data = {

        "title": "bench-meeting",
        "timezone": "UTC+1",
        "quick_description": "benchmark seed",
        "date_start": "2026-10-26",
        "date_end": "2026-11-08",
        "day_start_minute": 480,
        "day_end_minute": 960,
        "slot_minutes": 30,
        "status": MeetingStatus.OPEN,
        "creation_date": "2026-10-26",
        "admin_id": str(uuid.uuid4()),
    }
    data.update(overrides)
    return data


def build_slots(count, dates=None, start_minute=480, end_minute=960, step=30, availability="canDo"):
    if dates is None:
        dates = ["2026-10-28"]

    slots = []
    date_index = 0
    minute = start_minute

    while len(slots) < count:

        if date_index >= len(dates):
            raise ValueError(f"could only build {len(slots)} of {count} slots (not enough dates)")

        on_date = dates[date_index]

        if minute >= end_minute:
            date_index += 1
            minute = start_minute
            continue

        slots.append(
            {
                "on_date": on_date,
                "start_minute": minute,
                "availability": availability,
            }
        )
        minute += step

    return slots


def seed_loaded_meeting(client, meeting_id, participants=10, slots_each=20):
    dates = ["2026-10-28", "2026-10-29", "2026-10-30"]

    for index in range(participants):
        start = 480 + (index % 5) * 30
        slots = build_slots(slots_each, dates=dates, start_minute=start)

        data = {
            "display_name": f"voter-{index}",
            "slots": slots,
        }
        response = client.put(f"/api/meetings/{meeting_id}/availability", json=data)

        assert response.status_code == 200, response.get_json()


@pytest.fixture(scope="session")
def app():
    return create_app(TestConfig)


@pytest.fixture(scope="session")
def client(app):
    return app.test_client()


@pytest.fixture(scope="session")
def bench_app():
    if BenchConfig.BENCH_DB_PATH.exists():
        BenchConfig.BENCH_DB_PATH.unlink()

    return create_app(BenchConfig)


@pytest.fixture(scope="session")
def bench_client(bench_app):
    return bench_app.test_client()


@pytest.fixture(scope="session")
def empty_meeting_id(bench_client):
    data = meeting_data(title="bench-empty")
    response = bench_client.post("/api/meetings", json=data)

    body = response.get_json()
    assert response.status_code == 201, f"expected http status 201, got: {response.status_code}:\n{body}"

    return body["id"]


@pytest.fixture(scope="session")
def loaded_meeting_id(bench_client):
    data = meeting_data(title="bench-loaded")
    response = bench_client.post("/api/meetings", json=data)

    body = response.get_json()
    assert response.status_code == 201, f"expected http status 201, got: {response.status_code}:\n{body}"

    meeting_id = body["id"]
    seed_loaded_meeting(bench_client, meeting_id)

    return meeting_id


@pytest.fixture(scope="session")
def availability_edit_context(bench_client, empty_meeting_id):
    small = build_slots(5)

    data = {
        "display_name": "bench-editor",
        "slots": small,
    }
    response = bench_client.put(f"/api/meetings/{empty_meeting_id}/availability", json=data)

    body = response.get_json()
    assert response.status_code == 200, f"expected http status 200, got: {response.status_code}:\n{body}"

    large_dates = [
        "2026-10-26",
        "2026-10-27",
        "2026-10-28",
        "2026-10-29",
        "2026-10-30",
    ]

    return {
        "meeting_id": empty_meeting_id,
        "token": body["edit_token"],
        "small_slots": small,
        "large_slots": build_slots(80, dates=large_dates),
    }
