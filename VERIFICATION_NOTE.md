# API Verification Note

Run timestamp: 2026-04-14 22:39:58 +05:30

Scope:
- Backend running live on `http://localhost:4000`
- MySQL-backed runtime verification
- Temporary verification records created and cleaned up during the sweep

Summary:
- Total checks: 43
- Passed: 43
- Failed: 0

Verified endpoints:

Public:
- `GET /actuator/health`
- `GET /hospitals`
- `GET /doctors`
- `GET /doctors/{id}`
- `GET /doctors/{id}/availability`

Auth and user profile:
- `POST /auth/login` as platform admin
- `POST /auth/login` as hospital admin
- `POST /auth/login` as doctor
- `POST /auth/login` as patient
- `POST /auth/register`
- `GET /users/me`
- `GET /users`
- `GET /users/{id}`

Hospital management:
- `POST /hospitals`
- `PUT /hospitals/{id}`
- `POST /hospitals/{id}/admins`
- `GET /hospitals/{id}/admins`
- `PUT /hospitals/{id}/admins/{adminId}`
- `POST /hospitals/{id}/admins/{adminId}/delete`
- `GET /hospitals/{id}/calendar`
- `POST /hospitals/{id}/delete`

Doctor management and availability:
- `POST /doctors`
- `PUT /doctors/{id}`
- `DELETE /doctors/{id}`
- `POST /doctors/{id}/delete`
- `POST /doctors/{id}/availability`
- `PUT /doctors/{id}/availability/{slotId}`
- `GET /doctors/{id}/availability`
- `POST /doctors/{id}/availability/{slotId}/delete`

Patient management:
- `GET /patients`
- `POST /patients`
- `PUT /patients/{id}`
- `DELETE /patients/{id}`

Appointments:
- `POST /appointments`
- `GET /appointments`
- `GET /appointments/my`
- `PUT /appointments/{id}/reschedule`
- `POST /appointments/{id}/status`
- `POST /appointments/{id}/cancel`

Role coverage included in the sweep:
- Platform admin
- Hospital admin
- Doctor
- Patient
- Public unauthenticated access

Notes:
- Appointment lifecycle status persistence was verified after expanding the MySQL enum to include `RESCHEDULED`, `COMPLETED`, and `NO_SHOW`.
- Platform admin availability management was rechecked after the authorization fix and passed.
