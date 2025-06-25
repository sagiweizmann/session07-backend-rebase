# 🧩 Session 07 - Users Microservice

This is a simple microservice that handles basic user lifecycle operations, built on top of a relational database. The service supports user creation (with upsert logic), retrieval, and soft-deletion using a RESTful API.

---

## 🛠 Tech Stack

- **Language**: Node.js 
- **Database**: MySQL 
- **Logging**: Structured logs via `logz.io`
- **UUID Handling**: Stored as `VARCHAR(36)` (or binary, optional)
- **Time Zones**: UTC used for all datetime fields

---

## 🗃️ Database Schema

The microservice uses a single `users` table:

| Field          | Type         | Constraints                |
|----------------|--------------|----------------------------|
| `id`           | `VARCHAR(36)`| PK, NOT NULL               |
| `email`        | `VARCHAR(200)`| UNIQUE, NOT NULL          |
| `full_name`    | `VARCHAR(200)`| NOT NULL, UTF8            |
| `joined_at`    | `DATETIME`   | NOT NULL                  |
| `deleted_since`| `DATETIME`   | NULLABLE (soft delete flag)|

> 🔍 UUID can optionally be stored as BINARY(16) for performance.

---

## 📬 API Endpoints

### `POST /users/` – Upsert a User

**Request:**
```json
{
  "email": "user@example.com",
  "full_name": "John Doe"
}
```

- Generates a new UUID and `joined_at` timestamp in UTC
- Performs an UPSERT using one SQL command
- Logs one of the following messages:
  - "User was created"
  - "User was reactivated"
  - "User is already active"

**Response:**
- 201 Created (new user)
- 200 OK (reactivated or already active)
- No user data is returned (CQRS principle)

---

### `GET /users/{email}` – Retrieve a User

**Response:**
```json
{
  "email": "user@example.com",
  "full_name": "John Doe",
  "joined_at": "2024-01-01T12:00:00Z"
}
```

- 200 OK if user exists and is active
- 404 Not Found otherwise

---

### `DELETE /users/{email}` – Soft Delete a User

- Soft-deletes the user by setting `deleted_since = utc_now` only if it is NULL
- Uses:
```sql
UPDATE users SET deleted_since = ? WHERE email = ? AND deleted_since IS NULL
```

**Response:**
- 204 No Content
- Logs:
  - "User was soft-deleted"
  - "User doesn't exist or is currently inactive"

---

## 📜 Logging

- Structured JSON logs
- Output must be sent to `logz.io`
- Include event type, timestamp, user email, and action taken

---

## 🚀 Setup & Running

1. Clone this repo
2. Configure your `.env` or `config.js` for DB and Logz.io
3. Run with:
   ```bash
   npm install && npm start
   ```

