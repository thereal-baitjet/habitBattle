# Account Tab Feature

## Overview
The Account tab allows users to change their @username (handle) so their email address doesn't need to be visible publicly in the app.

## Features

### Username Management
- Users can set and update their unique @username
- Username validation:
  - Minimum 3 characters
  - Maximum 30 characters
  - Only alphanumeric characters, underscores, and hyphens allowed
  - Must be unique across all users
- Email address is displayed as read-only for account management purposes

### Security
- Email addresses are kept private
- Only the username is visible to other users
- Row Level Security (RLS) policies ensure users can only update their own profile

## Database Schema

The feature uses a `profiles` table in Supabase:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

## Setup Instructions

1. **Run the migration** in your Supabase dashboard:
   - Go to SQL Editor
   - Run the migration file: `supabase/migrations/001_create_profiles_table.sql`

2. **Configure environment variables**:
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase URL and keys

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Access the account page**:
   - Navigate to `/account` in your app
   - Or click the "Account" button in the navigation

## Usage

1. Users log in to the app
2. Navigate to the Account tab (accessible from the navigation bar)
3. Enter a desired username in the format: `@username`
4. Click "Save" to update
5. The username is validated and saved to the database
6. Other users will see the @username instead of the email address

## API Integration

The account page uses Supabase client-side:
- Fetches user profile on load
- Validates username uniqueness
- Updates profile using Supabase `upsert` operation
- Handles errors gracefully with user feedback

