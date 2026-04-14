# Architecture Overview

## Current Shape

This project currently uses a modular full-stack architecture with a primary business service plus supporting platform services.

### Services

- `frontend`
  React UI for all roles
- `backend`
  Main domain service handling auth, hospitals, doctors, patients, availability, and appointments
- `microservices/discovery-server`
  Eureka registry for service discovery
- `microservices/api-gateway`
  Gateway and edge routing for `/api/**`

## Domain Boundaries

### Implemented inside the main backend service

- authentication
- user profile and role handling
- hospital management
- doctor management
- patient management
- availability slots
- appointments and appointment lifecycle

### Natural future service extraction points

- `auth-service`
  refresh tokens, MFA, revocation, account lockout
- `emr-service`
  visit notes, prescriptions, lab orders, documents
- `notification-service`
  reminders, email/SMS events, async workflows
- `billing-service`
  invoices, payments, insurance, settlement flows
- `reporting-service`
  dashboards, analytics, exports

## Security Model

- JWT-based stateless authentication
- role-based authorization
- platform-admin vs hospital-admin separation
- hospital scoping for managed data

## Deployment Model

### Local development

- frontend on `3000`
- backend on `4000`
- gateway on `8080`
- discovery on `8761`
- MySQL as the primary database

### Containerized local stack

The repository includes Dockerfiles for all runnable services and a `docker-compose.yml` for local orchestration.

## Verification

The API surface has been exercised end-to-end and recorded in [VERIFICATION_NOTE.md](./VERIFICATION_NOTE.md).
