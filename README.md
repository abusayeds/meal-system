# Meal System 🍛

Shared mess / bachelor meal management system built with **Next.js** (full-stack) and **MongoDB Atlas**.

## Features

- **Admin**
  - Create user accounts (members)
  - Create monthly periods
  - Dynamic rent & utility fields (add/remove any bill type)
- **Members**
  - Add own daily meals (Breakfast, Lunch, Dinner — 0, 0.5, 1, 1.5, 2)
  - Add own bazar/market expenses
  - View everyone's meals & bazar (read-only)
  - Monthly settlement report (Excel logic)

## Calculation (same as Excel)

```
Meal Rate     = Total Bazar ÷ Total Meals
Consume       = User Meals × Meal Rate
Food Due      = Deposit − Consume
Rent Share    = Total Rent ÷ Active Members
Final Payable = Rent Share − Food Due
```

## Setup

```bash
cd meal-system
npm install
cp .env.example .env.local
# Edit .env.local with your MongoDB URI
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Default Admin Login

- Email: `admin@mealsystem.com`
- Password: `admin123`

## First Steps

1. Login as admin
2. **Admin → Months** — Create a month (e.g. January 2026)
3. **Admin → Users** — Create member accounts (Mahim, Ashiq, Sabbir, Jamil)
4. **Admin → Rent & Bills** — Set rent, gas, electricity, etc.
5. Members login and add meals + bazar daily
6. Check **Settlement** for final monthly bill

## Tech Stack

- Next.js 16 (App Router + API Routes)
- MongoDB + Mongoose
- Tailwind CSS
- JWT Auth (httpOnly cookie)
