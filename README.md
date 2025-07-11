# DigiVault – Digital Wallet System

A secure and intelligent digital wallet system with cash management, fraud detection, user analytics, and a modern frontend interface.

---

## Features

- **JWT-based Authentication**  
  Secure login and signup using bcrypt password hashing and JWT-based token authentication.

- **Wallet Operations**  
  - Add and withdraw funds  
  - Peer-to-peer transfers  
  - Soft-deletion of transactions with audit logging

- **Fraud Detection Engine**  
  - Detects unusually large transactions  
  - Flags high-frequency transfers  
  - Enforces daily transaction limits

- **Admin Dashboard**  
  - System statistics  
  - Suspicious transactions  
  - Deleted users list  
  - Top users by balance and transaction volume  
  - Manual fraud scan trigger

- **Frontend (React + Next.js)**  
  - Built with TypeScript and Tailwind CSS  
  - Responsive and modern user interface  
  - Fully integrated with Flask backend

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

