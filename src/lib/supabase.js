import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Create client only if credentials exist
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => !!supabase;

// Submit intake form (public)
export const submitIntakeForm = async (formData) => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('intake_forms')
    .insert([{ ...formData, status: 'new' }])
    .select();
  
  if (error) throw error;
  return data;
};

// Get all intake forms (admin)
export const getIntakeForms = async () => {
  if (!supabase) {
    console.warn('Supabase not configured');
    return [];
  }
  
  const { data, error } = await supabase
    .from('intake_forms')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

// Get intake forms count by status
export const getIntakeFormsCounts = async () => {
  if (!supabase) {
    return { total: 0, new: 0, contacted: 0, converted: 0 };
  }
  
  const { data, error } = await supabase
    .from('intake_forms')
    .select('status');
  
  if (error) throw error;
  
  const counts = {
    total: data?.length || 0,
    new: data?.filter(d => d.status === 'new' || !d.status).length || 0,
    contacted: data?.filter(d => d.status === 'contacted').length || 0,
    converted: data?.filter(d => d.status === 'converted').length || 0
  };
  
  return counts;
};

// Update intake form status
export const updateIntakeFormStatus = async (id, status) => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('intake_forms')
    .update({ status })
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data;
};

// Delete intake form
export const deleteIntakeForm = async (id) => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { error } = await supabase
    .from('intake_forms')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

export default supabase;
