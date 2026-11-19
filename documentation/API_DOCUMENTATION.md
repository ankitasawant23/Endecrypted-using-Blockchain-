# Blockchain-Based Secure Encryption and Decryption System
## Backend API Documentation

Base URL: http://localhost:5000

All protected APIs require:
Authorization: Bearer <JWT_TOKEN>

---

### 1. User Registration

POST /api/auth/register

Body:
{
  "name": "Ankita",
  "email": "ankita@example.com",