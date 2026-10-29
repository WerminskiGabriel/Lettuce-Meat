from flask import Blueprint, request, jsonify
from pydantic import ValidationError

import auth_tokens
from db import DB
from models import Meeting, Participant, AvailabilitySlot
from dto.meeting import CreateMeetingDTO, EditAvailabilitySlotDTO, DeleteAvailabilitySlotDTO
from sqlalchemy import select, delete

bp = Blueprint('meetings', __name__, url_prefix='/api/meetings')


@bp.post("")
def create_meeting():
    data = request.get_json()
    try:

        dto = CreateMeetingDTO.model_validate(data)
    except ValidationError as e:
        return jsonify(
            {"errors": [{"loc": error["loc"], "msg": error["msg"]} for error in e.errors()]}), 400  # bad request

    meeting_table = Meeting(**dto.model_dump())
    DB.db.session.add(meeting_table)
    DB.db.session.commit()

    return jsonify({"id": str(meeting_table.id)}), 201  # created


@bp.get("/<uuid:meeting_id>")
def get_meeting(meeting_id):
    meeting = DB.db.get_or_404(Meeting, meeting_id)

    participants = DB.db.session.scalars(
        select(Participant).where(Participant.meeting_id == meeting_id)).all()
    participant_ids = [p.id for p in participants]

    slots = DB.db.session.scalars(
        select(AvailabilitySlot).where(AvailabilitySlot.participant_id.in_(participant_ids))).all()

    return jsonify(f"meeting:{meeting},participants:{participants},slots:{slots}"), 200


@bp.put("/<uuid:meeting_id>/availability")
def edit_meeting_availability(meeting_id):
    DB.db.get_or_404(Meeting, meeting_id)

    data = request.get_json()

    try:
        dto = EditAvailabilitySlotDTO.model_validate(data)
    except ValidationError as e:
        return jsonify({"errors": [{"loc": error["loc"], "msg": error["msg"]} for error in e.errors()]}), 400

    token = request.headers.get("X-Edit-Token")

    participant = None

    if token is None:
        token = auth_tokens.generate_token()
        participant = Participant(
            meeting_id=meeting_id,
            display_name=dto.display_name,
            edit_token_hash=auth_tokens.hash_token(token))

        DB.db.session.add(participant)
        DB.db.session.commit()
    else:
        participant = DB.db.session.scalars(
            select(Participant).where(Participant.meeting_id == meeting_id,
                                      Participant.edit_token_hash == auth_tokens.hash_token(token))).first()

    for slot in dto.slots:
        DB.db.session.add(AvailabilitySlot(participant_id=participant.id, **slot.model_dump()))
    DB.db.session.commit()

    return jsonify(
        {"edit_token": token, "participant_id": dto.participant_id, "slots_changed": dto.model_dump()["slots"]}), 200


@bp.delete("/<uuid:meeting_id>/availability/")
def delete_meeting_availability(meeting_id):
    DB.db.get_or_404(Meeting, meeting_id)

    data = request.get_json()

    token = request.headers.get("X-Edit-Token")
    if token is None:
        return jsonify({"error": "Token is required"}), 400

    try:
        dto = EditAvailabilitySlotDTO.model_validate(data)
    except ValidationError as e:
        return jsonify({"errors": [{"loc": error["loc"], "msg": error["msg"]} for error in e.errors()]}), 400

    participant = DB.db.session.scalars(
        select(Participant).where(Participant.meeting_id == meeting_id,
                                  Participant.edit_token_hash == auth_tokens.hash_token(token))).first()

    for slot in dto.slots:
        DB.db.session.execute(
            delete(AvailabilitySlot).where(
                AvailabilitySlot.participant_id == participant.id,
                AvailabilitySlot.on_date == slot.on_date,
                AvailabilitySlot.start_minute == slot.start_minute
            )
        )
    DB.db.session.commit()

    return jsonify({"participant_id": dto.participant_id, "slots_changed": dto.model_dump()["slots"]}), 200
