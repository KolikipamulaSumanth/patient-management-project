# Hospital Management System

A full-stack hospital and patient management platform built with Spring Boot, React, MySQL, and a microservices-ready platform layer.

This project showcases:

- multi-role access for platform admins, hospital admins, doctors, and patients
- multi-hospital tenancy and scoped administration
- doctor management and weekly availability scheduling
- patient self-registration and JWT authentication
- appointment booking plus lifecycle operations like confirm, reschedule, and cancel
- a microservices-ready foundation with Eureka discovery, API gateway, Docker, Actuator, and Flyway

## Resume Summary

Built an enterprise-style hospital management platform with:

- Spring Boot 3, Java 21, React, Material UI, MySQL, JWT, and Maven
- multi-tenant hospital administration with role-based security
- appointment lifecycle workflows and doctor availability validation
- microservices-ready architecture using API gateway and service discovery
- containerized local deployment and live API verification

## Key Features

- Authentication
  JWT-based login and patient self-registration
- Role-based access control
  Platform admin, hospital admin, doctor, and patient flows
- Multi-hospital management
  Hospital CRUD, hospital admins, and scoped doctor management
- Doctor operations
  Doctor profile management and weekly availability slots
- Patient operations
  Patient listing and admin-managed CRUD
- Appointment operations
  Booking, listing, rescheduling, confirmation, cancellation, and hospital calendar views
- Platform readiness
  Eureka discovery server, Spring Cloud Gateway, Dockerfiles, Docker Compose, Flyway, and Actuator health checks

## Architecture

### Frontend

- React 18
- Material UI
- Axios API layer
- Role-aware navigation and workflows

### Main backend service

- Spring Boot 3.2.5
- Java 21
- Spring Security + JWT
- Spring Data JPA + MySQL
- Spring Validation
- Spring Mail
- Springdoc OpenAPI
- Flyway
- Actuator

### Platform services

- `microservices/discovery-server`
  Eureka registry on port `8761`
- `microservices/api-gateway`
  Gateway on port `8080` routing `/api/**` to `patient-service`

## Project Structure

```text
fullstack-app/
|- backend/
|- frontend/
|- microservices/
|  |- api-gateway/
|  `- discovery-server/
|- docker-compose.yml
|- VERIFICATION_NOTE.md
`- README.md
```

## Verified API Status

The backend was verified live against MySQL with a full endpoint sweep.

- Total checks: `43`
- Passed: `43`
- Failed: `0`

See [VERIFICATION_NOTE.md](./VERIFICATION_NOTE.md) for the exact verification scope.

## Local Run

### Backend

From `backend/`:

```bash
mvn spring-boot:run
```

Runs on `http://localhost:4000`

### Discovery server

From `microservices/discovery-server/`:

```bash
mvn spring-boot:run
```

Runs on `http://localhost:8761`

### API gateway

From `microservices/api-gateway/`:

```bash
mvn spring-boot:run
```

Runs on `http://localhost:8080`

### Frontend

From `frontend/`:

```bash
npm install
npm start
```

Runs on `http://localhost:3000`

## Docker Run

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Gateway: `http://localhost:8080`
- Discovery: `http://localhost:8761`
- Backend: `http://localhost:4000`

## Environment Setup

Use [.env.example](./.env.example) as a starting point for local or deployment configuration.

Important:

- do not commit real database passwords
- do not commit SMTP credentials
- do not commit production JWT secrets
- use environment variables or a secret manager in deployment

## Resume / Interview Talking Points

- Designed and implemented a role-based hospital platform with multi-tenant boundaries
- Added appointment lifecycle management with validation against doctor availability
- Fixed production-style runtime issues by aligning database schema and authorization logic
- Extended the monolith into a microservices-ready platform using service discovery and gateway patterns
- Added deployment-oriented improvements including Docker, health checks, Flyway, and verification reporting

## Next Extensions

- EMR and medical records service
- notification and reminders service
- billing and invoice service
- refresh tokens and revocation
- audit logging and monitoring
- CI/CD and cloud deployment
