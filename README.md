# ✈️ Tayarny Airlines — Flight Reservation System

A comprehensive full-stack flight reservation system built as a software engineering project. The platform models a complete booking lifecycle, supporting two distinct roles: **Passengers** and **Administrators**.

---

## Features

### Passenger
- Search for available flights by origin, destination, and date
- Select seats with tiered pricing: Economy, Business, and First Class
- Manage reservations and view digital tickets from a personal dashboard

### Administrator
- Manage airports, airplane models, and flight schedules
- Control system users and role assignments via a centralized dashboard

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17+, Spring Boot, Spring Security (JWT), Spring Data JPA, Flyway |
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Infrastructure | Docker, Docker Compose |

### Running the Project

The entire platform (backend, frontend, and database) can be spun up with a single command:

```bash
docker-compose up
```

---

## System Design & UML Documentation

A major highlight of this project is its thorough architectural planning. The `/UML` directory contains a full suite of diagrams covering both structural and behavioral aspects of the system:

- **Activity Diagrams** — Control flows for Login, Flight Booking, Payment Processing, and the Admin Panel
- **Class Diagrams** — Structural relationships between core entities: `Flight`, `Seat`, `Reservation`, `User`, `Airport`
- **Sequence Diagrams** — Object communication traces for key use cases across API and service layers
- **State Machine Diagrams** — Entity lifecycle states (e.g., Flight: `Scheduled → Departed → Arrived`; Seat: `Available → Reserved`)
- **Use-Case Diagrams** — Capabilities mapped to system actors (Passenger, Administrator)

---

## Security

Authentication and authorization are handled via **Spring Security** using **JSON Web Tokens (JWT)**, enforcing Role-Based Access Control (RBAC) across all endpoints.
