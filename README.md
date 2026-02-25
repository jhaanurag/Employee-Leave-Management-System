# Employee Leave Management System

Production-style full-stack Leave Management System with secure authentication, strict role-based authorization, and role-specific dashboards for Employee, Manager, and Admin workflows.

## Features

- JWT authentication with bcrypt password hashing
- Role-based access control enforced on backend and frontend
- Protected API routes and React route guards
- Employee leave application with annual balance tracking and leave caps
- Leave policy enforcement (annual day limit, max days per request, max pending requests)
- Employee self-cancel for pending leave requests
- Employee reimbursement claims (amount, category, expense date, description)
- Employee self-cancel for pending reimbursement claims
- Manager request review (Approve/Reject + optional remarks)
- Manager reimbursement review (Approve/Reject + optional remarks)
- Manager and Admin analytics cards with status summaries and filters
- Admin user creation and role management
- Global auth state using React Context API
- Input validation and structured API responses

## Tech Stack

- Frontend: React, Tailwind CSS, React Router, Context API, Axios
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt

## Project Structure

```text
server/
  config/
    db.js
  controllers/
    authController.js
    leaveController.js
    reimbursementController.js
    userController.js
  middleware/
    authMiddleware.js
    roleMiddleware.js
    validateRequest.js
    errorMiddleware.js
  models/
    User.js
    Leave.js
    Reimbursement.js
  routes/
    authRoutes.js
    leaveRoutes.js
    reimbursementRoutes.js
    userRoutes.js
  .env
  .env.example
  server.js

src/
  context/
    AuthContext.jsx
  pages/
    Login.jsx
    EmployeeDashboard.jsx
    ManagerDashboard.jsx
    AdminPanel.jsx
  components/
    ProtectedRoute.jsx
    Sidebar.jsx
    LeaveCard.jsx
    LeaveTable.jsx
  services/
    api.js
  App.jsx
```

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Configure backend environment:

```bash
copy server/.env.example server/.env
```

3. Configure frontend environment (optional if using Vite proxy):

```bash
copy .env.example .env
```

4. Ensure MongoDB is running locally or provide a hosted `MONGO_URI`.

5. Start both frontend + backend:

```bash
npm run dev
```

6. Open:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## Environment Variables

Backend (`server/.env`):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017
MONGO_DB_NAME=employee_leave_management
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
LEAVE_ANNUAL_LIMIT_DAYS=24
LEAVE_MAX_REQUEST_DAYS=10
LEAVE_MAX_PENDING_REQUESTS=3
```

Frontend (`.env`):

```env
VITE_API_URL=http://localhost:5000/api
```

## Auth and Role Bootstrap

- Public registration is enabled.
- The first registered user is auto-assigned `Admin`.
- Every later registration is assigned `Employee`.
- Admin can create Managers/Admins/Employees from Admin Panel.

## API Documentation

Base URL: `/api`

### Auth

- `POST /auth/register`
  - body: `{ "name": "User", "email": "user@x.com", "password": "password123" }`
- `POST /auth/login`
  - body: `{ "email": "user@x.com", "password": "password123" }`
- `GET /auth/me` (private)
- `POST /auth/logout` (private)

### Leaves

- `POST /leaves` (Employee)
  - body: `{ "startDate": "2026-03-01", "endDate": "2026-03-03", "reason": "Family event" }`
- `GET /leaves/my` (Employee)
- `PATCH /leaves/:id/cancel` (Employee)
- `GET /leaves/manager` (Manager)
- `PATCH /leaves/:id/review` (Manager)
  - body: `{ "status": "Approved", "remarks": "Approved for project coverage" }`
- `GET /leaves/admin` (Admin)

### Reimbursements

- `POST /reimbursements` (Employee)
  - body: `{ "title": "Airport taxi", "category": "Travel", "amount": 42.50, "expenseDate": "2026-02-21", "description": "Travel from airport to office" }`
- `GET /reimbursements/my` (Employee)
- `PATCH /reimbursements/:id/cancel` (Employee)
- `GET /reimbursements/manager` (Manager)
- `PATCH /reimbursements/:id/review` (Manager)
  - body: `{ "status": "Approved", "remarks": "Receipts verified" }`
- `GET /reimbursements/admin` (Admin)

### Users

- `GET /users` (Admin)
- `POST /users` (Admin)
  - body: `{ "name": "Jane", "email": "jane@x.com", "password": "password123", "role": "Manager" }`
- `PATCH /users/:id/role` (Admin)
  - body: `{ "role": "Employee" }`

### Auth Header

For private endpoints, pass JWT as Bearer token:

```http
Authorization: Bearer <token>
```

## Validation and Security

- Passwords are hashed with bcrypt before storage
- JWT tokens have expiration and expired token handling
- Backend `verifyToken` middleware protects private APIs
- Backend `authorizeRoles(...roles)` enforces role access
- Frontend `ProtectedRoute` blocks unauthorized dashboard access
- Backend validation via `express-validator`
- Password field is excluded from query results

## Screenshots

Add screenshots under `docs/screenshots/`:

- `login.png`
- `employee-dashboard.png`
- `manager-dashboard.png`
- `admin-panel.png`

## Scripts

- `npm run dev` - run frontend and backend in parallel
- `npm run dev:client` - start Vite frontend
- `npm run dev:server` - start Express server (nodemon)
- `npm run build` - build frontend for production
- `npm run start` - start backend server
