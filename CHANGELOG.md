# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres
to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-06-27

### Added
- Multi-tenant data model (User / Membership / Organization) with per-tenant context.
- Role-based access control (OWNER / ADMIN / MEMBER).
- Plan limits (seats / projects) enforced server-side.
- Stripe checkout, customer portal and idempotent webhook handling.
- Email/password auth with bcrypt and signed JWT session cookies.
