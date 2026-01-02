// Supabase configuration and database helpers
import { createClient } from '@supabase/supabase-js';

// These will be set from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Only create Supabase client if credentials exist
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabase !== null;
};

// ============================================
// LOCAL STORAGE FALLBACK
// ============================================

const LOCAL_STORAGE_KEYS = {
  athletes: 'cf_athletes',
  mealPlans: 'cf_meal_plans',
  savedMeals: 'cf_saved_meals',
  customFoods: 'cf_custom_foods',
};

export const localDB = {
  getAthletes: () => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.athletes);
    return data ? JSON.parse(data) : [];
  },
  
  saveAthletes: (athletes) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.athletes, JSON.stringify(athletes));
  },
  
  addAthlete: (athlete) => {
    const athletes = localDB.getAthletes();
    const newAthlete = { ...athlete, id: Date.now().toString(), created_at: new Date().toISOString() };
    athletes.unshift(newAthlete);
    localDB.saveAthletes(athletes);
    return newAthlete;
  },
  
  updateAthlete: (id, updates) => {
    const athletes = localDB.getAthletes();
    const index = athletes.findIndex(a => a.id === id);
    if (index !== -1) {
      athletes[index] = { ...athletes[index], ...updates, updated_at: new Date().toISOString() };
      localDB.saveAthletes(athletes);
      return athletes[index];
    }
    return null;
  },
  
  deleteAthlete: (id) => {
    const athletes = localDB.getAthletes().filter(a => a.id !== id);
    localDB.saveAthletes(athletes);
  },
  
  getMealPlans: (athleteId = null) => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.mealPlans);
    let plans = data ? JSON.parse(data) : [];
    if (athleteId) {
      plans = plans.filter(p => p.athlete_id === athleteId);
    }
    return plans;
  },
  
  saveMealPlans: (plans) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.mealPlans, JSON.stringify(plans));
  },
  
  addMealPlan: (plan) => {
    const plans = localDB.getMealPlans();
    const newPlan = { ...plan, id: Date.now().toString(), created_at: new Date().toISOString() };
    plans.unshift(newPlan);
    localDB.saveMealPlans(plans);
    return newPlan;
  },
  
  updateMealPlan: (id, updates) => {
    const plans = localDB.getMealPlans();
    const index = plans.findIndex(p => p.id === id);
    if (index !== -1) {
      plans[index] = { ...plans[index], ...updates, updated_at: new Date().toISOString() };
      localDB.saveMealPlans(plans);
      return plans[index];
    }
    return null;
  },
  
  deleteMealPlan: (id) => {
    const plans = localDB.getMealPlans().filter(p => p.id !== id);
    localDB.saveMealPlans(plans);
  },
  
  getSavedMeals: () => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.savedMeals);
    return data ? JSON.parse(data) : [];
  },
  
  saveSavedMeals: (meals) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.savedMeals, JSON.stringify(meals));
  },
  
  addSavedMeal: (meal) => {
    const meals = localDB.getSavedMeals();
    const newMeal = { ...meal, id: Date.now().toString() };
    meals.push(newMeal);
    localDB.saveSavedMeals(meals);
    return newMeal;
  },
  
  deleteSavedMeal: (id) => {
    const meals = localDB.getSavedMeals().filter(m => m.id !== id);
    localDB.saveSavedMeals(meals);
  },
  
  getCustomFoods: () => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.customFoods);
    return data ? JSON.parse(data) : [];
  },
  
  saveCustomFoods: (foods) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.customFoods, JSON.stringify(foods));
  },
  
  addCustomFood: (food) => {
    const foods = localDB.getCustomFoods();
    const newFood = { ...food, id: `custom_${Date.now()}` };
    foods.push(newFood);
    localDB.saveCustomFoods(foods);
    return newFood;
  },
  
  deleteCustomFood: (id) => {
    const foods = localDB.getCustomFoods().filter(f => f.id !== id);
    localDB.saveCustomFoods(foods);
  },
};
