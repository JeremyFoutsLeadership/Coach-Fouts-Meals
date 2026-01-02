-- =============================================
-- COACH FOUTS MEAL PLANNER - DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- =============================================

-- Athletes table
CREATE TABLE athletes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sport TEXT,
  age INTEGER,
  gender TEXT DEFAULT 'male',
  weight DECIMAL(5,1),
  height INTEGER, -- in inches
  activity_level TEXT DEFAULT 'active',
  goal TEXT DEFAULT 'gain',
  preferences TEXT,
  restrictions TEXT,
  targets JSONB, -- {calories, protein, carbs, fat, bmr, tdee}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal Plans table
CREATE TABLE meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  name TEXT,
  targets JSONB, -- snapshot of targets at plan creation
  days JSONB, -- array of 7 day objects with meals
  goal TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weight Logs table (for tracking weigh-ins)
CREATE TABLE weight_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  weight DECIMAL(5,1) NOT NULL,
  notes TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved Meals table (custom meal templates)
CREATE TABLE saved_meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  meal_type TEXT, -- breakfast, snack, lunch, dinner, evening
  items JSONB, -- array of {foodId, quantity}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom Foods table (user-added foods)
CREATE TABLE custom_foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein DECIMAL(4,1) NOT NULL,
  carbs DECIMAL(4,1) NOT NULL,
  fat DECIMAL(4,1) NOT NULL,
  category TEXT DEFAULT 'extras',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_meal_plans_athlete ON meal_plans(athlete_id);
CREATE INDEX idx_weight_logs_athlete ON weight_logs(athlete_id);
CREATE INDEX idx_weight_logs_date ON weight_logs(logged_at DESC);
CREATE INDEX idx_athletes_name ON athletes(name);

-- Enable Row Level Security (optional - for multi-user setup later)
-- ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE saved_meals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE custom_foods ENABLE ROW LEVEL SECURITY;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER athletes_updated_at
  BEFORE UPDATE ON athletes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
