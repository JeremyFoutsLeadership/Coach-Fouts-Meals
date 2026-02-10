import { useState } from 'react';
import { submitSwapRequest } from '../lib/supabase';

const MEAL_SLOTS = [
  { key: 'preworkout', label: 'Pre-Workout Breakfast' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'am_snack', label: 'AM Snack' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'pm_snack', label: 'PM Snack' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'evening', label: 'Evening Shake' },
];

export default function SwapForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    athlete_name: '',
    athlete_email: '',
    preworkout_swap_out: '',
    preworkout_replace_with: '',
    breakfast_swap_out: '',
    breakfast_replace_with: '',
    am_snack_swap_out: '',
    am_snack_replace_with: '',
    lunch_swap_out: '',
    lunch_replace_with: '',
    pm_snack_swap_out: '',
    pm_snack_replace_with: '',
    dinner_swap_out: '',
    dinner_replace_with: '',
    evening_swap_out: '',
    evening_replace_with: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if at least one swap is filled out
    const hasSwap = MEAL_SLOTS.some(slot => 
      form[`${slot.key}_swap_out`] || form[`${slot.key}_replace_with`]
    );

    if (!hasSwap) {
      setError('Please fill out at least one swap request.');
      setLoading(false);
      return;
    }

    try {
      await submitSwapRequest(form);
      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError('There was an error submitting the form. Please try again or contact Coach Fouts directly.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '40px', maxWidth: '500px', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Swap Request Submitted!</h1>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Coach Fouts will review your swap requests and send you an updated meal plan within 24-48 hours.
          </p>
          <a 
            href="https://jeremyfouts.com" 
            style={{ display: 'inline-block', background: '#059669', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}
          >
            Back to JeremyFouts.com
          </a>
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '4px'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)', padding: '32px 16px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            🔄 Meal Plan Swaps & Substitutions
          </h1>
          <p style={{ color: '#a7f3d0' }}>
            Coach Fouts Sports Nutrition | NCSF Certified
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
          
          {/* Header Info */}
          <div style={{ background: '#059669', color: 'white', padding: '16px 24px', fontSize: '16px' }}>
            Fill in the foods you want to <strong>SWAP OUT</strong> and what you want to <strong>REPLACE</strong> them with.
          </div>

          {/* Athlete Info */}
          <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Athlete Name *</label>
                <input 
                  type="text" 
                  name="athlete_name" 
                  value={form.athlete_name} 
                  onChange={handleChange} 
                  required 
                  style={inputStyle} 
                  placeholder="Your Name" 
                />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input 
                  type="email" 
                  name="athlete_email" 
                  value={form.athlete_email} 
                  onChange={handleChange} 
                  required 
                  style={inputStyle} 
                  placeholder="your@email.com" 
                />
              </div>
            </div>
          </div>

          {/* Swap Sections */}
          {MEAL_SLOTS.map((slot, idx) => (
            <div 
              key={slot.key} 
              style={{ 
                padding: '20px 24px', 
                borderBottom: '1px solid #e5e7eb',
                background: idx % 2 === 0 ? '#f9fafb' : 'white'
              }}
            >
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: '#059669', 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ 
                  background: '#059669', 
                  color: 'white', 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '12px'
                }}>
                  {idx + 1}
                </span>
                {slot.label}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ ...labelStyle, color: '#dc2626' }}>Swap Out (Current Food)</label>
                  <input 
                    type="text" 
                    name={`${slot.key}_swap_out`}
                    value={form[`${slot.key}_swap_out`]} 
                    onChange={handleChange} 
                    style={{ ...inputStyle, borderColor: '#fecaca' }} 
                    placeholder="Food to remove..." 
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, color: '#059669' }}>Replace With (New Food)</label>
                  <input 
                    type="text" 
                    name={`${slot.key}_replace_with`}
                    value={form[`${slot.key}_replace_with`]} 
                    onChange={handleChange} 
                    style={{ ...inputStyle, borderColor: '#a7f3d0' }} 
                    placeholder="Food to add..." 
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Notes */}
          <div style={{ padding: '24px', background: '#f9fafb' }}>
            <label style={labelStyle}>Additional Notes or Comments</label>
            <textarea 
              name="notes" 
              value={form.notes} 
              onChange={handleChange} 
              rows={3} 
              style={{ ...inputStyle, resize: 'vertical' }} 
              placeholder="Any other changes or requests..." 
            />
          </div>

          {/* Submit */}
          <div style={{ padding: '24px', background: 'white', borderTop: '1px solid #e5e7eb' }}>
            {error && (
              <div style={{ marginBottom: '16px', padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px' }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#9ca3af' : '#059669',
                color: 'white',
                padding: '16px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '18px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Submitting...' : '🔄 Submit Swap Request'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '16px' }}>
              Coach Fouts will review and send your updated plan within 24-48 hours.
            </p>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px', color: '#a7f3d0', fontSize: '14px' }}>
          <p>Coach Fouts Sports Nutrition | NCSF Certified</p>
          <p>JeremyFouts.com</p>
        </div>
      </div>
    </div>
  );
}
