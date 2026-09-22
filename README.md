# EduControl - Automated Student Attendance Monitoring via Video Surveillance Cameras

EduControl is a modern, high-performance web platform for automatic student attendance monitoring powered by video surveillance cameras, computer vision, and facial biometric recognition.

The system continuously scans live CCTV camera feeds (entrance gates, exit turnstiles, corridors, and webcams), recognizes registered student faces in real-time, marks arrivals and departures with precision, and provides school administrators with an intuitive, responsive management and analytics console.

---

## Architecture & System Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
- **Backend**: Node.js, NestJS, Prisma ORM, JWT, Bcrypt.
- **Database**: PostgreSQL (Prisma schema ready for PostgreSQL, with SQLite zero-configuration local dev fallback enabled out of the box).
- **Computer Vision & Video Surveillance**:
  - **Python OpenCV Service (`cv_service/`)**: Standalone surveillance agent connecting to RTSP IP cameras, USB webcams, or video streams for automated face detection and attendance ingestion.
  - **In-Browser Real-time Camera Visualizer**: Interactive canvas HUD with face detection box, live webcam stream, and CCTV simulation mode.

---

## Key Features

1. **Administrator Authentication**:
   - Secure login with JWT authentication and bcrypt password encryption.
   - Protected routes and session management.
   - One-click demo credentials autofill (`admin@educontrol.com` / `admin123`).

2. **Real-time Video Surveillance & Camera Monitoring**:
   - Multi-camera monitoring grid (Main Entrance Gate, South Exit Turnstile, Library Entrance, Science Corridor).
   - Support for live browser webcam, IP/RTSP camera feeds, and CCTV simulation.
   - Dynamic HUD canvas overlay rendering green recognition bounding boxes, student names, confidence percentages, and arrival/departure tags.
   - Automated debounce filter (prevents spamming duplicate detections within configurable cooldown window).

3. **Automatic Attendance Engine**:
   - **Arrival Tracking**: First camera detection of the day records official Check-In time.
   - **Departure Tracking**: Detection at exit gates or end of day logs official Check-Out time.
   - **On-time vs Late Policy**: Configurable cutoff time (default: 09:00 AM); arrivals after the cutoff are automatically flagged as `LATE`.
   - **Absence Detection**: One-click bulk absence registration for enrolled students not detected by any camera.

4. **Analytics Dashboard**:
   - Real-time KPI summary: Total Enrolled Students, Present Today, Absent Today, Attendance Rate %, and Active Cameras.
   - Hourly arrival distribution area chart (peaks between 07:00 and 18:00).
   - Department-level attendance progress bars.
   - Live audit stream ticker showing camera detections in real-time.

5. **Student Management**:
   - Register, view, edit, and delete student records.
   - Facial reference photo upload and biometric embedding assignment.
   - Search by student name, email, or student ID code.
   - Filter by department and academic year.
   - Individual student profile modal displaying attendance history and punctuality.

6. **Attendance Reports & Export**:
   - Search and filter records by student, date range, department, and status (`PRESENT`, `LATE`, `ABSENT`).
   - One-click CSV export: downloads clean spreadsheet formatted with student details and check-in/out timestamps.
   - Manual override tool for administrators to update attendance status or timestamps.

7. **System & Policy Settings**:
   - Add and configure RTSP surveillance camera streams.
   - Adjust facial recognition confidence threshold slider.
   - Configure late arrival cutoff time and detection debounce cooldown.

---

## Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+
- *(Optional)* **Python 3.8+** with OpenCV for running the standalone hardware RTSP camera worker.
- *(Optional)* **Docker** for running local PostgreSQL if preferred over the default SQLite database.

### 2. Running Backend Server (NestJS)

```bash
cd server
npm install
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts   # Pre-loads admin, 10 sample students, 4 cameras, and attendance logs
npm run start
```
The backend API starts on **`http://localhost:5000`**.

### 3. Running Frontend Admin Portal (Next.js)

```bash
cd client
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

- **Admin Login Email**: `admin@educontrol.com`
- **Password**: `admin123`
*(Or click the "Fill Default Demo Credentials" button on the login screen).*

### 4. Running Python OpenCV Surveillance Agent (Optional)

To connect a physical USB webcam or RTSP camera stream via Python:

```bash
cd cv_service
pip install -r requirements.txt
python surveillance_agent.py --camera-id "CAM-ENTRANCE-01" --source 0 --mode AUTO
```
- Replace `--source 0` with your RTSP camera link (e.g. `rtsp://admin:pass@192.168.1.100:554/stream1`) or video file path.

---

## Database Configuration (PostgreSQL / SQLite)

EduControl uses Prisma ORM. By default, it operates with zero-setup SQLite (`file:./dev.db`).

To switch to **PostgreSQL**:
1. Run `docker-compose up -d` in the root directory.
2. In `server/prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
3. In `server/.env`, set:
   ```env
   DATABASE_URL="postgresql://educontrol:educontrol_secret@localhost:5432/educontrol_db?schema=public"
   ```
4. Run `npx prisma db push` and `npx ts-node prisma/seed.ts`.

---

## REST API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Administrator login (returns JWT token) |
| `GET` | `/api/auth/me` | Fetch active admin profile |
| `GET` | `/api/dashboard/metrics` | Real-time statistics, hourly arrival chart, and department rates |
| `GET` | `/api/students` | List students with search and department filtering |
| `POST` | `/api/students` | Enroll a new student with biometric reference photo |
| `PUT` | `/api/students/:id` | Update student details |
| `DELETE` | `/api/students/:id` | Delete student and their attendance history |
| `GET` | `/api/students/descriptors` | Export facial vectors for Python CV service |
| `GET` | `/api/cameras` | List configured surveillance cameras |
| `POST` | `/api/cameras` | Register a new surveillance camera stream |
| `POST` | `/api/attendance/detect` | Ingestion endpoint for camera detections (Arrival / Departure) |
| `GET` | `/api/attendance` | Query attendance records with date and status filters |
| `PUT` | `/api/attendance/:id` | Admin override of attendance record status |
| `POST` | `/api/attendance/mark-absent` | Bulk mark unrecorded students as absent |
