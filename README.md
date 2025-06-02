# Journly - A Modern Blog Platform

Journly is a Medium-like blog platform built with Next.js 15.3, featuring categorized posts, user profiles, and a rich commenting system.

## Features

- User authentication with NextAuth.js
- Rich text editor for creating and editing posts
- Category management for organizing content
- User profiles with customizable information
- Comment system with nested replies
- Dashboard for content management
- Responsive design with Tailwind CSS and Shadcn UI

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file with the following variables:

``` plaintext
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/journly"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
```

4. Run database migrations:

```bash
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run dev
```

## Setting up Google OAuth (Optional)

To enable Google OAuth authentication:

1. **Create a Google Cloud Project**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - In the Google Cloud Console, go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type
   - Add authorized redirect URIs:
     - For development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://yourdomain.com/api/auth/callback/google`

4. **Configure Environment Variables**
   - Copy the Client ID and Client Secret from Google Cloud Console
   - Add them to your `.env.local` file:

   ```bash
   AUTH_GOOGLE_ID="your-google-client-id"
   AUTH_GOOGLE_SECRET="your-google-client-secret"
   ```

5. **Restart your development server** for the changes to take effect

## Building for Production

To build the application for production:

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

## Deploying to Vercel

### Prerequisites

1. A Vercel account
2. A PostgreSQL database (e.g., Vercel Postgres, Supabase, Railway, etc.)

### Steps to Deploy

1. **Fork or clone this repository**

2. **Set up your database**
   - Create a PostgreSQL database
   - Get your database connection string

3. **Deploy to Vercel**
   - Import your GitHub repository to Vercel
   - Configure the following environment variables:

     ```
     DATABASE_URL=postgresql://username:password@host:port/database?pgbouncer=true&sslmode=require&sslaccept=accept_invalid_certs
     DIRECT_URL=postgresql://username:password@host:5432/database?sslmode=require&sslaccept=accept_invalid_certs
     NEXTAUTH_SECRET=your-generated-secret
     NEXTAUTH_URL=https://your-vercel-deployment-url.vercel.app
     NEXT_PUBLIC_APP_URL=https://your-vercel-deployment-url.vercel.app
     ```

   - Deploy the project

4. **Run database migrations**
   - After the first deployment, you can use the Vercel CLI to run the migrations:

     ```bash

     vercel env pull .env.production.local
     npx prisma migrate deploy
     ```

5. **Seed the database (optional)**
   - To add initial data, you can run the seed script:

     ```bash

     npx prisma db seed
     ```

### Note on TypeScript Errors

When running `npx tsc --noEmit`, you may encounter TypeScript errors related to page props in the `.next/types` directory. These errors are related to type generation in Next.js 15.3 and don't affect the functionality of the application. The build process has been configured to ignore these errors during build time.

If you want to ensure type safety in your source code, you can run:

```bash
npx tsc --noEmit --skipLibCheck
```

This will check your source code while skipping the generated type files.

### Note on NextAuth.js Configuration

The application uses NextAuth.js for authentication. The `trustHost` option is set to `true` in the NextAuth.js configuration to allow localhost development. In a production environment, make sure to set the `NEXTAUTH_URL` environment variable to your production URL.

## Project Structure

- `/src/app` - Next.js app router pages and API routes
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and configuration
- `/prisma` - Database schema and migrations

## Technologies Used

- Next.js 15.3
- React
- TypeScript
- Prisma ORM
- PostgreSQL
- NextAuth.js
- Tailwind CSS
- Shadcn UI
- TipTap Editor
