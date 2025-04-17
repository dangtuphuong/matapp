# MatApp - Engineering Materials Selection and Management

MatApp is a modern full-stack web application that simplifies the process of selecting, registering, and managing users for engineering materials-related workflows. The system supports three user roles: **Admin**, **Normal User**, and **Premium User**, each with tailored features and access.

---

## Features

### 🔐 Authentication & User Roles

- JWT-based user authentication using Flask and React
- Roles stored as numbers in MongoDB:
  - `0` → Admin
  - `1` → Normal User
  - `2` → Premium User
- Protected routes via role-based access control

### 👤 Registration

- Fields: First Name, Last Name, Email, Password, Confirm Password, Gender, DOB, Role
- Password policy: must include uppercase, lowercase, number, and symbol
- Prevents invalid DOB and missing gender
- Role selection via radio buttons
- All registration fields are saved to MongoDB

### 🧑 Profile Page

- Displays full user info including role
- Dynamic buttons based on role:
  - **Normal User**: `Go Premium`
  - **Premium User**: `Export Data`
  - **Admin**: `Edit Users`, `Export Data`

### 🛡️ Admin Panel: Edit Users

- Table listing all users (excluding self)
- View user details (excluding password)
- Edit user info (modal)
- Reset password (modal with new password input)
- Delete any user (except self)
- Tooltip for icons for better UX

### ⏲️ Session Timeout

- Automatic logout after 15 minutes of inactivity
- Resets on user actions like mousemove, keypress, etc.

---

## Tech Stack

### 🧠 Backend

- Python Flask
- Flask-JWT-Extended
- Flask-Bcrypt
- Flask-PyMongo
- MongoDB (cloud or local)

### 🎨 Frontend

- React
- React Router v6
- MUI (Material UI) for components and layout
- Axios for API requests

---
