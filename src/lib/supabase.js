import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Running in localStorage mode.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConnected = () => !!supabase;

// ============================================
// INTAKE FORMS
// ============================================

export async function submitIntakeForm(formData) {
  if (!supabase) throw new Error('Supabase not connected');
  
  const { data, error } = await supabase
    .from('intake_forms')
    .insert([formData])
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function getIntakeForms(status = null) {
  if (!supabase) return [];
  
  let query = supabase
    .from('intake_forms')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateIntakeFormStatus(id, status, athleteId = null) {
  if (!supabase) throw new Error('Supabase not connected');
  
  const updates = { status };
  if (athleteId) updates.converted_to_athlete_id = athleteId;
  
  const { data, error } = await supabase
    .from('intake_forms')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
}

// ============================================
// ATHLETES
// ============================================

export async function getAthletes() {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('athletes')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function getAthlete(id) {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('athletes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createAthlete(athlete) {
  if (!supabase) throw new Error('Supabase not connected');
  
  const { data, error } = await supabase
    .from('athletes')
    .insert([athlete])
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function updateAthlete(id, updates) {
  if (!supabase) throw new Error('Supabase not connected');
  
  const { data, error } = await supabase
    .from('athletes')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function deleteAthlete(id) {
  if (!supabase) throw new Error('Supabase not connected');
  
  const { error } = await supabase
    .from('athletes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

// ============================================
// MEAL PLANS
// ============================================

export async function getMealPlans(athleteId = null) {
  if (!supabase) return [];
  
  let query = supabase
    .from('meal_plans')
    .select('*, athletes(name)')
    .order('created_at', { ascending: false });
  
  if (athleteId) {
    query = query.eq('athlete_id', athleteId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createMealPlan(mealPlan) {
  if (!supabase) throw new Error('Supabase not connected');
  
  const { data, error } = await supabase
    .from('meal_plans')
    .insert([mealPlan])
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function updateMealPlan(id, updates) {
  if (!supabase) throw new Error('Supabase not connected');
  
  const { data, error } = await supabase
    .from('meal_plans')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
}

// ============================================
// WEIGHT LOGS
// ============================================

export async function getWeightLogs(athleteId) {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('logged_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function addWeightLog(athleteId, weight, notes = '') {
  if (!supabase) throw new Error('Supabase not connected');
  
  const { data, error } = await supabase
    .from('weight_logs')
    .insert([{ athlete_id: athleteId, weight, notes }])
    .select();
  
  if (error) throw error;
  return data[0];
}
