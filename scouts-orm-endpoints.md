# Scouts ORM Endpoints

Base URL in local development: `http://localhost:4174`

Source: `F:\Projects\Codex\Scouts\scouts.orm\server.js`

## Public and Service Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Returns `{ "ok": true }` when the ORM service is running. |
| `GET` | `/openapi.json` | Public | Returns the OpenAPI document defined by the service. |
| `GET` | `/api/public` | Public | Returns public-facing data: `events` and `patrols`. Does not include scouts, adults, or relationships. |

## Authenticated Read Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/me/dashboard` | Any authenticated member role | Returns `{ actor, data }`, with `data` scoped to the actor. Scouts and parents only receive linked scout data; operational roles receive full data. |
| `GET` | `/api/scouts/:scoutId` | Authenticated actor with access to that scout | Returns `{ scout }` for a single scout. Accessible to operational roles, the scout themself, or linked adults/parents. |
| `GET` | `/api/admin/data` | Operational read access | Returns `{ actor, data }` with the full ORM data payload. Allowed for administrators, adult leaders, and committee members. |
| `GET` | `/api/data` | Operational read access | Returns the full ORM data payload. Allowed for administrators, adult leaders, and committee members. |

## Authenticated Write Endpoints

All write endpoints replace the full collection named in the request body.

| Method | Endpoint | Access | Request Body | Description |
| --- | --- | --- | --- | --- |
| `POST` | `/api/scouts` | Operational write access | `{ "scouts": [...] }` | Replaces all scouts. Allowed for administrators and adult leaders. |
| `POST` | `/api/adults` | Operational write access | `{ "adults": [...] }` | Replaces all adults. Allowed for administrators and adult leaders. |
| `POST` | `/api/adult-leaders` | Operational write access | `{ "adultLeaders": [...] }` | Replaces all adult leader records. Allowed for administrators and adult leaders. |
| `POST` | `/api/adult-scout-relationships` | Administrator only | `{ "adultScoutRelationships": [...] }` | Replaces all adult/scout relationships. |
| `POST` | `/api/patrols` | Operational write access | `{ "patrols": [...] }` | Replaces all patrols. Allowed for administrators and adult leaders. |
| `POST` | `/api/events` | Administrator or adult leader | `{ "events": [...] }` | Replaces all events. |

## Role Notes

The ORM service recognizes these role strings:

| Role Constant | Role String |
| --- | --- |
| `PUBLIC` | `public` |
| `SCOUT` | `scout` |
| `PARENT` | `parent` |
| `ADULT_LEADER` | `adult_leader` |
| `COMMITTEE_MEMBER` | `committee_member` |
| `ADMINISTRATOR` | `administrator` |

Access groups used by the endpoints:

| Access Group | Roles |
| --- | --- |
| Member access | `scout`, `parent`, `adult_leader`, `committee_member`, `administrator` |
| Operational read access | `adult_leader`, `committee_member`, `administrator` |
| Operational write access | `adult_leader`, `administrator` |
| Administrator only | `administrator` |

## Authentication

Protected endpoints expect an `Authorization` header with a bearer token:

```http
Authorization: Bearer <token>
```

The ORM service validates that token by calling the auth service at:

```text
<AUTH_BASE_URL>/auth/me
```

By default, `AUTH_BASE_URL` is:

```text
http://127.0.0.1:3000
```

## Response Statuses

| Status | Meaning |
| --- | --- |
| `200` | Request succeeded. |
| `401` | Authentication is required or the token is invalid. |
| `403` | The actor is authenticated but does not have the required role or scout access. |
| `404` | Route not found, or scout not found for `/api/scouts/:scoutId`. |
