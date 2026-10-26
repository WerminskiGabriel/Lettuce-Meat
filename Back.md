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
  views/meetings.py
  tests/
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

## API

| Method | Path                            | Notes                                                                                           |
|--------|---------------------------------|-------------------------------------------------------------------------------------------------|
| POST   | /api/meetings                   | Create; returns id -> share /m/{id}                                                             |
| GET    | /api/meetings/<id>              | Meta, participants, cells {on_date, start_minute, count, participant_ids}, mine if X-Edit-Token |
| PUT    | /api/meetings/<id>/availability | {display_name, slots[]}; no token -> create + return token; with token -> replace slots         |
| DELETE | /api/meetings/<id>/availability | Token required; remove participant                                                              |
