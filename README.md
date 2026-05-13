# Tayarny Airlines — Flight Reservation System

Full-stack flight reservation system built as a software engineering project. The application models a typical booking lifecycle and supports two roles: **Customer** and **Administrator**.

## Contents

- [Features](#features)
- [Architecture](#architecture)
- [Security](#security)
- [Quick Start (Docker)](#quick-start-docker)
- [Configuration](#configuration)
- [Local Development (Optional)](#local-development-optional)
- [Testing](#testing)
- [Documentation & UML](#documentation--uml)
- [License](#license)

## Features

**Customer**
- Search flights by origin, destination, and date
- Select seats across cabin classes (Economy, Business, First Class)
- Manage reservations and view tickets

**Administrator**
- Manage airports, airplane models, and flight schedules
- Manage users and role assignments

## Architecture

| Layer | Technology |
|---|---|
| Backend | Spring Boot (REST API), Spring Security (JWT), Spring Data JPA, Flyway |
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Database | PostgreSQL |
| Infra | Docker, Docker Compose |

Default local ports when running via Docker Compose:
- Frontend: http://localhost:3000
- Backend API: http://localhost:9090
- Postgres: localhost:5432

## Security

Authentication and authorization are implemented with **JWT** and **role-based access control** using Spring Security.

## Quick Start (Docker)

Prerequisites: Docker + Docker Compose.

```bash
docker compose up --build
```

If your system still uses the legacy plugin:

```bash
docker-compose up --build
```

## Configuration

The default values are defined in [docker-compose.yml](docker-compose.yml). For anything beyond local development, change secrets/passwords.

**Database**
- `POSTGRES_USER` (default: `postgres`)
- `POSTGRES_PASSWORD` (default: `your_password`)
- `POSTGRES_DB` (default: `flight_booking_db`)

**Backend**
- `SPRING_DATASOURCE_URL` (default: `jdbc:postgresql://db:5432/flight_booking_db`)
- `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD`
- JWT secret can be overridden using the Spring environment mapping for `app.jwt.secret` (e.g., `APP_JWT_SECRET`).

**Frontend**
- `NEXT_PUBLIC_API_URL` (default: `http://localhost:9090`)
- `NEXT_PUBLIC_BASE_URL` / `NEXTAUTH_URL` (default: `http://localhost:3000`)
- `NEXTAUTH_SECRET` (default placeholder in compose; replace for real usage)

## Local Development (Optional)

Docker is the recommended path for a consistent DB + network setup. If you prefer running services locally:

**Backend**
- Requirements: a JDK compatible with the version configured in [backend/pom.xml](backend/pom.xml) and the Maven wrapper.

```bash
cd backend
./mvnw test
./mvnw spring-boot:run
```

Note: the default datasource points to `db` (the Docker service). For local Postgres, override `SPRING_DATASOURCE_URL` to `jdbc:postgresql://localhost:5432/flight_booking_db`.

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

## Testing

**Backend tests**
- Run the full suite:

```bash
cd backend
./mvnw test
```

- Test overview: [backend/docs/TEST_DOCUMENTATION.md](backend/docs/TEST_DOCUMENTATION.md)

**API / workflows (scripts)**
- End-to-end API smoke flow: [test_m4_api.sh](test_m4_api.sh)
- Background job verification: [test_background_job.sh](test_background_job.sh)

**Test credentials**
- See [TEST_CREDENTIALS.md](TEST_CREDENTIALS.md)

## Documentation & UML

The [UML](UML) directory contains activity, class, sequence, state, and use-case diagrams covering key workflows and domain entities.

## License

See [LICENSE](LICENSE).
