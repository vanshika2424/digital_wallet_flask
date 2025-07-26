# DigiVault – Digital Wallet System

A secure, scalable, and intelligent digital wallet platform supporting seamless cash management, real-time fraud detection, role-based access control, and an analytics-driven admin dashboard — powered by a modern tech stack.

---

## Authentication & Access Control

- Secure user login and registration using **bcrypt** for password hashing and **JWT-based** token authentication.
- Supports **role-based access** (User/Admin) with protected API routes and session handling.

---

## Wallet Operations

- Users can **deposit**, **withdraw**, and **transfer funds** securely between wallets.
- Real-time **wallet balance updates** with proper validation and transaction status handling.
- Users can **view their full transaction history**, including amount, type, timestamp, and status.
- Implements **soft-deletion of transactions** with audit logging to maintain data integrity.

---

## Fraud Detection Engine

- Detects **high-value** and **high-frequency** transactions using rule-based logic.
- Enforces **daily transaction limits** to prevent abuse or suspicious behavior.
- Includes **manual fraud scan trigger** for system-wide anomaly detection.
- Can be extended with **SMTP-based alerting** for real-time fraud notifications.

---

## Admin Dashboard Features

- Displays real-time **system statistics** including total users, transaction count, volume, and platform balance.
- Admins can view:
  - **Suspicious transactions**
  - **Deleted users**
  - **Top users** by wallet balance and transaction volume
- Provides control tools like **manual fraud scans** and user/transaction soft deletion.

---

## Frontend Interface

- Developed with **Next.js (React)**, **TypeScript**, and **Tailwind CSS**.
- Fully **responsive**, modern UI with intuitive navigation and **dark mode toggle**.
- Integrates seamlessly with Flask backend via RESTful APIs.
- Features include dashboard views, filtering, and real-time data rendering.

---
## Tech Stack

| Layer       | Technology                         |
|-------------|-------------------------------------|
| Backend     | Python Flask, SQLite, JWT, bcrypt  |
| Frontend    | React, Next.js (TypeScript), Tailwind CSS |
| API         | RESTful APIs                        |
| Deployment  | Local (ready for Render/Vercel)     |

---
## Project Structure

digital_wallet_flask/

├── digifrontend/ # Frontend built with Next.js

├── app.py # Flask backend main file

├── requirements.txt # Python backend dependencies

└── README.md # Project overview and instructions

---






