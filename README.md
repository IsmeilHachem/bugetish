# Setting Up Your Own BudgetYoish

Hey! Thanks for wanting to try BudgetYoish. This guide walks you through setting up your **own private copy** of the app — completely separate from mine.

No technical experience needed. Should take about 15-20 minutes.

## The important part: your privacy

When you're done, you'll have:
- Your own copy of the app, hosted under your own free Vercel account
- Your own private database (Supabase), holding only your data
- **I will not be able to see, access, or touch your data — ever.** It lives in a database only you control, under your own login.
- You also won't be able to accidentally change my original code — you'll be working from your own independent copy.

---

## Step 1: Create your database (Supabase)

1. Go to [supabase.com](https://supabase.com) and sign up for a free account
2. Click **New Project**
3. Give it any name you like (e.g. "My Budget")
4. Set a database password and save it somewhere safe
5. Choose a region close to you, then click **Create new project** (takes ~2 minutes)

### Set up the database structure

6. Once ready, click **SQL Editor** in the left sidebar → **New Query**
7. Open [`schema.sql`](https://github.com/IsmeilHachem/bugetish/blob/main/schema.sql) from the repo, copy everything in it, and paste it into the SQL Editor
8. Click **Run** — this creates all the tables the app needs

### Grab your credentials

9. Click **Project Settings** (gear icon) → **API**
10. Keep this tab open, you'll need two things in Step 2:
    - **Project URL** (starts with `https://`)
    - **anon public** key (a long string of letters/numbers)

---

## Step 2: Deploy your app (Vercel)

11. Click this button:

    [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/IsmeilHachem/bugetish&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY&envDescription=Paste%20in%20the%20Project%20URL%20and%20anon%20key%20from%20your%20Supabase%20project%20settings&project-name=my-budgetyoish&repository-name=my-budgetyoish)

12. If you don't have a Vercel account, it'll ask you to sign up (free — you can use GitHub or Google login)
13. It'll ask to create a copy of the code in your own GitHub account — click **Confirm**. This is your own private copy; I won't have access to it.
14. When it asks for environment variables, paste in:
    - `VITE_SUPABASE_URL` → the Project URL from Step 9
    - `VITE_SUPABASE_ANON_KEY` → the anon public key from Step 9
15. Click **Deploy** and wait a minute or two

---

## Step 3: Create your account

Once deployment finishes, Vercel will give you a link like `my-budgetyoish.vercel.app` — that's your own private BudgetYoish.

16. Open the link and **sign up** for an account (just an email + password — this is your own login, stored in your own Supabase, not mine)
17. You're in! Start adding transactions, categories, and bills.

---

## Optional: AI Spending Insights (Gemini)

The dashboard has a "Gemini AI Spending Insights" card that can analyze your spending and give you tips. **This is entirely optional** — everything else in the app works completely fine without it.

If you skip this, clicking "Generate Insights" will just show a red error box. That's expected, not a bug — it just means this one feature isn't configured. Feel free to ignore it.

If you *do* want it, it requires a Google Cloud (GCP) account with billing enabled, and a bit more setup than the Supabase steps above:

1. Create a project at [console.cloud.google.com](https://console.cloud.google.com)
2. Enable the **Vertex AI API** for that project
3. Create a **Service Account** under IAM & Admin, and generate a JSON key for it
4. In your Vercel project settings → Environment Variables, add `GOOGLE_APPLICATION_CREDENTIALS` and paste the entire contents of that JSON key file as the value
5. Redeploy your Vercel project for the change to take effect

Reach out to me if you get stuck on this part — it's the fiddliest step and totally skippable.

---

## Getting future updates

I'll be improving the app over time. When I do, I'll let you know — you can pull those updates into your own copy through GitHub without losing any of your data. I can walk you through this when the time comes.

---

## Questions or stuck somewhere?

Reach out to me directly — happy to help troubleshoot.
