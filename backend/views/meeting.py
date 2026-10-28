from flask import Blueprint, request, jsonify
from pydantic import ValidationError

from db import DB
from models import Meeting, Participant
from dto.meeting import CreateMeetingDTO

bp = Blueprint('meetings', __name__, url_prefix='/api/meetings')


@bp.post("")
def create_meeting():
    data = request.get_json()
    try:

        dto = CreateMeetingDTO.model_validate(data)
    except ValidationError as e:
        return jsonify({"errors": e.errors(include_input=False)}), 400  # bad request

    meeting_table = Meeting(**dto.model_dump())
    DB.db.session.add(meeting_table)
    DB.db.session.commit()

    return jsonify({"id": str(meeting_table.id)}), 201  # created


"""
@bp.get("/<uuid.meeting_id>")
def get_meeting(meeting_id):
    data = request.get_json()


@bp.get("/<uuid.meeting_id>/availability")
def edit_meeting(meeting_id):
    pass


@bp.get("/<uuid.meeting_id>/availability")
def delete_meeting(meeting_id):
    pass
"""
