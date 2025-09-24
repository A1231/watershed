# Supabase Connection Setup Guide

This guide will help you connect your Django backend to your Supabase PostGIS database.

## Step 1: Get Your Supabase Credentials

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to Settings > Database**
4. **Find your connection details**:
   - **Host**: `your-project-ref.supabase.co` (found in Connection string)
   - **Database name**: `postgres` (default)
   - **User**: `postgres` (default)
   - **Password**: The password you set when creating the project
   - **Port**: `5432`

## Step 2: Create Environment File

Create a `.env` file in your backend directory (`/backend/.env`) with the following content:

```bash
# Supabase Database Configuration
SUPABASE_HOST=your-project-ref.supabase.co
SUPABASE_PASSWORD=your-actual-password
SUPABASE_DB_NAME=postgres
SUPABASE_USER=postgres

# Optional: Supabase API credentials
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Replace the placeholder values with your actual Supabase credentials.**

## Step 3: Install Dependencies

Make sure you have all required packages installed:

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

## Step 4: Test the Connection

1. **Start the Django development server**:
   ```bash
   python manage.py runserver
   ```

2. **Test the database connection**:
   ```bash
   python manage.py dbshell
   ```
   This should connect you to your Supabase database.

3. **Test the API endpoint**:
   ```bash
   # Test with a sample coordinate (Raleigh, NC)
   curl "http://localhost:8000/watershed_api/find-watershed/?lat=35.7796&lng=-78.6382"
   ```

## Step 5: Verify PostGIS Extension

Make sure PostGIS is enabled in your Supabase database:

1. **Go to Supabase Dashboard > SQL Editor**
2. **Run this query**:
   ```sql
   SELECT PostGIS_version();
   ```
3. **If PostGIS is not installed, run**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

## Troubleshooting

### Common Issues:

1. **Connection refused**:
   - Check your Supabase host URL
   - Verify your password is correct
   - Make sure your IP is allowed (Supabase allows all IPs by default)

2. **SSL connection error**:
   - The configuration already includes `'sslmode': 'require'`
   - This is required for Supabase connections

3. **PostGIS not found**:
   - Make sure PostGIS extension is enabled in your Supabase database
   - Run the SQL commands above to enable it

4. **Table not found**:
   - Verify your `watersheds` table exists in Supabase
   - Check the table name matches exactly (case-sensitive)

### Testing Your Setup:

You can test individual components:

1. **Test database connection**:
   ```python
   python manage.py shell
   >>> from django.db import connection
   >>> cursor = connection.cursor()
   >>> cursor.execute("SELECT version();")
   >>> print(cursor.fetchone())
   ```

2. **Test PostGIS**:
   ```python
   python manage.py shell
   >>> from django.contrib.gis.db import connection
   >>> cursor = connection.cursor()
   >>> cursor.execute("SELECT PostGIS_version();")
   >>> print(cursor.fetchone())
   ```

3. **Test your model**:
   ```python
   python manage.py shell
   >>> from watershed_api.models import Watersheds
   >>> print(Watersheds.objects.count())
   ```

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Use environment variables in production
- Consider using Supabase's connection pooling for production

## Next Steps

Once connected, you can:
1. Test the API endpoints
2. Integrate with your React frontend
3. Add more sophisticated spatial queries
4. Implement caching for better performance
