# Authentication & Security Guide for DevFlow

Complete guide to understanding, controlling, and customizing authentication and security in DevFlow.

## 📚 Table of Contents

1. [Authentication Architecture](#authentication-architecture)
2. [Password Protection](#password-protection)
3. [JWT Token System](#jwt-token-system)
4. [Security Features](#security-features)
5. [How to Control Authentication](#how-to-control-authentication)
6. [Customization Guide](#customization-guide)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Authentication Architecture

### Overview

DevFlow uses a **stateless JWT-based authentication system** with the following components:

1. **Password Hashing** - bcrypt with salt
2. **JWT Tokens** - Access + Refresh token pattern
3. **Middleware** - Token validation on protected routes
4. **Role-Based Access Control** - Admin, Team Lead, Developer roles

### Authentication Flow

```
┌─────────┐      ┌──────────┐      ┌─────────┐      ┌──────────┐
│ Client  │─────▶│ Backend  │─────▶│ Database│─────▶│  Auth    │
│         │      │          │      │         │      │ Service  │
└─────────┘      └──────────┘      └─────────┘      └──────────┘
     │                 │                 │                 │
     │ 1. Login        │                 │                 │
     │────────────────▶│                 │                 │
     │                 │ 2. Find User    │                 │
     │                 │────────────────▶│                 │
     │                 │                 │ 3. Get Hash     │
     │                 │                 │────────────────▶│
     │                 │                 │                 │
     │                 │ 4. Verify      │                 │
     │                 │──────────────────────────────────▶│
     │                 │                 │                 │
     │                 │ 5. Generate    │                 │
     │                 │──────────────────────────────────▶│
     │ 6. Return Tokens│                 │                 │
     │◀────────────────│                 │                 │
```

---

## 🔐 Password Protection

### How Passwords Are Protected

#### 1. **Hashing with bcrypt**

Passwords are **never stored in plain text**. They are hashed using bcrypt before storage.

**Location:** `backend/src/services/authService.ts`

```typescript
async hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, this.SALT_ROUNDS);
}
```

**What happens:**
- Password: `"mypassword123"`
- Hashed: `"$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"`
- **Original password is unrecoverable** (one-way hash)

#### 2. **Salt Rounds**

Currently set to **10 salt rounds** (recommended for most applications).

**What are salt rounds?**
- Each round = 2^rounds iterations
- 10 rounds = 2^10 = 1,024 iterations
- Higher rounds = more secure but slower

**Current Configuration:**
```typescript
private readonly SALT_ROUNDS = 10;
```

**Security Levels:**
- 10 rounds: Good for most applications (~100ms hash time)
- 12 rounds: High security (~400ms hash time)
- 14 rounds: Maximum security (~1.6s hash time)

#### 3. **Password Verification**

On login, passwords are **compared, not decrypted**:

```typescript
async comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

**Why this is secure:**
- bcrypt.compare() uses constant-time comparison
- Prevents timing attacks
- Original password never recovered

#### 4. **Database Storage**

**Table Structure:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- Only hash stored
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  ...
);
```

**Important:**
- ✅ Only `password_hash` is stored
- ✅ Original password is **never** stored
- ✅ Hash is **never** returned in API responses

---

## 🎫 JWT Token System

### Token Types

#### 1. **Access Token**

**Purpose:** Authenticate API requests

**Characteristics:**
- Short-lived (default: 7 days)
- Contains user info (userId, email, role)
- Sent in `Authorization: Bearer <token>` header
- Verified on every protected route

**Generation:**
```typescript
const token = authService.generateToken({
  userId: user.id,
  email: user.email,
  role: user.role,
});
```

**Configuration:**
```env
JWT_SECRET=<your-secret-min-32-chars>
JWT_EXPIRES_IN=7d
```

#### 2. **Refresh Token**

**Purpose:** Obtain new access tokens without re-login

**Characteristics:**
- Long-lived (default: 30 days)
- Stored in localStorage (frontend)
- Used to refresh expired access tokens
- Separate secret from access token

**Generation:**
```typescript
const refreshToken = authService.generateRefreshToken({
  userId: user.id,
  email: user.email,
  role: user.role,
});
```

**Configuration:**
```env
JWT_REFRESH_SECRET=<your-secret-min-32-chars>
JWT_REFRESH_EXPIRES_IN=30d
```

### Token Structure

**JWT Payload:**
```json
{
  "userId": "uuid-here",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Token Format:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIuLi4iLCJlbWFpbCI6Ii4uLiIsInJvbGUiOiIuLi4ifQ.signature
```

### Token Lifecycle

```
1. Login/Signup
   └─▶ Generate Access Token (7d)
   └─▶ Generate Refresh Token (30d)
   └─▶ Store in localStorage

2. API Request
   └─▶ Send Access Token in header
   └─▶ Backend verifies token
   └─▶ Request processed

3. Token Expires
   └─▶ Frontend detects 401 error
   └─▶ Automatically uses Refresh Token
   └─▶ Gets new Access Token
   └─▶ Retries original request

4. Refresh Token Expires
   └─▶ User must login again
```

---

## 🛡️ Security Features

### 1. **Password Security**

✅ **bcrypt Hashing**
- One-way hashing (cannot be reversed)
- Salt rounds prevent rainbow table attacks
- Constant-time comparison prevents timing attacks

✅ **Never Stored in Plain Text**
- Only hash stored in database
- Hash never returned in API responses
- Original password unrecoverable

### 2. **Token Security**

✅ **Separate Secrets**
- Access token and refresh token use different secrets
- Compromising one doesn't compromise the other

✅ **Expiration**
- Tokens expire automatically
- Short-lived access tokens reduce risk
- Refresh tokens can be revoked

✅ **Signed Tokens**
- Tokens are cryptographically signed
- Cannot be tampered with
- Signature verified on every request

### 3. **API Security**

✅ **Protected Routes**
- All routes except `/auth/login` and `/auth/signup` require authentication
- Middleware validates token on every request
- Invalid tokens rejected immediately

✅ **Role-Based Access**
- Three roles: `admin`, `team_lead`, `developer`
- Role hierarchy enforced
- Permissions checked on sensitive operations

✅ **CORS Protection**
- Configured CORS origins
- Prevents unauthorized domain access
- Credentials required for requests

### 4. **Error Handling**

✅ **Generic Error Messages**
- "Invalid credentials" (not "user not found" or "wrong password")
- Prevents user enumeration attacks
- Consistent error responses

✅ **Token Validation**
- Expired tokens rejected
- Invalid tokens rejected
- Malformed tokens rejected

---

## 🎛️ How to Control Authentication

### 1. **Environment Variables**

**Location:** `.env` or environment configuration

**Required Variables:**
```env
# JWT Secrets (MUST be at least 32 characters)
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-characters-long

# Token Expiration
JWT_EXPIRES_IN=7d              # Access token (7 days)
JWT_REFRESH_EXPIRES_IN=30d      # Refresh token (30 days)

# Optional
JWT_ISSUER=devflow              # Token issuer
JWT_AUDIENCE=devflow-app        # Token audience
```

**Generate Secure Secrets:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 2. **Password Hashing Configuration**

**Location:** `backend/src/services/authService.ts`

**Current Setting:**
```typescript
private readonly SALT_ROUNDS = 10;
```

**To Increase Security:**
```typescript
private readonly SALT_ROUNDS = 12; // Higher security (slower)
```

**Trade-offs:**
- Higher rounds = more secure but slower
- 10 rounds: ~100ms per hash (recommended)
- 12 rounds: ~400ms per hash (high security)
- 14 rounds: ~1.6s per hash (maximum security)

### 3. **Token Expiration**

**Modify in `.env`:**
```env
# Shorter expiration = more secure (users login more often)
JWT_EXPIRES_IN=1h              # 1 hour
JWT_REFRESH_EXPIRES_IN=7d      # 7 days

# Longer expiration = more convenient (users login less often)
JWT_EXPIRES_IN=30d             # 30 days
JWT_REFRESH_EXPIRES_IN=90d     # 90 days
```

**Time Formats:**
- `s` - seconds: `60s`
- `m` - minutes: `30m`
- `h` - hours: `24h`
- `d` - days: `7d`

### 4. **Customize Authentication Middleware**

**Location:** `backend/src/middleware/auth.ts`

**Current Implementation:**
```typescript
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Extracts token from Authorization header
  // Verifies token
  // Attaches user to request
}
```

**Add Custom Checks:**
```typescript
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // ... existing code ...
  
  // Add custom validation
  if (decoded.role === 'banned') {
    return res.status(403).json({ error: 'Account banned' });
  }
  
  // Check token age
  const tokenAge = Date.now() - decoded.iat * 1000;
  if (tokenAge > 24 * 60 * 60 * 1000) { // 24 hours
    // Force re-authentication
  }
  
  next();
};
```

### 5. **Role-Based Access Control**

**Location:** `backend/src/middleware/authorization.ts`

**Current Roles:**
- `admin` - Full access
- `team_lead` - Team management
- `developer` - Basic access

**Add Custom Roles:**
1. Update database schema
2. Update role validation
3. Add role checks in middleware

### 6. **Password Requirements**

**Location:** `backend/src/utils/validators.ts`

**Add Password Validation:**
```typescript
export function validatePassword(password: string): boolean {
  // Minimum 8 characters
  if (password.length < 8) return false;
  
  // At least one uppercase
  if (!/[A-Z]/.test(password)) return false;
  
  // At least one lowercase
  if (!/[a-z]/.test(password)) return false;
  
  // At least one number
  if (!/[0-9]/.test(password)) return false;
  
  // At least one special character
  if (!/[!@#$%^&*]/.test(password)) return false;
  
  return true;
}
```

**Use in Controller:**
```typescript
if (!validatePassword(password)) {
  return res.status(400).json({
    error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
  });
}
```

---

## 🔧 Customization Guide

### 1. **Add Two-Factor Authentication (2FA)**

**Steps:**
1. Install `speakeasy` package: `npm install speakeasy qrcode`
2. Add `twoFactorSecret` column to users table
3. Generate secret on signup/login
4. Verify code on login

**Example:**
```typescript
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Generate secret
const secret = speakeasy.generateSecret({
  name: `DevFlow (${user.email})`,
});

// Generate QR code
const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

// Verify code
const verified = speakeasy.totp.verify({
  secret: secret.base32,
  encoding: 'base32',
  token: userProvidedCode,
});
```

### 2. **Add Password Reset**

**Steps:**
1. Add `passwordResetToken` and `passwordResetExpires` to users table
2. Create reset token endpoint
3. Send email with reset link
4. Verify token and update password

**Example:**
```typescript
// Generate reset token
const resetToken = crypto.randomBytes(32).toString('hex');
const resetExpires = new Date(Date.now() + 3600000); // 1 hour

// Store in database
await userRepository.update(userId, {
  passwordResetToken: resetToken,
  passwordResetExpires: resetExpires,
});

// Send email with reset link
await sendEmail(user.email, {
  subject: 'Password Reset',
  html: `<a href="${frontendUrl}/reset-password?token=${resetToken}">Reset Password</a>`
});
```

### 3. **Add Account Lockout**

**Steps:**
1. Add `failedLoginAttempts` and `lockedUntil` to users table
2. Track failed login attempts
3. Lock account after N failed attempts
4. Unlock after time period

**Example:**
```typescript
// On failed login
const attempts = user.failedLoginAttempts + 1;
if (attempts >= 5) {
  await userRepository.update(userId, {
    failedLoginAttempts: 0,
    lockedUntil: new Date(Date.now() + 900000), // 15 minutes
  });
}

// On successful login
await userRepository.update(userId, {
  failedLoginAttempts: 0,
  lockedUntil: null,
});
```

### 4. **Add Session Management**

**Steps:**
1. Create `sessions` table
2. Store active sessions
3. Allow users to view/revoke sessions
4. Logout from all devices option

**Example:**
```typescript
// Create session
const session = await sessionRepository.create({
  userId: user.id,
  token: refreshToken,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
});

// Revoke session
await sessionRepository.delete(sessionId);

// Revoke all sessions
await sessionRepository.deleteAll(userId);
```

### 5. **Add OAuth Integration**

**Steps:**
1. Install OAuth library: `npm install passport passport-google-oauth20`
2. Configure OAuth providers
3. Create OAuth routes
4. Link OAuth accounts to users

---

## 🔒 Security Best Practices

### 1. **Secrets Management**

✅ **DO:**
- Use strong, random secrets (minimum 32 characters)
- Store secrets in environment variables
- Use different secrets for different environments
- Rotate secrets periodically

❌ **DON'T:**
- Commit secrets to git
- Use default/example secrets
- Share secrets between environments
- Use short or predictable secrets

### 2. **Password Policies**

✅ **DO:**
- Enforce minimum password length (8+ characters)
- Require complexity (uppercase, lowercase, numbers, symbols)
- Implement password history (prevent reuse)
- Set maximum password age

❌ **DON'T:**
- Store passwords in plain text
- Send passwords via email
- Allow weak passwords
- Display password requirements only on error

### 3. **Token Management**

✅ **DO:**
- Use short-lived access tokens
- Implement token refresh mechanism
- Store tokens securely (httpOnly cookies or secure storage)
- Revoke tokens on logout

❌ **DON'T:**
- Store tokens in localStorage (XSS risk)
- Use long-lived tokens
- Include sensitive data in tokens
- Share tokens between users

### 4. **API Security**

✅ **DO:**
- Validate all inputs
- Use HTTPS in production
- Implement rate limiting
- Log security events
- Use CORS properly

❌ **DON'T:**
- Expose sensitive errors
- Allow SQL injection
- Skip authentication checks
- Trust client-side validation

### 5. **Database Security**

✅ **DO:**
- Use parameterized queries (prevent SQL injection)
- Encrypt sensitive data
- Regular backups
- Limit database access
- Use connection pooling

❌ **DON'T:**
- Use string concatenation for queries
- Store passwords in plain text
- Expose database credentials
- Allow direct database access from frontend

---

## 🐛 Troubleshooting

### Issue: "Invalid or expired token"

**Causes:**
- Token has expired
- Token secret mismatch
- Token format incorrect

**Solutions:**
1. Check token expiration: `JWT_EXPIRES_IN`
2. Verify JWT_SECRET matches
3. Ensure token is sent in `Authorization: Bearer <token>` format
4. Check token hasn't been tampered with

### Issue: "Password verification fails"

**Causes:**
- Password hash mismatch
- bcrypt version incompatibility
- Database encoding issues

**Solutions:**
1. Verify password is hashed correctly on signup
2. Check bcrypt version compatibility
3. Ensure database stores hash correctly
4. Test with known password/hash pair

### Issue: "Token refresh fails"

**Causes:**
- Refresh token expired
- Refresh secret mismatch
- Token not stored correctly

**Solutions:**
1. Check `JWT_REFRESH_EXPIRES_IN` setting
2. Verify `JWT_REFRESH_SECRET` matches
3. Ensure refresh token is stored in localStorage
4. Check token format

### Issue: "Unauthorized access"

**Causes:**
- Token not sent in request
- Token invalid
- Role permissions insufficient

**Solutions:**
1. Verify token in request headers
2. Check token validity
3. Verify user role has required permissions
4. Check middleware is applied correctly

---

## 📊 Security Checklist

### Before Production

- [ ] Strong JWT secrets (32+ characters, random)
- [ ] Different secrets for access and refresh tokens
- [ ] Appropriate token expiration times
- [ ] Password hashing with sufficient salt rounds (10+)
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info
- [ ] Database credentials secured
- [ ] Environment variables not committed to git
- [ ] Regular security updates
- [ ] Logging security events
- [ ] Backup strategy in place

---

## 📚 Additional Resources

- **bcrypt Documentation:** https://github.com/kelektiv/node.bcrypt.js
- **JWT Best Practices:** https://tools.ietf.org/html/rfc8725
- **OWASP Authentication Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- **Node.js Security Best Practices:** https://nodejs.org/en/docs/guides/security/

---

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd")
**Version:** 1.0.0
**Maintained By:** DevFlow Team

