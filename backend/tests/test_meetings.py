from wsgiref import headers

from pydantic import ValidationError

from app import create_app
from config import TestConfig
import json
import uuid
from dto.meeting import AvailabilitySlotDTO
from db import DB
from models import MeetingStatus, Participant
import auth_tokens


class TestCreateMeeting:
    app = create_app(TestConfig)
    client = app.test_client()

    def test_valid_response(self):
        data = {

            "title": "bit-meeting-kawka",
            "timezone": "UTC+1",
            "quick_description": "desc",
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
            "quick_description": "desc",
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
            "quick_description": "desc",
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
            "quick_description": "desc",
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


class TestGetMeeting:
    app = create_app(TestConfig)
    client = app.test_client()

    def create_valid_meeting(self):
        data = {

            "title": "bit-meeting-kawka",
            "timezone": "UTC+1",
            "quick_description": "desc",
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
        return body

    def add_valid_slots(self, meeting_id: str) -> str:
        data = {
            "display_name": "gabriel",
            "slots": [
                {"on_date": "2026-10-28", "start_minute": 480, "availability": "preferred"},
                {"on_date": "2026-10-28", "start_minute": 510, "availability": "canDo"}
            ]
        }
        response = self.client.put(f"/api/meetings/{meeting_id}/availability", json=data)
        return response.get_json()

    def test_valid_response(self):
        created_meeting = self.create_valid_meeting()
        meeting_id = created_meeting["id"]

        response = self.client.get(f"/api/meetings/{meeting_id}")
        body = response.get_json()
        assert response.status_code == 200, f"expected http status 200, got: {response.status_code}:\n{body}"
        assert "slots" in body
        assert not ("mine_slots" in body)

    def test_not_existing_meeting(self):
        created_meeting = self.create_valid_meeting()
        meeting_id = created_meeting["id"]

        response = self.client.get(f"/api/meetings/{uuid.uuid4()}")
        body = response.get_json()
        assert response.status_code == 404, f"expected http status 404, got: {response.status_code}:\n{body}"

    def test_valid_with_token(self):
        created_meeting = self.create_valid_meeting()
        meeting_id = created_meeting["id"]

        edit_availability_json = self.add_valid_slots(meeting_id)
        token = edit_availability_json["edit_token"]

        response = self.client.get(f"/api/meetings/{meeting_id}", headers={"X-Edit-Token": token})
        body = response.get_json()
        assert response.status_code == 200, f"expected http status 200, got: {response.status_code}:\n{body}"
        assert "slots" in body
        assert "slots_mine" in body


class TestEditMeetingAvailability:
    app = create_app(TestConfig)
    client = app.test_client()

    def create_valid_meeting(self):
        data = {

            "title": "bit-meeting-kawka",
            "timezone": "UTC+1",
            "quick_description": "desc",
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
        return body

    def test_valid_response(self):
        created_meeting = self.create_valid_meeting()
        meeting_id = created_meeting["id"]

        p_id = uuid.uuid4()
        data = {
            "display_name": "gabriel",
            "slots": [
                {"on_date": "2026-10-28", "start_minute": 60, "availability": "preferred"},
                {"on_date": "2026-10-28", "start_minute": 120, "availability": "canDo"}
            ]
        }

        response = self.client.put(f"/api/meetings/{meeting_id}/availability", json=data)
        body = response.get_json()
        assert response.status_code == 200, f"expected http status 200, got: {response.status_code}:\n{body}"

    def test_invalid_input_response(self):
        created_meeting = self.create_valid_meeting()
        meeting_id = created_meeting["id"]

        p_id = uuid.uuid4()
        data = {
            "display_name": "gabriel",
            "slots": [
                {"on_date": "2026-10-28", "start_minute": 10000, "availability": "preferred"},
                {"on_date": "2026-10-28", "start_minute": 120, "availability": "canDo"}
            ]
        }

        response = self.client.put(f"/api/meetings/{meeting_id}/availability", json=data)
        body = response.get_json()
        assert response.status_code == 400, f"expected http status 400, got: {response.status_code}:\n{body}"


class TestDeleteMeetingAvailability:
    app = create_app(TestConfig)
    client = app.test_client()

    def create_valid_meeting(self):
        data = {
            "title": "bit-meeting-kawka",
            "timezone": "UTC+1",
            "quick_description": "desc",
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
        return body

    def add_valid_slots(self, meeting_id: str) -> str:
        data = {
            "display_name": "gabriel",
            "slots": [
                {"on_date": "2026-10-28", "start_minute": 480, "availability": "preferred"},
                {"on_date": "2026-10-28", "start_minute": 510, "availability": "canDo"}
            ]
        }
        response = self.client.put(f"/api/meetings/{meeting_id}/availability", json=data)
        return response.get_json()

    def test_invalid_no_token(self):
        created_meeting = self.create_valid_meeting()
        meeting_id = created_meeting["id"]

        data = {
            "display_name": "gabriel",
            "slots": [
                {"on_date": "2026-10-28", "start_minute": 480, "availability": "preferred"},
                {"on_date": "2026-10-28", "start_minute": 510, "availability": "canDo"}
            ]
        }

        response = self.client.delete(f"/api/meetings/{meeting_id}/availability/", json=data)
        body = response.get_json()
        assert response.status_code == 400, f"expected http status 200, got: {response.status_code}:\n{body}"

    def test_valid_delete_slot(self):
        created_meeting = self.create_valid_meeting()
        meeting_id = created_meeting["id"]

        edit_availability_json = self.add_valid_slots(meeting_id)
        token = edit_availability_json["edit_token"]

        data = {
            "display_name": "gabriel",
            "slots": [
                {"on_date": "2026-10-28", "start_minute": 480, "availability": "preferred"},
                {"on_date": "2026-10-28", "start_minute": 510, "availability": "canDo"}
            ]
        }

        response = self.client.delete(f"/api/meetings/{meeting_id}/availability/", json=data,
                                      headers={"X-Edit-Token": token})
        body = response.get_json()
        assert response.status_code == 200, f"expected http status 200, got: {response.status_code}:\n{body}"
