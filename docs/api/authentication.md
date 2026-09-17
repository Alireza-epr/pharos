# Authentication

The API uses **JWT bearer authentication** with a short-lived **access token** and a long-lived **refresh token**. Protected endpoints reject requests without a valid access token.

## Tokens at a glance

| Token         | Lifetime (default)              | Where it goes                          | Purpose                                                      |
| ------------- | ------------------------------- | -------------------------------------- | ------------------------------------------------------------ |
| Access token  | 1 hour (`jwt_expiry`)           | `Authorization: Bearer <token>` header | Authorizes calls to protected endpoints                      |
| Refresh token | 7 days (`refresh_token_expiry`) | Request body of `/auth/refresh`        | Obtains a fresh access token without re-entering credentials |

Both tokens are signed with `JWT_SECRET` (see the README for how that secret is provisioned). Lifetimes are configured in `apps/backend/src/config/api.ts`.

## Flow

```
1. POST /v1/auth/login  { username, password }
      └─> { accessToken, refreshToken }

2. Call protected endpoints with the access token:
      POST /v1/events  +  Authorization: Bearer <accessToken>

3. Access token expired -> 401
      POST /v1/auth/refresh  { refreshToken }
      └─> { accessToken }            then retry the original request

4. Refresh token expired/invalid -> 401
      └─> log in again (step 1)
```

## Test credentials

For local testing and demos, log in with:

- **username:** `user`
- **password:** `user`

## MCP (`POST /v1/mcp`) - a separate scheme

The MCP endpoint sits outside the flow above entirely - an AI agent isn't a
logged-in browser user, so it doesn't go through `/auth/login` or hold a
refresh token. Instead it authenticates with a single static, long-lived
API key per agent/person:

| Config | Shape | Purpose |
| --- | --- | --- |
| `MCP_API_KEYS` (env var) | JSON object, `label -> token` | One entry per person/agent; each token is checked independently |

```
POST /v1/mcp
Authorization: Bearer <one of the tokens in MCP_API_KEYS>
```

A request with a token that isn't in the map gets a flat 401 - there's no
refresh step, no expiry, and no username attached (only the label the
token maps to, used for logging). Adding or revoking one person/agent is
an env-var edit + server restart, not a code change or a database write -
deleting an entry immediately invalidates only that one token, the rest
keep working.

This is a deliberately lighter-weight stand-in for real OAuth 2.1, which
is what the MCP spec actually expects in production (dynamic client
registration, consent, token refresh). That's a meaningfully bigger
project - a real authorization server, not just a header check - and is
intentionally not built until there are real external users to justify
it.
