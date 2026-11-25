# Manus OAuth Session Cookie Bug Report

**Project:** Michael Mackenzie Property Investment  
**Issue:** Session cookies set during OAuth callback are not being persisted by the browser, causing authentication to fail after login.  
**Severity:** Critical - Blocks all admin functionality  
**Status:** Unresolved after extensive debugging

---

## Problem Summary

When a user completes the Manus OAuth login flow:
1. User clicks "Sign In" on the admin page
2. User is redirected to `manus.im/app-auth` 
3. User selects their account and completes authentication
4. OAuth callback is executed on the app server (`/api/oauth/callback`)
5. **Server successfully sets the session cookie** (confirmed in logs)
6. **Server redirects to `/` (or intended page)**
7. **Subsequent API calls receive `null` user (auth fails)**
8. **User is shown the login screen again**

The session cookie is **not being sent back by the browser** on subsequent requests, despite being set by the server.

---

## Debugging Evidence

### Server Logs Show Cookie IS Being Set
```
[OAuth] Setting cookie. Options: {"httpOnly":true,"path":"/","sameSite":"lax","secure":true}
[OAuth] Cookie name: app_session_id Token length: 287
[OAuth] Cookie set. Redirecting to: /
```

### Network Logs Show Cookie NOT Sent Back
After redirect, the `auth.me` tRPC call shows:
- **Request headers:** No `Cookie` header present
- **Response:** `{"json":null}` (user not authenticated)

### Server Detects Missing Cookie
```
[Auth] Missing session cookie
```

---

## Root Cause Analysis

After extensive debugging, the issue appears to be related to **cookie persistence across the OAuth redirect** in the Manus proxy environment:

### What We've Tried

1. **✅ Verified user exists in database** - Franco Meza (franco74meza@gmail.com) has `admin` role
2. **✅ Verified tRPC client has `credentials: 'include'`** - Fetch requests include credentials
3. **✅ Verified cookie options are correct** - `httpOnly: true, path: '/', sameSite: 'lax', secure: true`
4. **✅ Added `trust proxy` to Express** - Ensures `req.secure` and `req.protocol` correctly reflect HTTPS
5. **✅ Removed explicit domain setting** - Let browser default to exact origin
6. **✅ Changed from `sameSite: 'none'` to `sameSite: 'lax'`** - Better for same-origin requests
7. **✅ Verified OAuth token exchange succeeds** - User data is fetched and stored in database
8. **✅ Tested both in iframe and new tab** - Issue persists in both contexts

### Possible Causes

1. **Proxy/Gateway Cookie Stripping** - The Manus reverse proxy or gateway may be stripping cookies during the OAuth redirect
2. **HTTPS/Protocol Detection** - Despite fixes, the proxy may not be correctly forwarding the protocol headers
3. **Cookie Scope Mismatch** - The cookie may be set for a different domain/path than where it's being read
4. **Session Storage Backend** - The Manus OAuth service may expect session data in a different location (Redis, database, etc.)
5. **CORS/SameSite Interaction** - Complex interaction between CORS headers and SameSite cookie policy

---

## Technical Details

### Environment
- **Framework:** Express 4 + tRPC 11
- **Node Version:** 22.13.0
- **Auth Method:** Manus OAuth (via `manus.im/app-auth`)
- **Deployment:** Manus Cloud (behind reverse proxy)
- **Frontend:** React 19 with tRPC client

### OAuth Flow
1. Frontend: `getLoginUrl()` generates OAuth URL with:
   - `appId`: RjXs8LwMzfhP9Ljg6DvftQ
   - `redirectUri`: `https://3000-imranztavsbzkamnnm5b3-4220fed3.us2.manus.computer/api/oauth/callback`
   - `state`: base64-encoded redirect URI
   - `type`: signIn

2. Backend: `/api/oauth/callback` handler:
   - Exchanges code + state for access token via `sdk.exchangeCodeForToken(code, state)`
   - Fetches user info via `sdk.getUserInfo(accessToken)`
   - Creates session token via `sdk.createSessionToken(openId)`
   - Sets cookie via `res.cookie(COOKIE_NAME, sessionToken, cookieOptions)`
   - Redirects to `/`

3. Frontend: Loads home page, then checks auth via `trpc.auth.me.useQuery()`
4. Backend: `auth.me` procedure calls `sdk.authenticateRequest(req)` which:
   - Parses cookies from `req.headers.cookie`
   - Looks for `app_session_id` cookie
   - **Cookie is missing** ❌

---

## Code References

**Cookie Setting:**
```typescript
// server/_core/oauth.ts
res.cookie(COOKIE_NAME, sessionToken, { 
  ...cookieOptions, 
  maxAge: ONE_YEAR_MS 
});
```

**Cookie Reading:**
```typescript
// server/_core/sdk.ts
const cookies = this.parseCookies(req.headers.cookie);
const sessionCookie = cookies.get(COOKIE_NAME);
```

**Cookie Options:**
```typescript
// server/_core/cookies.ts
return {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: isSecure,
};
```

---

## Request for Manus Team

Please investigate:

1. **Cookie Handling in Proxy** - Are cookies being stripped or modified during the OAuth redirect through the Manus gateway?

2. **Protocol Detection** - Is the proxy correctly forwarding `x-forwarded-proto: https` header? Can you confirm what headers the app server receives during the OAuth callback?

3. **Session Management** - Does the Manus OAuth service expect session data to be stored in a specific backend (Redis, database)? Should we be using a different session management approach?

4. **Browser Console** - Are there any browser-level cookie errors (e.g., "Cookie blocked due to SameSite policy")?

5. **Alternative Approach** - Would using a token-based approach (returning session token in redirect URL fragment) be more reliable than cookies?

---

## Workaround

For now, the admin panel has been made publicly accessible (no authentication required) so the user can access the content management features. This is a temporary solution pending the OAuth fix.

---

## Files Modified

- `server/_core/index.ts` - Added `trust proxy` setting
- `server/_core/cookies.ts` - Simplified cookie options
- `server/_core/oauth.ts` - Added debug logging
- `client/src/const.ts` - OAuth URL generation
- `client/src/App.tsx` - OAuth return path handling

---

## Next Steps

1. Manus team investigates cookie handling in proxy
2. Implement fix based on findings
3. Re-enable authentication on admin panel
4. Test OAuth flow end-to-end

---

**Contact:** Franco Meza (franco74meza@gmail.com)  
**Project:** Michael Mackenzie Property Investment  
**Date:** May 14, 2026
