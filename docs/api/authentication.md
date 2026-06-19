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
