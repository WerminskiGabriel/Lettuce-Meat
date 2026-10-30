# Backend Let-Us-Meat

## Stack

- Python, Flask
- SQLAlchemy (ORM), SQLite
- Docker (later)

## Python and Flask packages

- flask-cors
- python-dotenv
- pytest
- pytest-benchmark - benchmarking
- locust - load testing

## DB

- ORM -> SQLAlchemy
- raw SQL -> SQLite (benchmarking PostgreSQL)
- raw SQL -> JSON aggregation for optimization
    - SQLite (json_group_array())
        - requires Pydantic -> data validation and text to JSON transfers
        - does not natively support JSON type and thus function returns text
        - less optimized
    - PostgreSQL (json_agg())
        - seems to be the better option for a more scalable project
        - PostgreSQL is much bigger
        - requires constant RAM and a container

## Functionalities

### MVP

- Create meeting (title, date range, day hours, slot size, timezone, quorum_min, deadline_time)
- Guest users nickname + edit token
- Save / replace / clear availability slots
- Validate slots (from creating meeting settings)
- Aggregated cells: count + participant ids per slot
- Return mine when token present
- Delete participant + their slots

### Later

- Create Groups (later quick invites)
- Register / login / logout (session cookie)
- List meetings created / joined
- Claim guest vote onto account
- Close meeting + store chosen final slot
- Reject writes when closed
- Choosing locations
- Google account login
- WebSockets
- Email / calendar / QR invite export
- Postgres, Docker, JWT

### Not logged users

- Enter via code or link / QR
- Admin can determine what the user sees

### Users

- Past quorums

### Admin Panel

- Analysis of user entries
- Groups managing

## Layout

```text
backend/
  app.py
  config.py
  db.py
  models.py
  auth_tokens.py
  dto/meeting.py
  views/meeting.py
  tests/test_meetings.py
  requirements.txt
  DB.db
```

## Models

### MVP

- Meeting
    - id uuid
    - title
    - timezone
    - date_start / date_end
    - day_start_minute / day_end_minute
    - slot_minutes
    - status (open / closed)
    - creation_date
    - admin_id

- Participant
    - id (per meeting)
    - meeting_id
    - display_name
    - edit_token_hash

- AvailabilitySlot
    - participant_id
    - on_date
    - start_minute
    - availability (preferred, canDo)

### Later

- Meeting
    - location_id
    - final_day
    - final_time
    - final_ranking

- Location
    - id
    - name
    - about

- Participant
    - user_id uuid (assigned after logging in)
    - email
    - phone

- MeetingMember
    - meeting_id
    - user_id
    - role (owner, editor, viewer)

## DTO - data transfer object

- CreateMeetingDTO
    - title: str (length=0-50)
    - timezone: str (length=5)
    - date_start: date
    - date_end: date
    - day_start_minute: int (value=0-1440)
    - day_end_minute: int (value=0-1440)
    - slot_minutes: int
    - status: MeetingStatus
    - creation_date: date
    - admin_id: uuid.UUID


- AvailabilitySlotDTO
    - on_date: date
    - start_minute: int (value=0-1440)
    - availability: AvailabilityStatus


- EditAvailabilitySlotDTO
    - participant_id: UUID | None
    - display_name: str (length=1-20)
    - slots: list[AvailabilitySlotDTO]

## API

| Method | Path                            |                                          Notes                                          | Valid | Invalid |
|--------|:--------------------------------|:---------------------------------------------------------------------------------------:|-------|---------|
| POST   | /api/meetings                   |                    Create meeting, returns id  -> share with /m{id}                     | 200   | 400     |
| GET    | /api/meetings/<id>              |           get meeting, participants, slots, mine_slots if X-Edit-Token exists           | 200   | 404     |
| PUT    | /api/meetings/<id>/availability | {display_name, slots[]}; no token -> create + return token; with token -> replace slots | 200   | 400     |
| DELETE | /api/meetings/<id>/availability |                 Token required, remove participants from provided slots                 | 200   | 400/404 | 
|

## API

### 1. POST /api/meetings - create_meeting

Request body:

```python
class CreateMeetingDTO():
    title: str = Field(min_length=0, max_length=50)
    timezone: str = Field(min_length=5, max_length=5)
    date_start: date
    date_end: date = Field()
    day_start_minute: int = Field(ge=0, le=1440)
    day_end_minute: int = Field(ge=0, le=1440)
    slot_minutes: int
    status: MeetingStatus
    creation_date: date
    admin_id: uuid.UUID
```

Response 201:

```json
{
  "id": uuid4
}
```

### 2. GET /api/meetings/<id> - get_meeting

Response 200:

```json
{
  "meeting": {},
  "participants": [],
  "slots": [],
  "slots_mine": [] ( if token exists )
}
```

### 3. PUT /api/meetings/<id>/availability - edit_meeting_availability

Headers (optional):

- X-Edit-Token:

Request body:

```python
class EditAvailabilitySlotDTO(BaseModel):
    participant_id: uuid.UUID | None = None
    display_name: str = Field(min_length=1, max_length=20)
    slots: list[

    class AvailabilitySlotDTO(BaseModel):
        on_date: date
        start_minute: int = Field(ge=0, le=1440)
        availability: AvailabilityStatus

    ]

```

Response 200:

```json
{
  "edit_token": str,
  "participant_id": str
  "slots_changed": []
}
```

### 4. DELETE /api/meetings/<id>/availability - delete_meeting_availability

Headers (required):

- X-Edit-Token:

Request body - same as PUT:

```python
class EditAvailabilitySlotDTO(BaseModel):
    participant_id: uuid.UUID | None = None
    display_name: str = Field(min_length=1, max_length=20)
    slots: list[

    class AvailabilitySlotDTO(BaseModel):
        on_date: date
        start_minute: int = Field(ge=0, le=1440)
        availability: AvailabilityStatus

    ]

```

### Error format (400)

```json
{
  "errors": [
    {
      "loc": [
        "slot_minutes"
      ],
      "msg": "Value error, ..."
    }
  ]
}
```

| Method | valid                                          | invalid                                               |
|--------|------------------------------------------------|-------------------------------------------------------|
| POST   | id:,status                                     | errors:[loc:,msg:], 400                               |
| GET    | meeting:, participants:,slots:,200             | ,404                                                  |
| PUT    | edit_token:,participant_id:,slots_changed:,200 | errors:[loc:,msg:], 400                               |
| DELETE | edit_token:,participant_id:,slots_changed:,200 | error:Token is required,400 / errors:[loc:,msg:], 400 |
