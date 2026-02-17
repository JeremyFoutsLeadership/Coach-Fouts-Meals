import { useState, useEffect } from 'react';
import { submitIntakeForm } from '../lib/supabase';

// BMR/TDEE Calculation using Mifflin-St Jeor
const calculateBMR = (gender, weightLbs, heightFeet, heightInches, age) => {
  if (!weightLbs || !heightFeet || !age || !gender) return null;
  
  const weightKg = weightLbs * 0.45359237;
  const heightCm = ((heightFeet * 12) + (heightInches || 0)) * 2.54;
  
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
};

const calculateTDEE = (bmr, activityLevel) => {
  if (!bmr || !activityLevel) return null;
  const multipliers = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'very_active': 1.725,
    'extra_active': 1.9
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.55));
};

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little/no exercise, desk job' },
  { value: 'light', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
  { value: 'very_active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
  { value: 'extra_active', label: 'Extra Active', desc: 'Very hard exercise + physical job' },
];

const PROTEINS = ['Chicken Breast', 'Ground Beef (93/7)', 'Steak', 'Turkey', 'Eggs', 'Egg Whites', 'Salmon', 'Tilapia', 'Shrimp', 'Tuna', 'Pork Chops', 'Bacon', 'Deli Meat', 'Greek Yogurt', 'Cottage Cheese'];
const CARBS = ['White Rice', 'Brown Rice', 'Pasta', 'Bread', 'Oatmeal', 'Cream of Rice', 'Potatoes', 'Sweet Potatoes', 'Bagels', 'Tortillas', 'Cereal', 'Pancakes', 'Waffles', 'Grits', 'Quinoa'];
const FRUITS = ['Bananas', 'Apples', 'Oranges', 'Strawberries', 'Blueberries', 'Grapes', 'Watermelon', 'Pineapple', 'Mango', 'Raspberries', 'Blackberries', 'Peaches', 'Pears'];
const VEGETABLES = ['Broccoli', 'Green Beans', 'Spinach', 'Asparagus', 'Carrots', 'Bell Peppers', 'Zucchini', 'Cucumber', 'Tomatoes', 'Lettuce', 'Corn', 'Peas', 'Brussels Sprouts', 'Cauliflower'];
const ALLERGIES = ['Dairy', 'Eggs', 'Peanuts', 'Tree Nuts', 'Soy', 'Wheat/Gluten', 'Fish', 'Shellfish'];
const DIETARY_RESTRICTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Halal', 'Kosher'];

export default function IntakeForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculatedBMR, setCalculatedBMR] = useState(null);
  const [calculatedTDEE, setCalculatedTDEE] = useState(null);
  
  const [form, setForm] = useState({
    athlete_name: '',
    parent_name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    sport: '',
    position: '',
    current_weight: '',
    goal_weight: '',
    height_feet: '',
    height_inches: '',
    activity_level: 'moderate',
    primary_goal: '',
    timeline: '',
    proteins_liked: [],
    carbs_liked: [],
    fruits_liked: [],
    vegetables_liked: [],
    foods_to_avoid: '',
    allergies: [],
    dietary_restrictions: [],
    meals_per_day: '5',
    meal_prep_help: '',
    has_microwave_at_school: false,
    cooks_own_meals: false,
    grocery_budget: '',
    current_supplements: '',
    notes: ''
  });

  // Live BMR/TDEE calculation
  useEffect(() => {
    const bmr = calculateBMR(
      form.gender,
      parseFloat(form.current_weight),
      parseInt(form.height_feet),
      parseInt(form.height_inches) || 0,
      parseInt(form.age)
    );
    setCalculatedBMR(bmr);
    
    if (bmr) {
      const tdee = calculateTDEE(bmr, form.activity_level);
      setCalculatedTDEE(tdee);
    } else {
      setCalculatedTDEE(null);
    }
  }, [form.gender, form.current_weight, form.height_feet, form.height_inches, form.age, form.activity_level]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMultiSelect = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submissionData = {
        ...form,
        age: parseInt(form.age) || null,
        current_weight: parseFloat(form.current_weight) || null,
        goal_weight: parseFloat(form.goal_weight) || null,
        height_feet: parseInt(form.height_feet) || null,
        height_inches: parseInt(form.height_inches) || 0,
        bmr: calculatedBMR,
        tdee: calculatedTDEE
      };
      
      await submitIntakeForm(submissionData);
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
        <div style={{ background: 'white', borderRadius: '16px', padding: '48px', maxWidth: '500px', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
          <div style={{ fontSize: '72px', marginBottom: '24px' }}>🎉</div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>You're All Set!</h1>
          <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '24px', lineHeight: '1.6' }}>
            Thank you for completing the intake form! Coach Fouts will review your information and reach out within 24-48 hours with your personalized meal plan.
          </p>
          <a 
            href="https://jeremyfouts.com" 
            style={{ display: 'inline-block', background: '#059669', color: 'white', padding: '14px 28px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '16px' }}
          >
            Back to JeremyFouts.com
          </a>
        </div>
      </div>
    );
  }

  const sectionStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  };

  const chipStyle = (selected) => ({
    display: 'inline-block',
    padding: '8px 16px',
    margin: '4px',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '2px solid',
    borderColor: selected ? '#059669' : '#e5e7eb',
    background: selected ? '#ecfdf5' : 'white',
    color: selected ? '#059669' : '#6b7280'
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)', padding: '40px 16px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            🏆 Athlete Nutrition Intake
          </h1>
          <p style={{ color: '#a7f3d0', fontSize: '18px' }}>
            Coach Fouts Sports Nutrition | NCSF Certified
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Contact Info */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📋 Contact Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Athlete Name *</label>
                <input name="athlete_name" value={form.athlete_name} onChange={handleChange} required style={inputStyle} placeholder="John Smith" />
              </div>
              <div>
                <label style={labelStyle}>Parent/Guardian Name</label>
                <input name="parent_name" value={form.parent_name} onChange={handleChange} style={inputStyle} placeholder="Jane Smith" />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required style={inputStyle} placeholder="email@example.com" />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} style={inputStyle} placeholder="(555) 123-4567" />
              </div>
            </div>
          </div>

          {/* Physical Stats */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📊 Physical Stats
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Age *</label>
                <input name="age" type="number" value={form.age} onChange={handleChange} required style={inputStyle} placeholder="15" min="8" max="25" />
              </div>
              <div>
                <label style={labelStyle}>Gender *</label>
                <select name="gender" value={form.gender} onChange={handleChange} required style={inputStyle}>
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Sport *</label>
                <input name="sport" value={form.sport} onChange={handleChange} required style={inputStyle} placeholder="Football" />
              </div>
              <div>
                <label style={labelStyle}>Position</label>
                <input name="position" value={form.position} onChange={handleChange} style={inputStyle} placeholder="Quarterback" />
              </div>
              <div>
                <label style={labelStyle}>Current Weight (lbs) *</label>
                <input name="current_weight" type="number" value={form.current_weight} onChange={handleChange} required style={inputStyle} placeholder="165" />
              </div>
              <div>
                <label style={labelStyle}>Goal Weight (lbs)</label>
                <input name="goal_weight" type="number" value={form.goal_weight} onChange={handleChange} style={inputStyle} placeholder="175" />
              </div>
              <div>
                <label style={labelStyle}>Height (ft) *</label>
                <input name="height_feet" type="number" value={form.height_feet} onChange={handleChange} required style={inputStyle} placeholder="5" min="3" max="7" />
              </div>
              <div>
                <label style={labelStyle}>Height (in)</label>
                <input name="height_inches" type="number" value={form.height_inches} onChange={handleChange} style={inputStyle} placeholder="10" min="0" max="11" />
              </div>
              <div>
                <label style={labelStyle}>Activity Level *</label>
                <select name="activity_level" value={form.activity_level} onChange={handleChange} required style={inputStyle}>
                  {ACTIVITY_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Activity Level Description */}
            <div style={{ marginTop: '12px', padding: '12px', background: '#f3f4f6', borderRadius: '8px', fontSize: '13px', color: '#6b7280' }}>
              {ACTIVITY_LEVELS.find(l => l.value === form.activity_level)?.desc || 'Select activity level'}
            </div>

            {/* Live BMR/TDEE Display */}
            {calculatedBMR && (
              <div style={{ 
                marginTop: '20px', 
                padding: '20px', 
                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', 
                borderRadius: '12px',
                border: '2px solid #059669'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#059669', marginBottom: '16px', textAlign: 'center' }}>
                  📈 Calculated Metabolic Stats
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '8px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>BMR (Base Metabolic Rate)</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#059669' }}>{calculatedBMR.toLocaleString()}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>calories/day at rest</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '8px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>TDEE (Total Daily Energy)</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#059669' }}>{calculatedTDEE?.toLocaleString() || '—'}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>calories/day with activity</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Goals */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎯 Goals
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Primary Goal *</label>
                <select name="primary_goal" value={form.primary_goal} onChange={handleChange} required style={inputStyle}>
                  <option value="">Select a goal...</option>
                  <option value="Build Muscle & Gain Weight">Build Muscle & Gain Weight</option>
                  <option value="Lose Fat & Get Lean">Lose Fat & Get Lean</option>
                  <option value="Improve Performance">Improve Performance</option>
                  <option value="Maintain Current Weight">Maintain Current Weight</option>
                  <option value="Overall Health & Energy">Overall Health & Energy</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Timeline</label>
                <select name="timeline" value={form.timeline} onChange={handleChange} style={inputStyle}>
                  <option value="">Select timeline...</option>
                  <option value="1-2 months">1-2 months</option>
                  <option value="3-4 months">3-4 months</option>
                  <option value="6+ months">6+ months</option>
                  <option value="Ongoing">Ongoing</option>
                </select>
              </div>
            </div>
          </div>

          {/* Food Preferences */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🍽️ Food Preferences
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>
              Select all the foods you enjoy eating. This helps us build a meal plan you'll actually follow!
            </p>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ ...labelStyle, marginBottom: '12px' }}>Proteins You Like</label>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {PROTEINS.map(item => (
                  <span key={item} onClick={() => handleMultiSelect('proteins_liked', item)} style={chipStyle(form.proteins_liked.includes(item))}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ ...labelStyle, marginBottom: '12px' }}>Carbs You Like</label>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {CARBS.map(item => (
                  <span key={item} onClick={() => handleMultiSelect('carbs_liked', item)} style={chipStyle(form.carbs_liked.includes(item))}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ ...labelStyle, marginBottom: '12px' }}>Fruits You Like</label>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {FRUITS.map(item => (
                  <span key={item} onClick={() => handleMultiSelect('fruits_liked', item)} style={chipStyle(form.fruits_liked.includes(item))}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ ...labelStyle, marginBottom: '12px' }}>Vegetables You Like</label>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {VEGETABLES.map(item => (
                  <span key={item} onClick={() => handleMultiSelect('vegetables_liked', item)} style={chipStyle(form.vegetables_liked.includes(item))}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Foods to AVOID (allergies, dislikes, won't eat)</label>
              <textarea 
                name="foods_to_avoid" 
                value={form.foods_to_avoid} 
                onChange={handleChange} 
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} 
                placeholder="List any foods you absolutely won't eat..."
              />
            </div>
          </div>

          {/* Allergies & Restrictions */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ Allergies & Dietary Restrictions
            </h2>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ ...labelStyle, marginBottom: '12px' }}>Food Allergies</label>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {ALLERGIES.map(item => (
                  <span key={item} onClick={() => handleMultiSelect('allergies', item)} style={chipStyle(form.allergies.includes(item))}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label style={{ ...labelStyle, marginBottom: '12px' }}>Dietary Restrictions</label>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {DIETARY_RESTRICTIONS.map(item => (
                  <span key={item} onClick={() => handleMultiSelect('dietary_restrictions', item)} style={chipStyle(form.dietary_restrictions.includes(item))}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Meal Logistics */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🍳 Meal Logistics
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Meals Per Day *</label>
                <select name="meals_per_day" value={form.meals_per_day} onChange={handleChange} required style={inputStyle}>
                  <option value="3">3 meals</option>
                  <option value="4">4 meals</option>
                  <option value="5">5 meals</option>
                  <option value="6">6 meals</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Who helps with meal prep?</label>
                <select name="meal_prep_help" value={form.meal_prep_help} onChange={handleChange} style={inputStyle}>
                  <option value="">Select...</option>
                  <option value="I do it myself">I do it myself</option>
                  <option value="Parent/Guardian">Parent/Guardian</option>
                  <option value="Both">Both</option>
                  <option value="Other family member">Other family member</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Grocery Budget (weekly)</label>
                <select name="grocery_budget" value={form.grocery_budget} onChange={handleChange} style={inputStyle}>
                  <option value="">Select...</option>
                  <option value="Under $100">Under $100</option>
                  <option value="$100-150">$100-150</option>
                  <option value="$150-200">$150-200</option>
                  <option value="$200+">$200+</option>
                  <option value="No limit">No limit</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Current Supplements</label>
                <input name="current_supplements" value={form.current_supplements} onChange={handleChange} style={inputStyle} placeholder="Protein powder, creatine, etc." />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                <input type="checkbox" name="has_microwave_at_school" checked={form.has_microwave_at_school} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
                <span style={{ color: '#374151' }}>Has microwave access at school</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                <input type="checkbox" name="cooks_own_meals" checked={form.cooks_own_meals} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
                <span style={{ color: '#374151' }}>Cooks own meals</span>
              </label>
            </div>
          </div>

          {/* Additional Notes */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📝 Additional Notes
            </h2>
            <textarea 
              name="notes" 
              value={form.notes} 
              onChange={handleChange} 
              style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} 
              placeholder="Anything else Coach Fouts should know? Training schedule, upcoming events, specific concerns..."
            />
          </div>

          {/* Submit */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
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
                maxWidth: '400px',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                padding: '18px 32px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '18px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)'
              }}
            >
              {loading ? 'Submitting...' : '🚀 Submit Intake Form'}
            </button>
            <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>
              Coach Fouts will review and contact you within 24-48 hours.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '32px', color: '#a7f3d0', fontSize: '14px' }}>
          <p>Coach Fouts Sports Nutrition | NCSF Certified</p>
          <p>JeremyFouts.com</p>
        </div>
      </div>
    </div>
  );
}
