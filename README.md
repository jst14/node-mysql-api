# Node MySQL Auth API

MySQL/MariaDB, Node.js, TypeScript, and Express were used to create this REST API.
It uses Sequelize ORM to implement role-based access control (RBAC), email verification, password reset, and JWT authentication with refresh tokens.

---

## Tech Stack

- Auth: JWT access tokens + refresh tokens (HTTP-only cookies)
- Database: MySQL / MariaDB via Sequelize ORM
- Docs: Swagger UI (served from `swagger.yaml`)
- Email: Nodemailer (Ethereal for development/testing)
- Framework: Express
- Hosting: Vercel
- Runtime: Node.js + TypeScript 

---

## Features

- User registration with email verification workflow. 
- Login with short-lived JWT access tokens and long-lived refresh tokens.   
- Refresh token rotation with audit trail (`replacedByToken`). 
- Role-based access control (`Admin` and `User` roles).   
- Forgot password and reset password flows via email token.  
- Full CRUD operations for accounts (with ownership and role checks).  
- Centralized error handling and request validation via Joi.   
- Interactive API documentation via Swagger UI at `/api-docs`.   

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended)  
- MySQL or MariaDB running locally

### Installation

```bash
cd node-mysql-auth-api
npm install
Configuration
```

Create a "config.json" file in the project root (pattern from the lab).

```json
{
  "database": {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "your_mysql_password",
    "database": "node_mysql_api"
  },
  "secret": "your_jwt_secret",
  "emailFrom": "your_ethereal_email",
  "smtpOptions": {
    "host": "smtp.ethereal.email",
    "port": 587,
    "auth": {
      "user": "your_ethereal_user",
      "pass": "your_ethereal_pass"
    }
  }
}
```


--> You can generate free test SMTP credentials at: https://ethereal.email <--

# Run

```bash
# Development (with auto-reload)
npm run start:dev

# Production
npm start
```

The server will run on: http://localhost:4000

---

## Deployment

### Live Demonstration

The API is deployed and running on Vercel:

- **Backend API**: https://jslimosnero-ipt-2026-backend.vercel.app/
- **Frontend**: https://jslimosnero-ipt-2026-frontend.vercel.app/
- **API Docs (Swagger)**: https://jslimosnero-ipt-2026-backend.vercel.app/api-docs

### Vercel Environment Variables

When deploying to Vercel, configure the following environment variables in your project settings:

```
DB_HOST=mysql-database-jslimosnero.a.aivencloud.com
DB_PORT=12395
DB_USER=avnadmin
DB_PASSWORD=<your_aiven_password>
DB_NAME=defaultdb
JWT_SECRET=<your_generated_jwt_secret>
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=<your_ethereal_email>
SMTP_PASS=<your_ethereal_password>
EMAIL_FROM=<your_email>
```

**Note:** The `config.json` file is used for local development. Environment variables take precedence on production deployments.

# Roles
- **Admin** — The admin position is automatically assigned to the first registered account.
- **User** — The User role is applied to all future accounts.

# API Endpoints

Accounts

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | /accounts/register | Public | Register new account |
| POST | /accounts/verify-email | Public | Verify email with token |
| POST | /accounts/authenticate | Public | Login |
| POST | /accounts/refresh-token | Public | Refresh JWT token |
| POST | /accounts/revoke-token | User | Revoke refresh token |
| POST | /accounts/forgot-password | Public | Send password reset email |
| POST | /accounts/validate-reset-token | Public | Validate reset token |
| POST | /accounts/reset-password | Public | Reset password |
| GET | /accounts | Admin | Get all accounts |
| GET | /accounts/:id | User | Get account by ID |
| POST | /accounts | Admin | Create account |
| PUT | /accounts/:id | Admin | Update account |
| DELETE | /accounts/:id | User | Delete account |

These routes are wired through the accounts.controller.ts and account.service.ts modules, with authorization enforced by the authorize middleware.

# Swagger Docs
Visit:
'http://localhost:4000/api-docs'
Swagger UI is mounted using swagger.ts and reads the API definition from swagger.yaml.

Admin accounts have full CRUD access to all accounts and can manage any refresh token, while User accounts are restricted to their own data. 

# Token & Security Notes
- JWT access tokens expire after approximately 15 minutes. 
- Refresh tokens expire after 7 days and are stored in HTTP-only cookies for improved security.
- Each refresh request rotates the token and revokes the old one to reduce the risk window of token compromise. 
- Email verification is required before login is allowed.

# Development Notes (Lab 6)
This project was built as part of a lab activity to practice:

- Building a typed Node.js/Express API with TypeScript.
- Integrating Sequelize with MySQL, including model relationships and sync.
- Implementing JWT auth, refresh tokens, and RBAC with middleware.
- Sending verification and reset emails via Nodemailer and Ethereal SMTP.
- Testing the full auth flow using Postman (registration, verification, login, refresh, revoke, CRUD, and delete).