from app import create_app
from config import TestConfig
import json
import uuid
from models import MeetingStatus


class TestCreateMeeting:
    app = create_app(TestConfig)
    client = app.test_client()

    def test_valid_response(self):
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
        response = self.client.post("/api/meetings", json=data)

        body = response.get_json()
        assert response.status_code == 201, f"expected http status 201, got: {response.status_code}:\n{body}"
        assert "id" in body

        print(body)

    def test_absent_required_fields(self):
        data = {
            "title": "bit-meeting-kawka",
            "day_start_minute": 480,
            "day_end_minute": 960,
            "status": MeetingStatus.OPEN,
        }
        response = self.client.post("/api/meetings", json=data)

        body = response.get_json()

        assert response.status_code == 400, f"expected http status 400, got: {response.status_code}:\n{body}"


    def test_invalid_data_range(self):
        data = {

            "title": "bit-meeting-kawka",
            "timezone": "UTC+1",
            "date_start": "2027-10-28",
            "date_end": "2026-10-30",
            "day_start_minute": 480,
            "day_end_minute": 960,
            "slot_minutes": 30,
            "status": MeetingStatus.OPEN,
            "creation_date": "2026-10-28",
            "admin_id": uuid.uuid4(),
        }
        response = self.client.post("/api/meetings", json=data)

        body = response.get_json()
        assert response.status_code == 400, f"expected http status 400, got: {response.status_code}:\n{body}"
        assert body["errors"]

    def test_invalid_minutes_range(self):
        data = {

            "title": "bit-meeting-kawka",
            "timezone": "UTC+1",
            "date_start": "2026-10-28",
            "date_end": "2026-10-30",
            "day_start_minute": 2000,
            "day_end_minute": -20,
            "slot_minutes": 30,
            "status": MeetingStatus.OPEN,
            "creation_date": "2026-10-28",
            "admin_id": uuid.uuid4(),
        }
        response = self.client.post("/api/meetings", json=data)

        body = response.get_json()
        assert response.status_code == 400, f"expected http status 400, got: {response.status_code}\n{body}"


    def test_invalid_slot_size(self):
        data = {

            "title": "bit-meeting-kawka",
            "timezone": "UTC+1",
            "date_start": "2026-10-28",
            "date_end": "2026-10-30",
            "day_start_minute": 480,
            "day_end_minute": 960,
            "slot_minutes": 31,
            "status": MeetingStatus.OPEN,
            "creation_date": "2026-10-28",
            "admin_id": uuid.uuid4(),
        }
        response = self.client.post("/api/meetings", json=data)

        body = response.get_json()
        assert response.status_code == 400, f"expected http status 201, got: {response.status_code}:\n{body}"
