# api-portfolio-angular

REST API that powers the contact form on [matheusbatistadev.com](https://matheusbatistadev.com). It receives messages submitted through the portfolio, stores them in a MySQL database, and exposes endpoints to submit and retrieve them.

Built with Node.js and Express.

## Features

- Accepts contact submissions (name, email, message, and optional company) and persists them to MySQL.
- Normalizes incoming data into related tables: a contact record, a message record, and a company-change history table.
- Returns stored messages alongside the company name that was associated with the contact at the time the message was sent.
- CORS locked down to the portfolio origin.
- Ships an authentication middleware (static API key or JWT) ready to be applied to routes.

## Tech stack

| Concern         | Technology            |
| --------------- | --------------------- |
| Runtime         | Node.js               |
| Framework       | Express 4             |
| Database        | MySQL (via `mysql2`)  |
| Auth            | `jsonwebtoken` (JWT) / static API key |
| Config          | `dotenv`              |
| Dates/timezones | `moment-timezone`     |
| CORS            | `cors`                |

## Getting started

### Prerequisites

- Node.js (LTS recommended)
- A running MySQL instance

### Installation

```bash
git clone https://github.com/matheusbatista1/api-portifolio-angular.git
cd api-portifolio-angular
npm install
```

### Configuration

Create a `.env` file in the project root with the variables the app reads:

| Variable      | Required | Description                                              |
| ------------- | -------- | -------------------------------------------------------- |
| `DB_HOST`     | Yes      | MySQL host                                               |
| `DB_USER`     | Yes      | MySQL user                                               |
| `DB_PASSWORD` | Yes      | MySQL password                                           |
| `DB_NAME`     | Yes      | Database name                                            |
| `PORT`        | No       | Port the server listens on (defaults to `5000`)          |
| `API_KEY`     | No       | Static key checked by the auth middleware (`x-api-key`)  |
| `JWT_SECRET`  | No       | Secret used to verify JWTs in the auth middleware        |

> The MySQL connection uses the default port (3306). The auth middleware is included in the codebase but is not currently mounted on the routes — wire it in before relying on it to protect any endpoint.

### Database schema

The API expects the following tables to exist in your MySQL database:

- **`PF_ContactReceipt`** — `PF_ContactReceiptID`, `Name`, `Email`, `Company`, `CreateDate`
- **`PF_MessageReceipt`** — `PF_MessageReceiptID`, `Message`, `PF_ContactReceiptID` (FK), `CreateDate`
- **`PF_ContactCompanyHistory`** — `PF_ContactReceiptID`, `OldCompany`, `NewCompany`, `ChangeDate`

> Table creation is not handled by the app. Verify exact column types against your database before deploying.

### Running

The entry point is `server.js`:

```bash
node server.js
```

The API starts on `http://localhost:5000` (or the `PORT` you configure). CORS is restricted to `https://matheusbatistadev.com`.

## API

All routes are mounted under `/api/messages`.

| Method | Endpoint             | Description                                                        |
| ------ | -------------------- | ----------------------------------------------------------------- |
| POST   | `/api/messages/send` | Submit a contact message.                                         |
| GET    | `/api/messages/list` | List stored messages, including the contact's company at the time. |
| GET    | `/api/messages/sync` | Sync/health endpoint.                                             |

### POST `/api/messages/send`

Request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Hi Matheus, I'd love to chat about a role.",
  "company": "Acme Inc."
}
```

`name`, `email`, and `message` are required; `company` is optional.

Responses:

| Status | Body                                                          |
| ------ | ------------------------------------------------------------- |
| `201`  | `{ "message": "Message sent successfully", "id": <messageId> }` |
| `400`  | `{ "error": "All fields are required" }`                      |
| `500`  | `{ "error": "Failed to send message", "details": <error> }`   |

### GET `/api/messages/list`

Returns an array of stored messages. On failure, responds with `500` and `{ "error": "Failed to retrieve messages", "details": <error> }`.

### GET `/api/messages/sync`

Returns `200` with an empty body.

## Project structure

```
.
├── server.js                          # Express app entry point
├── config/
│   └── db.js                          # MySQL connection (mysql2)
└── src/
    ├── routes/
    │   └── messageRoutes.js           # /api/messages routes
    ├── controllers/
    │   └── messageController.js       # sendMessage, getMessages, sync
    ├── models/
    │   └── Message.js                 # SQL queries / data access
    └── middlewares/
        └── auth.js                    # API key / JWT auth (not yet mounted)
```

## Contact

Matheus Batista — matheus.sbatista@outlook.com

## License

[MIT](LICENSE)
