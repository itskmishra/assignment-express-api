# User Authentication API

## Overview

This is a robust Node.js user authentication system built with Express.js and MongoDB, providing secure user management features including registration, login, token management, profile updates, and email/phone verification.

```
Potential Improvements Pending Due To Lack Of Time:
🛡️ Comprehensive input validation and sanitization
🔒 Enhanced error handling and logging
🧪 More robust unit and integration testing
🔐 Advanced rate limiting and brute-force protection
📊 Detailed logging and monitoring
🌐 CSRF protection
🔍 More granular permission and role management
```

## Features

- 🔐 Secure User Registration
- 🔑 JWT-based Authentication
- 📝 User Profile Management
- 🔄 Token Refresh Mechanism
- 📧 Email Verification
- 📱 Phone Verification
- 🔐 Password Change
- ❌ Account Deletion

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt.js

## Key Endpoints

### Authentication
- `POST /api/users/register`: User Registration
- `POST /api/users/login`: User Login
- `POST /api/users/logout`: User Logout
- `POST /api/users/tokens/refresh`: Refresh Authentication Tokens

### Profile Management
- `GET /api/users/profile`: Retrieve User Profile
- `PATCH /api/users/profile`: Update User Profile
- `DELETE /api/users/profile`: Delete User Account
- `POST /api/users/password`: Change User Password

### Verification
- `POST /api/users/email-verification/send`: Send Email Verification Token
- `POST /api/users/phone-verification/send`: Send Phone Verification Token
- `POST /api/users/email-verification/:token`: Verify Email
- `POST /api/users/phone-verification`: Verify Phone Number

## Security Features

- Password hashing with bcrypt.js
- JWT token generation and validation
- Secure HTTP-only cookies
- Email and phone number verification
- Middleware for JWT authentication

## Getting Started

### Prerequisites
- Node.js
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   ```
3. Set up environment variables
   - `ACCESS_TOKEN_SECRET`
   - `REFRESH_TOKEN_SECRET`
   - MongoDB connection string

4. Run the application
   ```bash
   npm start
   ```

## Environment Variables

| Variable                | Description                     | Example                        |
|-------------------------|--------------------------------|--------------------------------|
| `ACCESS_TOKEN_SECRET`   | Secret for access token        | `your_access_token_secret`     |
| `REFRESH_TOKEN_SECRET`  | Secret for refresh token       | `your_refresh_token_secret`    |
| `ACCESS_TOKEN_EXPIRY`   | Access token expiration time   | `15m`                          |
| `REFRESH_TOKEN_EXPIRY`  | Refresh token expiration time  | `7d`                           |
