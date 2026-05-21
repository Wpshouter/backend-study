# 📚 StudyNook Backend API

Backend server for the StudyNook full-stack study room booking platform. This API handles authentication, room management, booking systems, conflict detection, and protected user operations.

---

## 🌐 Frontend Live Site

🔗 https://study-nook-one.vercel.app/

---

## 🚀 Backend Features

- 🔐 JWT Authentication with HTTP-only cookies
- 🏢 Create, update, delete, and fetch study room listings
- 📅 Booking system with real-time overlap conflict prevention
- ❌ Booking cancellation functionality
- 🔎 Search and filter rooms using MongoDB operators
- 📊 Featured/latest rooms endpoint
- 👤 User-specific booking and room management
- ⚡ RESTful API built with Express.js and MongoDB
- 🌍 CORS enabled for frontend communication
- 🛡️ Protected private routes using JWT verification middleware

---

## 🛠️ Technologies Used

- Node.js
- Express.js
- MongoDB
- JWT (jsonwebtoken)
- dotenv
- cookie-parser
- cors

---

## 📂 API Endpoints

### 🏢 Rooms

| Method | Endpoint | Description |
|---|---|---|
| GET | `/rooms` | Get all rooms |
| GET | `/room/:room_id` | Get single room |
| POST | `/rooms` | Add new room |
| PATCH | `/rooms/:room_id/edit` | Edit room |
| DELETE | `/rooms/:room_id` | Delete room |
| GET | `/featured-rooms` | Get latest 6 rooms |

---

### 🔎 Room Filtering

Supports:
- Search by room name using `$regex`
- Filter amenities using `$in`

Examples:

```txt
/rooms?search=meeting