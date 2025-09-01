# Vercel Environment Setup Guide

This guide will walk you through setting up the necessary environment variables for deploying the Modern Men Hair Salon application to Vercel.

## Step 1: Get the Environment Variable Template

In the root of this project, you'll find a file named `env.vercel.example`. This file contains a list of all the environment variables required for a production deployment on Vercel.

## Step 2: Create Supabase Project

1.  Go to [supabase.com](https://supabase.com) and create a new project.
2.  Once your project is created, navigate to **Settings** > **API**.
3.  You will find your **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`) and **anon public key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4.  Under **Project API keys**, you will also find your `service_role` secret key (`SUPABASE_SERVICE_ROLE_KEY`). **Treat this like a password and keep it secret.**
5.  Navigate to **Settings** > **Database**.
6.  Under **Connection string**, copy the **URI** value. This will be your `DATABASE_URL`.

## Step 3: Create Vercel KV and Blob Stores

1.  In your Vercel project dashboard, go to the **Storage** tab.
2.  Create a new **KV (Redis)** store. Copy the connection string (`KV_URL`).
3.  Create a new **Blob** store. Copy the **Read-Write Token** (`BLOB_READ_WRITE_TOKEN`).

## Step 4: Set Environment Variables in Vercel

1.  In your Vercel project dashboard, go to **Settings** > **Environment Variables**.
2.  For each variable in `env.vercel.example`, add a new environment variable in the Vercel dashboard.
3.  Copy the name of the variable from the file and paste it into the **Name** field in Vercel.
4.  Fill in the **Value** with the corresponding secret or configuration value.
5.  **Important:** For all secret values (`NEXTAUTH_SECRET`, `PAYLOAD_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `STRIPE_SECRET_KEY`, etc.), make sure to set them as **Encrypted**.

## Step 5: Deploy Your Application

Once all the environment variables are set, you can trigger a new deployment on Vercel. Vercel will use the environment variables you just configured to build and run the application.

### Deployment Scripts

This project includes scripts to help with deployment:

*   `pnpm vercel-deploy`: This script will run the Vercel deployment command.
*   `pnpm supabase:deploy`: This script will deploy your Supabase migrations.

Before your first deployment, you should run `pnpm supabase:deploy` to set up your database schema. After that, subsequent pushes to your main branch will automatically trigger a new Vercel deployment.
