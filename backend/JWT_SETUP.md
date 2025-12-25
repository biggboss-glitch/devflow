# JWT Configuration Guide

## ✅ Current Status

Your JWT configuration is **almost complete**, but you need to:

1. **Generate secure JWT secrets** (currently using placeholders)
2. **Update your `.env` file** with the generated secrets
3. **Verify the configuration**

## 🔐 Step 1: Generate Secure JWT Secrets

### Option A: Using Node.js (Recommended)

```powershell
# Generate JWT_SECRET (64 bytes = 88 base64 characters)
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Generate JWT_REFRESH_SECRET (different from JWT_SECRET!)
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### Option B: Using OpenSSL

```powershell
# Generate JWT_SECRET
openssl rand -base64 64

# Generate JWT_REFRESH_SECRET (different!)
openssl rand -base64 64
```

### Option C: Using PowerShell

```powershell
# Generate JWT_SECRET
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Generate JWT_REFRESH_SECRET
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## 📝 Step 2: Update Your `.env` File

Open `backend/.env` and update these lines:

```env
# JWT Configuration
JWT_SECRET=YOUR_GENERATED_SECRET_HERE_MINIMUM_32_CHARACTERS
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=YOUR_DIFFERENT_GENERATED_SECRET_HERE_MINIMUM_32_CHARACTERS
JWT_REFRESH_EXPIRES_IN=30d
```

**Important:**
- ✅ Both secrets must be **at least 32 characters**
- ✅ They must be **different from each other**
- ✅ Use the generated secrets from Step 1
- ✅ Never commit these to version control

## ✅ Step 3: Verify Configuration

Run the validation script:

```powershell
cd backend
npm run validate-env
```

This will check:
- ✅ JWT_SECRET is at least 32 characters
- ✅ JWT_REFRESH_SECRET is at least 32 characters
- ✅ No placeholder values
- ✅ Secrets are different from each other

## 🎯 Complete Example

Here's what your `.env` should look like:

```env
# JWT Configuration
JWT_SECRET=XaQj8Ky4ig3tE7+dlGtrxJgOLL4vL/++PDCkrk+kNgy++pQ0xREUqpwVM2k/29BpSzg5/L3srVCkarXr0J1Wxg==
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=vE8/cUi/r2FGg98Qa6JgiPH4Mf9D/Fv1qvv1XVtFE+9QxAY71dzv4xQwj2z/dxBiTDt5GB2VFlkIIk1Boe2yvA==
JWT_REFRESH_EXPIRES_IN=30d
```

## 🔧 How JWT Works in This Project

### Token Generation

```typescript
// Access Token (short-lived, 7 days)
const token = authService.generateToken({
  userId: user.id,
  email: user.email,
  role: user.role
});

// Refresh Token (long-lived, 30 days)
const refreshToken = authService.generateRefreshToken({
  userId: user.id,
  email: user.email,
  role: user.role
});
```

### Token Verification

```typescript
// Verify access token
const decoded = authService.verifyToken(token);

// Verify refresh token
const decoded = authService.verifyRefreshToken(refreshToken);
```

## 🛡️ Security Best Practices

1. **Never use placeholder secrets** in production
2. **Generate unique secrets** for each environment (dev, staging, prod)
3. **Rotate secrets regularly** (every 90 days recommended)
4. **Store secrets securely** (use secret management in production)
5. **Use different secrets** for access and refresh tokens
6. **Keep secrets out of version control** (use `.env` and `.gitignore`)

## 🚨 Common Issues

### Issue: "JWT_SECRET must be at least 32 characters"

**Solution:** Generate a longer secret using the methods above.

### Issue: "JWT_SECRET appears to be a placeholder"

**Solution:** Replace placeholder values with generated secrets.

### Issue: TypeScript build errors with jwt.sign()

**Solution:** Already fixed in `authService.ts` - uses proper SignOptions type.

### Issue: Token verification fails

**Solution:** 
- Ensure JWT_SECRET matches between token generation and verification
- Check token hasn't expired
- Verify token format is correct

## 📊 Token Expiration Settings

Current defaults:
- **Access Token**: 7 days (`JWT_EXPIRES_IN=7d`)
- **Refresh Token**: 30 days (`JWT_REFRESH_EXPIRES_IN=30d`)

You can customize:
```env
JWT_EXPIRES_IN=15m        # 15 minutes
JWT_EXPIRES_IN=1h         # 1 hour
JWT_EXPIRES_IN=7d         # 7 days
JWT_REFRESH_EXPIRES_IN=30d # 30 days
```

## ✅ Quick Setup Checklist

- [ ] Generate JWT_SECRET (64+ characters)
- [ ] Generate JWT_REFRESH_SECRET (different, 64+ characters)
- [ ] Update `.env` file with generated secrets
- [ ] Run `npm run validate-env` to verify
- [ ] Test token generation with `npm run dev`
- [ ] Verify tokens work in API calls

## 🎉 After Setup

Once configured:
1. ✅ Backend will start without errors
2. ✅ Authentication endpoints will work
3. ✅ Tokens will be properly signed and verified
4. ✅ TypeScript build will succeed

---

**Next Steps:** After setting up JWT, run `npm run build` to verify everything compiles correctly.

