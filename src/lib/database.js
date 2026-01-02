// Supabase configuration and database helpers
import { createClient } from '@supabase/supabase-js';

// These will be set from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// ATHLETE FUNCTIONS
// ============================================

export const getAthletes = async () => {
  const { data, error } = await supabase
    .from('athletes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getAthleteById = async (id) => {
  const { data, error } = await supabase
    .from('athletes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createAthlete = async (athlete) => {
  const { data, error } = await supabase
    .from('athletes')
    .insert([athlete])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateAthlete = async (id, updates) => {
  const { data, error } = await supabase
    .from('athletes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteAthlete = async (id) => {
  const { error } = await supabase
    .from('athletes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ============================================
// MEAL PLAN FUNCTIONS
// ============================================

export const getMealPlans = async (athleteId = null) => {
  let query = supabase
    .from('meal_plans')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (athleteId) {
    query = query.eq('athlete_id', athleteId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getMealPlanById = async (id) => {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createMealPlan = async (plan) => {
  const { data, error } = await supabase
    .from('meal_plans')
    .insert([plan])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateMealPlan = async (id, updates) => {
  const { data, error } = await supabase
    .from('meal_plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteMealPlan = async (id) => {
  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ============================================
// WEIGHT LOG FUNCTIONS
// ============================================

export const getWeightLogs = async (athleteId) => {
  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('logged_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const addWeightLog = async (athleteId, weight, notes = '') => {
  const { data, error } = await supabase
    .from('weight_logs')
    .insert([{
      athlete_id: athleteId,
      weight,
      notes,
      logged_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ============================================
// SAVED MEAL TEMPLATE FUNCTIONS
// ============================================

export const getSavedMeals = async () => {
  const { data, error } = await supabase
    .from('saved_meals')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
};

export const createSavedMeal = async (meal) => {
  const { data, error } = await supabase
    .from('saved_meals')
    .insert([meal])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteSavedMeal = async (id) => {
  const { error } = await supabase
    .from('saved_meals')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ============================================
// CUSTOM FOODS FUNCTIONS
// ============================================

export const getCustomFoods = async () => {
  const { data, error } = await supabase
    .from('custom_foods')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
};

export const createCustomFood = async (food) => {
  const { data, error } = await supabase
    .from('custom_foods')
    .insert([food])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteCustomFood = async (id) => {
  const { error } = await supabase
    .from('custom_foods')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ============================================
// LOCAL STORAGE FALLBACK (for development without Supabase)
// ============================================

const LOCAL_STORAGE_KEYS = {
  athletes: 'cf_athletes',
  mealPlans: 'cf_meal_plans',
  savedMeals: 'cf_saved_meals',
  customFoods: 'cf_custom_foods',
};

export const localDB = {
  // Athletes
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
  
  // Meal Plans
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
  
  // Saved Meals
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
  
  // Custom Foods
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

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey;
};
