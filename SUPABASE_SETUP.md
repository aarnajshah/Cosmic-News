# Supabase Google Authentication Setup

This guide will walk you through setting up Google OAuth authentication with Supabase for your AstroNews application.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `astro-news` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose the closest region to your users
5. Click "Create new project"

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the placeholder values with your actual Supabase credentials.

## Step 4: Configure Google OAuth

### 4.1 Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client IDs**
   - Choose **Web application**
   - Add authorized redirect URIs:
     - `https://your-project-id.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for local development)

### 4.2 Configure Supabase

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click **Configure**
3. Enable Google provider
4. Add your Google OAuth credentials:
   - **Client ID**: From your Google Cloud Console
   - **Client Secret**: From your Google Cloud Console
5. Set the redirect URL to: `https://your-project-id.supabase.co/auth/v1/callback`
6. Click **Save**

## Step 5: Test the Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/login`
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth consent screen
5. After authentication, you'll be redirected back to your dashboard

## Step 6: Production Deployment

When deploying to production:

1. Update your Google OAuth app with production URLs:
   - Add your production domain to authorized redirect URIs
   - Update the redirect URI in Supabase to your production domain

2. Update environment variables in your hosting platform:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI" error**:
   - Make sure the redirect URI in Google Cloud Console matches exactly
   - Check that the URL in Supabase settings is correct

2. **"Client ID not found" error**:
   - Verify your Google OAuth credentials are correct
   - Make sure the Google+ API is enabled

3. **Authentication not working**:
   - Check your environment variables are set correctly
   - Verify your Supabase project is active
   - Check the browser console for any error messages

### Debug Mode:

To enable debug logging, add this to your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_DEBUG=true
```

## Security Notes

- Never commit your `.env.local` file to version control
- Use environment variables in production
- Regularly rotate your API keys
- Monitor your Supabase dashboard for any suspicious activity

## Next Steps

Once authentication is working, you can:
- Add user profiles and preferences
- Implement role-based access control
- Add user-specific features like saved articles
- Set up email notifications

For more information, check the [Supabase Auth documentation](https://supabase.com/docs/guides/auth).

