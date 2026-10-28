from app import create_app
from config import TestConfig
import json
import uuid
from models import MeetingStatus


def test_create_meetings():
    app = create_app(TestConfig)
    client = app.test_client()

    data = {

        "title": "bit-meeting-kawka",
        "timezone": "UTC+1",
        "date_start": "2026-10-28",
        "date_end": "2026-10-30",
        "day_start_minute": 480,
        "day_end_minute": 960,
        "slot_minutes": 30,
        "status": MeetingStatus.OPEN,
        "creation_date": "2026-10-28",
        "admin_id": uuid.uuid4(),
    }
    response = client.post("/api/meetings", json=data)

    body = response.get_json()
    assert response.status_code == 201, f"expected http status 201, got: {response.status_code}:\n{json.dumps(body, indent=1)}"

    print(body)
