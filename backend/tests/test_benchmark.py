import uuid

import pytest

from tests.conftest import meeting_data, reset_sql_stats, SQL_STATS

ROUNDS = 30
WARMUP = 5


def save_sql_stats(benchmark):
    benchmark.extra_info["sql_queries"] = SQL_STATS.query_count
    benchmark.extra_info["sql_ms"] = round(SQL_STATS.elapsed_ms, 3)


def run_bench(benchmark, fn):
    benchmark.pedantic(fn, rounds=ROUNDS, iterations=1, warmup_rounds=WARMUP)


@pytest.mark.benchmark
def test_bench_post_create_meeting(benchmark, bench_client):
    def run():
        reset_sql_stats()

        data = meeting_data(
            title=f"bench-{uuid.uuid4().hex[:8]}",
            admin_id=str(uuid.uuid4()),
        )
        response = bench_client.post("/api/meetings", json=data)

        body = response.get_json()
        assert response.status_code == 201, f"expected http status 201, got: {response.status_code}:\n{body}"
        assert "id" in body

        save_sql_stats(benchmark)

    run_bench(benchmark, run)


@pytest.mark.benchmark
def test_bench_get_meeting_empty(benchmark, bench_client, empty_meeting_id):
    def run():
        reset_sql_stats()

        response = bench_client.get(f"/api/meetings/{empty_meeting_id}")

        body = response.get_json()
        assert response.status_code == 200, f"expected http status 200, got: {response.status_code}:\n{body}"
        assert body["meeting"]["id"] == empty_meeting_id
        assert body["slots"] == []

        save_sql_stats(benchmark)

    run_bench(benchmark, run)


@pytest.mark.benchmark
def test_bench_get_meeting_loaded(benchmark, bench_client, loaded_meeting_id):
    def run():
        reset_sql_stats()

        response = bench_client.get(f"/api/meetings/{loaded_meeting_id}")

        body = response.get_json()
        assert response.status_code == 200, f"expected http status 200, got: {response.status_code}:\n{body}"
        assert len(body["participants"]) == 10
        assert len(body["slots"]) == 200

        save_sql_stats(benchmark)

    run_bench(benchmark, run)


@pytest.mark.benchmark
def test_bench_put_availability_small(benchmark, bench_client, availability_edit_context):
    meeting_id = availability_edit_context["meeting_id"]
    token = availability_edit_context["token"]
    slots = availability_edit_context["small_slots"]

    def run():
        reset_sql_stats()

        data = {
            "display_name": "bench-editor",
            "slots": slots,
        }
        response = bench_client.put(
            f"/api/meetings/{meeting_id}/availability",
            json=data,
            headers={"X-Edit-Token": token},
        )

        body = response.get_json()
        assert response.status_code == 200, f"expected http status 200, got: {response.status_code}:\n{body}"

        save_sql_stats(benchmark)

    run_bench(benchmark, run)


@pytest.mark.benchmark
def test_bench_put_availability_large(benchmark, bench_client, availability_edit_context):
    meeting_id = availability_edit_context["meeting_id"]
    token = availability_edit_context["token"]
    slots = availability_edit_context["large_slots"]

    def run():
        reset_sql_stats()

        data = {
            "display_name": "bench-editor",
            "slots": slots,
        }
        response = bench_client.put(
            f"/api/meetings/{meeting_id}/availability",
            json=data,
            headers={"X-Edit-Token": token},
        )

        body = response.get_json()
        assert response.status_code == 200, f"expected http status 200, got: {response.status_code}:\n{body}"

        save_sql_stats(benchmark)

    run_bench(benchmark, run)
