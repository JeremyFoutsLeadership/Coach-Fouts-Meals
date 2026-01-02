# Coach Fouts Meal Plan Builder

Professional meal planning application for sports nutrition coaching. Built for scaling from 50 to 200+ athletes.

## Features

- **Athlete Management**: Add athletes with auto-calculated calorie/macro targets using Mifflin-St Jeor equation
- **Meal Plan Builder**: 7-day plans with 6 meals/day, real-time macro tracking
- **USDA Food Database**: 100+ verified foods with accurate nutrition data
- **Saved Meal Templates**: Quick-add pre-built meals (Evening Shake, Breakfast Burritos, etc.)
- **PDF Export**: Professional meal plans in your exact format
- **CorVive Integration**: Built-in supplement protocols

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start

# 3. Open http://localhost:3000
```

The app works immediately with localStorage - no database setup required for testing.

---

## Deploy to Production (15 minutes)

### Step 1: Create Supabase Database (Free)

1. Go to [supabase.com](https://supabase.com) and create account
2. Click "New Project" → name it "coach-fouts-meals"
3. Save your database password somewhere safe
4. Wait ~2 minutes for project to initialize
5. Go to **SQL Editor** in sidebar
6. Paste contents of `supabase-schema.sql` and click "Run"
7. Go to **Settings > API** and copy:
   - Project URL (looks like `https://xxxxx.supabase.co`)
   - `anon` public key

### Step 2: Deploy to Vercel (Free)

1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Import Project" → select your repo
4. Add Environment Variables:
   - `REACT_APP_SUPABASE_URL` = your Supabase URL
   - `REACT_APP_SUPABASE_ANON_KEY` = your anon key
5. Click "Deploy"
6. Done! Your app is live at `your-project.vercel.app`

### Step 3: Custom Domain (Optional)

In Vercel dashboard:
1. Go to your project → Settings → Domains
2. Add `mealplans.jeremyfouts.com` (or whatever you want)
3. Update DNS records as instructed

---

## Project Structure

```
src/
├── data/
│   ├── foods.js          # USDA food database (100+ items)
│   └── mealTemplates.js  # Pre-built meal templates
├── lib/
│   ├── calculations.js   # Macro/calorie calculations
│   ├── database.js       # Supabase + localStorage
│   └── pdfGenerator.js   # PDF export
├── App.js                # Main application
├── App.css               # Styles
└── index.js              # Entry point
```

## Calculation Methods

**BMR (Basal Metabolic Rate)** - Mifflin-St Jeor:
- Male: (10 × weight kg) + (6.25 × height cm) - (5 × age) + 5
- Female: (10 × weight kg) + (6.25 × height cm) - (5 × age) - 161

**Activity Multipliers:**
- Light (1-2x/week): 1.375
- Moderate (3-4x/week): 1.55
- Active (5-6x/week): 1.725
- Very Active (2x/day): 1.9

**Macro Split:**
- Protein: 1.25g per pound bodyweight
- Fat: 28% of calories
- Carbs: Remaining calories

---

## Future Enhancements (V2)

- [ ] Athlete login portal for weigh-ins
- [ ] Text/email weigh-in reminders
- [ ] Auto-intake form → database
- [ ] Progress charts & analytics
- [ ] Mobile app (React Native)

---

## Support

Built for Coach Fouts Sports Nutrition
Website: JeremyFouts.com

Fuel Clean. Play Elite. Win.
