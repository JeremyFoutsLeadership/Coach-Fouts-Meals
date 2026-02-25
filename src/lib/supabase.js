// Fixed - using intake_submissions table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => !!supabase;

export const submitIntakeForm = async (formData) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('intake_submissions').insert([{ ...formData, status: 'new' }]).select();
  if (error) throw error;
  return data;
};

export const getIntakeForms = async () => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('intake_submissions').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getIntakeFormsCounts = async () => {
  if (!supabase) return { total: 0, new: 0, contacted: 0, converted: 0 };
  const { data, error } = await supabase.from('intake_submissions').select('status');
  if (error) throw error;
  return {
    total: data?.length || 0,
    new: data?.filter(d => d.status === 'new' || !d.status).length || 0,
    contacted: data?.filter(d => d.status === 'contacted').length || 0,
    converted: data?.filter(d => d.status === 'converted').length || 0
  };
};

export const updateIntakeFormStatus = async (id, status) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('intake_submissions').update({ status }).eq('id', id).select();
  if (error) throw error;
  return data;
};

export const deleteIntakeForm = async (id) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('intake_submissions').delete().eq('id', id);
  if (error) throw error;
  return true;
};

export const submitSwapRequest = async (formData) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('swap_request').insert([{ ...formData, status: 'new' }]).select();
  if (error) throw error;
  return data;
};

export const getSwapRequests = async () => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('swap_request').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getSwapRequestsCounts = async () => {
  if (!supabase) return { total: 0, new: 0, completed: 0 };
  const { data, error } = await supabase.from('swap_req
