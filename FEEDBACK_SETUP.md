# Feedback System Setup Guide

## Step 1: Create the Database Table

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Select your project: `flxmfbwwixlaefebaorb`

2. **Run the SQL Migration**
   - Navigate to **SQL Editor** in the left sidebar
   - Click **New Query**
   - Copy and paste the contents of `supabase_migration_feedbacks.sql`
   - Click **Run** or press `Ctrl+Enter`

3. **Verify Table Creation**
   - Go to **Table Editor** in the left sidebar
   - You should see a new table called `feedbacks` with these columns:
     - `id` (UUID, primary key)
     - `user_id` (UUID, references auth.users)
     - `type` (VARCHAR - bug, feature, improvement, other)
     - `message` (TEXT)
     - `contact_email` (VARCHAR)
     - `user_agent` (TEXT)
     - `page_url` (TEXT)
     - `status` (VARCHAR - pending, reviewed, resolved, closed)
     - `created_at` (TIMESTAMP)
     - `updated_at` (TIMESTAMP)

## Step 2: Test the Feedback Form

1. **Start Local Server**

   ```bash
   npm run dev
   ```

2. **Test Submission**
   - Login to your app
   - Scroll to the footer on the dashboard
   - Click "💬 Send Feedback"
   - Fill out the form:
     - Select feedback type
     - Write a message
     - Optionally add email
   - Click "Submit Feedback"

3. **Verify in Supabase**
   - Go to **Table Editor** > **feedbacks**
   - You should see your feedback record

## Step 3: View Feedback (Optional)

You can query feedback from Supabase SQL Editor:

```sql
-- View all feedback
SELECT
  f.id,
  f.type,
  f.message,
  f.contact_email,
  f.status,
  f.created_at,
  u.email as user_email
FROM feedbacks f
JOIN auth.users u ON f.user_id = u.id
ORDER BY f.created_at DESC;

-- Count feedback by type
SELECT type, COUNT(*) as count
FROM feedbacks
GROUP BY type
ORDER BY count DESC;

-- View pending feedback
SELECT *
FROM feedbacks
WHERE status = 'pending'
ORDER BY created_at DESC;
```

## Step 4: Setup Resend Email Service

### 1. Get Resend API Key

1. **Sign up for Resend**
   - Go to https://resend.com
   - Sign up for a free account (100 emails/day free)

2. **Get your API Key**
   - Go to **API Keys** in dashboard
   - Click **Create API Key**
   - Copy your API key (starts with `re_`)

3. **Verify Domain (for production)**
   - Go to **Domains**
   - Add your domain
   - Add DNS records (TXT, MX, etc.)
   - For testing, you can use `onboarding@resend.dev`

### 2. Configure Environment Variables

Update your `.env` file:

```bash
# Resend Email Configuration
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=Salin Feedback <feedback@yourdomain.com>
FEEDBACK_EMAIL=your-email@gmail.com
```

**For Testing (before domain verification):**

```bash
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
FEEDBACK_EMAIL=your-email@gmail.com
```

### 3. Test Email Sending

1. **Restart your server**

   ```bash
   npm run dev
   ```

2. **Submit test feedback**
   - Open your app
   - Click "💬 Send Feedback"
   - Submit a test message

3. **Check your email**
   - You should receive a nicely formatted email
   - Check spam folder if not in inbox

### 4. Production Setup

For Netlify deployment, add environment variables:

1. Go to Netlify Dashboard
2. Select your site
3. Go to **Site settings** > **Environment variables**
4. Add:
   - `RESEND_API_KEY` = your API key
   - `RESEND_FROM_EMAIL` = Salin Feedback <feedback@yourdomain.com>
   - `FEEDBACK_EMAIL` = your-email@gmail.com

## Step 5: Update Feedback Status (Admin)

You can update feedback status directly in Supabase:

```sql
-- Mark as reviewed
UPDATE feedbacks
SET status = 'reviewed'
WHERE id = 'feedback-uuid-here';

-- Mark as resolved
UPDATE feedbacks
SET status = 'resolved'
WHERE id = 'feedback-uuid-here';
```

## Current Setup

✅ **What's Already Working:**

- Feedback form in dashboard footer
- Modal interface with type selection
- Stores feedback in Supabase database
- Validates user authentication
- Tracks user agent and page URL
- Optional email for follow-up

⏳ **What Needs Setup:**

- Run the SQL migration (Step 1)
- Optional: Configure email notifications (Step 4)

## Troubleshooting

### Error: "relation 'feedbacks' does not exist"

- You need to run the SQL migration in Supabase

### Error: "Row Level Security policy violation"

- Check that RLS policies are created (included in migration)
- Ensure user is authenticated

### Feedback not showing in database

- Check browser console for errors
- Verify Supabase service key in `.env`
- Check network tab for API response

## Next Steps

1. Run the SQL migration NOW
2. Test the feedback form
3. Decide if you want email notifications
4. Optional: Create an admin page to view/manage feedback

---

**Quick Start:**

```bash
# 1. Run SQL migration in Supabase Dashboard
# 2. Test locally
npm run dev
# 3. Deploy
git add -A
git commit -m "feat: add feedback system with Supabase integration"
git push origin main
```
