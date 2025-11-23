# Google OAuth Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Code Changes (Completed)

- [x] Backend OAuth endpoints implemented
- [x] Frontend Google Sign-In button added
- [x] OAuth callback handler created
- [x] Styles added for Google button
- [x] CLIENT_URL configured
- [x] Changes committed and pushed to GitHub

---

## 🔧 Required Configurations

### 1. Google Cloud Console Setup

1. **Go to** [Google Cloud Console](https://console.cloud.google.com/)

2. **Create/Select Project**
   - Click project dropdown → "NEW PROJECT"
   - Name: "Salin Finance App"
   - Click "CREATE"

3. **Enable Google+ API**
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click "ENABLE"

4. **Configure OAuth Consent Screen**
   - Go to **APIs & Services** → **OAuth consent screen**
   - Select **External** user type
   - Fill in required fields:
     - **App name**: Salin Finance App
     - **User support email**: your-email@example.com
     - **Developer contact**: your-email@example.com
   - Click **SAVE AND CONTINUE** through all steps
   - Add test users (your email) for testing

5. **Create OAuth Credentials**
   - Go to **APIs & Services** → **Credentials**
   - Click **CREATE CREDENTIALS** → **OAuth client ID**
   - Select **Web application**
   - Name: "Salin Web Client"

   **Authorized JavaScript origins**:

   ```
   https://salinmt.netlify.app
   http://localhost:8080
   http://127.0.0.1:8080
   ```

   **Authorized redirect URIs**:

   ```
   https://flxmfbwwixlaefebaorb.supabase.co/auth/v1/callback
   ```

   - Click **CREATE**
   - **⚠️ IMPORTANT**: Copy the **Client ID** and **Client Secret**

---

### 2. Supabase Dashboard Setup

1. **Go to** [Supabase Dashboard](https://supabase.com/dashboard)

2. **Select Your Project** (flxmfbwwixlaefebaorb)

3. **Configure Google OAuth Provider**
   - Navigate to **Authentication** → **Providers**
   - Find **Google** and toggle it **ON**
   - Paste your Google OAuth credentials:
     - **Client ID**: (from Google Cloud Console)
     - **Client Secret**: (from Google Cloud Console)
   - The redirect URL should show:
     ```
     https://flxmfbwwixlaefebaorb.supabase.co/auth/v1/callback
     ```
   - Click **Save**

4. **Configure URL Settings**
   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL**:
     ```
     https://salinmt.netlify.app
     ```
   - Add **Redirect URLs**:
     ```
     https://salinmt.netlify.app/**
     http://localhost:8080/**
     http://127.0.0.1:8080/**
     ```
   - Click **Save**

---

### 3. Netlify Environment Variables

1. **Go to** [Netlify Dashboard](https://app.netlify.com/)

2. **Select Your Site** (salinmt)

3. **Navigate to** Site configuration → Environment variables

4. **Add/Update Variables**:

   ```
   SUPABASE_URL=https://flxmfbwwixlaefebaorb.supabase.co
   SUPABASE_SERVICE_KEY=[your-service-key]
   SUPABASE_ANON_KEY=[your-anon-key]
   JWT_SECRET=[your-jwt-secret]
   GEMINI_API_KEY=[your-gemini-key]
   CLIENT_URL=https://salinmt.netlify.app
   ```

5. **Trigger Redeploy**
   - After adding variables, trigger a manual deploy
   - Or push a commit to trigger auto-deploy

---

## 🧪 Testing Checklist

### Local Testing (Optional)

```bash
# Start backend
npm start

# Start frontend (in another terminal)
npm run client
```

- [ ] Open http://localhost:8080
- [ ] Click "Continue with Google"
- [ ] Sign in with Google
- [ ] Verify redirect back to app
- [ ] Check user is logged in
- [ ] Verify username in dashboard

### Production Testing (Required)

1. **Wait for Netlify Deploy** (after push)
   - Check Netlify dashboard for deploy status
   - Wait for "Published" status

2. **Test Google Sign-In Flow**
   - [ ] Go to https://salinmt.netlify.app
   - [ ] Click "Continue with Google"
   - [ ] Sign in with Google account
   - [ ] Should redirect back to https://salinmt.netlify.app/#/auth/callback
   - [ ] Should process tokens and redirect to onboarding or dashboard
   - [ ] Check browser console for any errors

3. **Verify User Creation**
   - [ ] Open Supabase Dashboard
   - [ ] Go to **Authentication** → **Users**
   - [ ] Verify new user appears
   - [ ] Go to **Table Editor** → **users** table
   - [ ] Verify user record exists with username

4. **Test Complete Flow**
   - [ ] First-time user: Should go to onboarding
   - [ ] Complete onboarding (set username, create account)
   - [ ] Verify redirect to dashboard
   - [ ] Log out
   - [ ] Sign in again with Google
   - [ ] Should skip onboarding and go to dashboard

---

## 🐛 Troubleshooting

### Issue: "No access token received from Google"

**Solution**: Check browser console logs:

- Look for "Full URL" and "Parsed hash string" logs
- Verify Supabase redirect URL is correct in Google Cloud Console
- Ensure Google OAuth provider is enabled in Supabase

### Issue: "Failed to sign in with Google"

**Solutions**:

- Verify Client ID and Secret are correct in Supabase
- Check Supabase Site URL matches https://salinmt.netlify.app
- Verify redirect URLs are whitelisted in Supabase

### Issue: "User not found" error

**Solution**: This was fixed in the code - user records are now automatically created

### Issue: Redirect loop or stuck on callback

**Solutions**:

- Clear browser cache and localStorage
- Check browser console for JavaScript errors
- Verify CLIENT_URL environment variable is set in Netlify

### Issue: OAuth works locally but not in production

**Solutions**:

- Verify Netlify environment variables are set
- Check Netlify deploy logs for errors
- Ensure production URL is in Google OAuth authorized origins

---

## 📊 Post-Deployment Verification

### Backend Health Check

```bash
# Test OAuth endpoint
curl https://salinmt.netlify.app/api/auth/google

# Expected: Should return error or Google OAuth URL
```

### Database Check

- Open Supabase Dashboard
- Check `auth.users` table has OAuth users
- Check `public.users` table has corresponding records
- Verify `username` field is populated

### Analytics (Optional)

- Monitor Netlify analytics for new user signups
- Check Supabase auth logs for OAuth events
- Track Google Sign-In conversion rate

---

## 🔐 Security Notes

- ✅ `.env` file is in `.gitignore` (secrets not committed)
- ✅ Client ID can be public (safe to expose)
- ❌ Client Secret must stay private (only in Netlify env vars)
- ✅ JWT tokens stored in localStorage (client-side only)
- ✅ Service key only used server-side (Netlify functions)

---

## 📱 Mobile Testing

After deployment, test on mobile devices:

- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Check responsive design
- [ ] Verify Google button is tappable
- [ ] Test OAuth flow on mobile

---

## ✅ Deployment Complete Checklist

- [ ] Google Cloud Console configured
- [ ] OAuth credentials created and copied
- [ ] Supabase Google provider enabled
- [ ] Supabase credentials saved
- [ ] Supabase URL configuration updated
- [ ] Netlify environment variables set
- [ ] Netlify deploy triggered
- [ ] Production OAuth tested
- [ ] User creation verified
- [ ] Complete flow tested (first-time + returning user)
- [ ] Mobile testing done (optional but recommended)

---

## 🎉 Success Criteria

Your deployment is successful when:

1. ✅ Users can click "Continue with Google" on login page
2. ✅ Google OAuth consent screen appears
3. ✅ After approval, users redirect back to your app
4. ✅ First-time users go to onboarding
5. ✅ Returning users go to dashboard
6. ✅ User data saved in database
7. ✅ No errors in browser console
8. ✅ No errors in Netlify logs

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check Netlify function logs
3. Check Supabase logs
4. Review this guide step-by-step
5. Verify all credentials are correct

---

**Deployment Date**: _[Fill in after deployment]_  
**Deployed By**: _[Your name]_  
**Production URL**: https://salinmt.netlify.app
