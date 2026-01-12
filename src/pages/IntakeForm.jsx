import { useState } from 'react';
import { submitIntakeForm } from '../lib/supabase';

const PROTEINS = [
  'Chicken Breast', 'Chicken Thighs', 'Ground Beef', 'Steak', 'Pork Chops',
  'Turkey', 'Ham', 'Bacon', 'Salmon', 'Tilapia', 'Shrimp', 'Eggs',
  'Greek Yogurt', 'Cottage Cheese', 'Beef Jerky', 'Deli Meat'
];

const CARBS = [
  'White Rice', 'Brown Rice', 'Pasta', 'Bread', 'Tortillas', 'Oatmeal',
  'Potatoes', 'Sweet Potatoes', 'Quinoa', 'Bagels', 'Cereal', 'Pancakes',
  'Waffles', 'Grits', 'Crackers', 'Pretzels'
];

const FRUITS = [
  'Bananas', 'Apples', 'Oranges', 'Strawberries', 'Blueberries', 'Grapes',
  'Watermelon', 'Pineapple', 'Mango', 'Peaches', 'Cantaloupe', 'Kiwi'
];

const VEGETABLES = [
  'Broccoli', 'Green Beans', 'Corn', 'Carrots', 'Spinach', 'Lettuce',
  'Bell Peppers', 'Asparagus', 'Peas', 'Zucchini', 'Cucumbers', 'Tomatoes'
];

const SPORTS = [
  'Baseball', 'Basketball', 'Football', 'Soccer', 'Softball', 'Wrestling',
  'Track & Field', 'Swimming', 'Tennis', 'Golf', 'Volleyball', 'Other'
];

export default function IntakeForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    athlete_name: '',
    parent_name: '',
    email: '',
    phone: '',
    age: '',
    sport: '',
    position: '',
    current_weight: '',
    goal_weight: '',
    height_feet: '',
    height_inches: '',
    primary_goal: 'gain',
    timeline: '',
    proteins_liked: [],
    proteins_disliked: [],
    carbs_liked: [],
    carbs_disliked: [],
    fruits_liked: [],
    vegetables_liked: [],
    allergies: [],
    dietary_restrictions: [],
    foods_to_avoid: '',
    meals_per_day: 6,
    cooks_own_meals: false,
    has_microwave_at_school: true,
    meal_prep_help: 'some',
    grocery_budget: '',
    current_supplements: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleArrayItem = (field, item) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submissionData = {
        ...form,
        age: form.age ? parseInt(form.age) : null,
        current_weight: form.current_weight ? parseFloat(form.current_weight) : null,
        goal_weight: form.goal_weight ? parseFloat(form.goal_weight) : null,
        height_feet: form.height_feet ? parseInt(form.height_feet) : null,
        height_inches: form.height_inches ? parseInt(form.height_inches) : null,
        meals_per_day: parseInt(form.meals_per_day)
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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '40px', maxWidth: '500px', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>You're All Set!</h1>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Thanks for submitting your intake form. Coach Fouts will review your information 
            and reach out within 24-48 hours to discuss your personalized nutrition plan.
          </p>
          <a 
            href="https://jeremyfouts.com" 
            style={{ display: 'inline-block', background: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}
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

  const sectionHeaderStyle = {
    background: '#2563eb',
    color: 'white',
    padding: '16px 24px',
    fontSize: '20px',
    fontWeight: 'bold'
  };

  const checkboxContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '8px'
  };

  const checkboxLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    color: '#1f2937'
  };

  const checkboxTextStyle = {
    fontSize: '14px',
    color: '#1f2937'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)', padding: '32px 16px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            🏆 Athlete Nutrition Intake Form
          </h1>
          <p style={{ color: '#bfdbfe' }}>
            Coach Fouts Sports Nutrition | NCSF Certified
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
          
          {/* Section 1: Basic Info */}
          <div style={sectionHeaderStyle}>1. Basic Information</div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Athlete Name *</label>
                <input type="text" name="athlete_name" value={form.athlete_name} onChange={handleChange} required style={inputStyle} placeholder="First and Last Name" />
              </div>
              <div>
                <label style={labelStyle}>Parent/Guardian Name</label>
                <input type="text" name="parent_name" value={form.parent_name} onChange={handleChange} style={inputStyle} placeholder="Parent Name" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required style={inputStyle} placeholder="email@example.com" />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} style={inputStyle} placeholder="(555) 555-5555" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Age *</label>
                <input type="number" name="age" value={form.age} onChange={handleChange} required min="8" max="25" style={inputStyle} placeholder="Age" />
              </div>
              <div>
                <label style={labelStyle}>Sport *</label>
                <select name="sport" value={form.sport} onChange={handleChange} required style={inputStyle}>
                  <option value="">Select Sport</option>
                  {SPORTS.map(sport => <option key={sport} value={sport}>{sport}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Position</label>
                <input type="text" name="position" value={form.position} onChange={handleChange} style={inputStyle} placeholder="e.g., Pitcher, QB" />
              </div>
            </div>
          </div>

          {/* Section 2: Physical Stats */}
          <div style={sectionHeaderStyle}>2. Physical Stats & Goals</div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Current Weight (lbs) *</label>
                <input type="number" name="current_weight" value={form.current_weight} onChange={handleChange} required style={inputStyle} placeholder="e.g., 150" />
              </div>
              <div>
                <label style={labelStyle}>Goal Weight (lbs)</label>
                <input type="number" name="goal_weight" value={form.goal_weight} onChange={handleChange} style={inputStyle} placeholder="e.g., 170" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Height</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="number" name="height_feet" value={form.height_feet} onChange={handleChange} min="4" max="7" style={inputStyle} placeholder="Feet" />
                  <input type="number" name="height_inches" value={form.height_inches} onChange={handleChange} min="0" max="11" style={inputStyle} placeholder="Inches" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Primary Goal *</label>
                <select name="primary_goal" value={form.primary_goal} onChange={handleChange} required style={inputStyle}>
                  <option value="gain">Gain Weight / Build Muscle</option>
                  <option value="lose">Lose Weight / Cut Fat</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="performance">Improve Performance</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Timeline / Upcoming Season</label>
              <input type="text" name="timeline" value={form.timeline} onChange={handleChange} style={inputStyle} placeholder="e.g., Spring baseball starts March 1st" />
            </div>
          </div>

          {/* Section 3: Food Preferences */}
          <div style={sectionHeaderStyle}>3. Food Preferences (Check all you LIKE)</div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ ...labelStyle, marginBottom: '8px' }}>Proteins I Like ✓</label>
              <div style={checkboxContainerStyle}>
                {PROTEINS.map(protein => (
                  <label key={protein} style={checkboxLabelStyle}>
                    <input type="checkbox" checked={form.proteins_liked.includes(protein)} onChange={() => toggleArrayItem('proteins_liked', protein)} />
                    <span style={checkboxTextStyle}>{protein}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ ...labelStyle, marginBottom: '8px' }}>Carbs I Like ✓</label>
              <div style={checkboxContainerStyle}>
                {CARBS.map(carb => (
                  <label key={carb} style={checkboxLabelStyle}>
                    <input type="checkbox" checked={form.carbs_liked.includes(carb)} onChange={() => toggleArrayItem('carbs_liked', carb)} />
                    <span style={checkboxTextStyle}>{carb}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ ...labelStyle, marginBottom: '8px' }}>Fruits I Like ✓</label>
              <div style={checkboxContainerStyle}>
                {FRUITS.map(fruit => (
                  <label key={fruit} style={checkboxLabelStyle}>
                    <input type="checkbox" checked={form.fruits_liked.includes(fruit)} onChange={() => toggleArrayItem('fruits_liked', fruit)} />
                    <span style={checkboxTextStyle}>{fruit}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ ...labelStyle, marginBottom: '8px' }}>Vegetables I Like ✓</label>
              <div style={checkboxContainerStyle}>
                {VEGETABLES.map(veg => (
                  <label key={veg} style={checkboxLabelStyle}>
                    <input type="checkbox" checked={form.vegetables_liked.includes(veg)} onChange={() => toggleArrayItem('vegetables_liked', veg)} />
                    <span style={checkboxTextStyle}>{veg}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Foods You Absolutely WON'T Eat</label>
              <textarea name="foods_to_avoid" value={form.foods_to_avoid} onChange={handleChange} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="List any foods you refuse to eat..." />
            </div>
          </div>

          {/* Section 4: Restrictions */}
          <div style={sectionHeaderStyle}>4. Allergies & Restrictions</div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ ...labelStyle, marginBottom: '8px' }}>Food Allergies</label>
              <div style={checkboxContainerStyle}>
                {['Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Shellfish', 'Fish', 'Wheat/Gluten', 'Soy'].map(allergy => (
                  <label key={allergy} style={checkboxLabelStyle}>
                    <input type="checkbox" checked={form.allergies.includes(allergy)} onChange={() => toggleArrayItem('allergies', allergy)} />
                    <span style={checkboxTextStyle}>{allergy}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ ...labelStyle, marginBottom: '8px' }}>Dietary Restrictions</label>
              <div style={checkboxContainerStyle}>
                {['Gluten-Free', 'Dairy-Free', 'Vegetarian', 'No Pork', 'No Red Meat', 'Kosher'].map(restriction => (
                  <label key={restriction} style={checkboxLabelStyle}>
                    <input type="checkbox" checked={form.dietary_restrictions.includes(restriction)} onChange={() => toggleArrayItem('dietary_restrictions', restriction)} />
                    <span style={checkboxTextStyle}>{restriction}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Logistics */}
          <div style={sectionHeaderStyle}>5. Meal Logistics</div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Meals Per Day</label>
                <select name="meals_per_day" value={form.meals_per_day} onChange={handleChange} style={inputStyle}>
                  <option value={4}>4 (Breakfast, Lunch, Dinner, Snack)</option>
                  <option value={5}>5 (+ After School Snack)</option>
                  <option value={6}>6 (+ Evening Shake) - Recommended</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Meal Prep Help at Home</label>
                <select name="meal_prep_help" value={form.meal_prep_help} onChange={handleChange} style={inputStyle}>
                  <option value="none">None - I prep everything myself</option>
                  <option value="some">Some - Parents help with some meals</option>
                  <option value="full">Full - Parents prepare most meals</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <label style={checkboxLabelStyle}>
                <input type="checkbox" name="has_microwave_at_school" checked={form.has_microwave_at_school} onChange={handleChange} />
                <span style={checkboxTextStyle}>Microwave available at school</span>
              </label>
              <label style={checkboxLabelStyle}>
                <input type="checkbox" name="cooks_own_meals" checked={form.cooks_own_meals} onChange={handleChange} />
                <span style={checkboxTextStyle}>Athlete cooks their own meals</span>
              </label>
            </div>

            <div>
              <label style={labelStyle}>Weekly Grocery Budget (optional)</label>
              <input type="text" name="grocery_budget" value={form.grocery_budget} onChange={handleChange} style={inputStyle} placeholder="e.g., $150/week" />
            </div>
          </div>

          {/* Section 6: Additional */}
          <div style={sectionHeaderStyle}>6. Additional Information</div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Current Supplements (if any)</label>
              <input type="text" name="current_supplements" value={form.current_supplements} onChange={handleChange} style={inputStyle} placeholder="e.g., Protein powder, creatine, multivitamin" />
            </div>
            <div>
              <label style={labelStyle}>Anything Else Coach Fouts Should Know?</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Medical conditions, schedule constraints, picky eater, etc." />
            </div>
          </div>

          {/* Submit */}
          <div style={{ padding: '24px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
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
                background: loading ? '#9ca3af' : '#2563eb',
                color: 'white',
                padding: '16px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '18px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Submitting...' : '🚀 Submit Intake Form'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '16px' }}>
              By submitting, you agree to be contacted by Coach Fouts Sports Nutrition.
            </p>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px', color: '#bfdbfe', fontSize: '14px' }}>
          <p>Coach Fouts Sports Nutrition | NCSF Certified</p>
          <p>JeremyFouts.com</p>
        </div>
      </div>
    </div>
  );
}
