# Hospital Management System

Enterprise-style full-stack hospital management platform built with Spring Boot, React, MySQL, JWT authentication, and a microservices-ready platform layer.

The application supports role-based workflows for platform admins, hospital admins, doctors, and patients. It includes hospital management, doctor management, patient records, doctor availability, appointment booking, and appointment lifecycle actions.

## Tech Stack

### Frontend

- React 18
- Material UI
- React Router
- Axios

### Backend

- Java
- Spring Boot
- Spring Security
- JWT authentication
- Spring Data JPA
- MySQL
- Flyway migrations
- Actuator
- OpenAPI/Swagger

### Platform Services

- Spring Cloud Gateway
- Eureka Discovery Server
- Docker

## Project Structure

```text
fullstack-app/
|-- frontend/
|   |-- src/
|   |-- public/
|   |-- Dockerfile
|   |-- nginx.conf
|   |-- package.json
|
|-- backend/
|   |-- src/main/java/com/pm/patientservice/
|   |-- src/main/resources/
|   |-- Dockerfile
|   |-- pom.xml
|
|-- microservices/
|   |-- api-gateway/
|   |-- discovery-server/
|
|-- README.md
```

## Core Features

- JWT-based login and registration
- Role-based authorization
- Platform admin hospital management
- Hospital admin doctor management
- Doctor profile and availability management
- Patient registry management
- Doctor discovery for patients
- Appointment booking
- Appointment rescheduling and cancellation
- Appointment status updates: pending, confirmed, rescheduled, completed, no-show, cancelled
- Hospital calendar view
- Swagger/OpenAPI support
- Eureka service discovery
- API gateway routing

## Roles

- `ROLE_PLATFORM_ADMIN`: manage hospitals, hospital admins, doctors, patients, and appointments across the platform
- `ROLE_ADMIN`: manage doctors, availability, appointments, and patients within a hospital
- `ROLE_DOCTOR`: view patients and appointments
- `ROLE_PATIENT`: browse doctors, book visits, and manage personal appointments

## Local Development

Expected local ports:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- API Gateway: `http://localhost:8080`
- Eureka Discovery Server: `http://localhost:8761`

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd backend
mvn spring-boot:run
```

### Microservices

```bash
cd microservices/discovery-server
mvn spring-boot:run
```

```bash
cd microservices/api-gateway
mvn spring-boot:run
```

## API Highlights

Public endpoints:

- `GET /actuator/health`
- `GET /hospitals`
- `GET /doctors`
- `GET /doctors/{id}`
- `GET /doctors/{id}/availability`

Authentication:

- `POST /auth/login`
- `POST /auth/register`
- `GET /users/me`

Hospital management:

- `POST /hospitals`
- `PUT /hospitals/{id}`
- `POST /hospitals/{id}/admins`
- `GET /hospitals/{id}/admins`
- `GET /hospitals/{id}/calendar`

Doctor and availability management:

- `GET /doctors`
- `POST /doctors`
- `PUT /doctors/{id}`
- `POST /doctors/{id}/delete`
- `POST /doctors/{id}/availability`
- `PUT /doctors/{id}/availability/{slotId}`
- `POST /doctors/{id}/availability/{slotId}/delete`

Patient and appointment management:

- `GET /patients`
- `POST /patients`
- `PUT /patients/{id}`
- `DELETE /patients/{id}`
- `POST /appointments`
- `GET /appointments`
- `GET /appointments/my`
- `PUT /appointments/{id}/reschedule`
- `POST /appointments/{id}/status`
- `POST /appointments/{id}/cancel`
