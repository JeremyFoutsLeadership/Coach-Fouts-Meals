// src/pages/IntakeForm.jsx
// Self-contained intake form with inline Supabase client
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client directly
const supabase = createClient(
  'https://yrzyqenakawldeqtrtgb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyenlxZW5ha2F3bGRlcXRydGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3MTcyMjMsImV4cCI6MjA1MjI5MzIyM30.jGqzXwIKlWwVVep3qCXuGvolXJF_WaDzNTIsNarkWyk'
);

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
        meals_per_day: parseInt(form.meals_per_day),
        status: 'new'
      };

      console.log('Submitting form data:', submissionData);

      const { data, error: supabaseError } = await supabase
        .from('intake_forms')
        .insert([submissionData])
        .select();

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw supabaseError;
      }

      console.log('Form submitted successfully:', data);
      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError(`There was an error submitting the form: ${err.message || 'Unknown error'}. Please try again or contact Coach Fouts directly.`);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">You're All Set!</h1>
          <p className="text-gray-600 mb-6">
            Thanks for submitting your intake form. Coach Fouts will review your information 
            and reach out within 24-48 hours to discuss your personalized nutrition plan.
          </p>
          <a 
            href="https://jeremyfouts.com" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Back to JeremyFouts.com
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            🏆 Athlete Nutrition Intake Form
          </h1>
          <p className="text-blue-200">
            Coach Fouts Sports Nutrition | NCSF Certified
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4">
            <h2 className="text-xl font-bold">1. Basic Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Athlete Name *</label>
                <input type="text" name="athlete_name" value={form.athlete_name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="First and Last Name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Parent/Guardian Name</label>
                <input type="text" name="parent_name" value={form.parent_name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Parent Name" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="(555) 555-5555" />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Age *</label>
                <input type="number" name="age" value={form.age} onChange={handleChange} required min="8" max="25" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Age" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Sport *</label>
                <select name="sport" value={form.sport} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select Sport</option>
                  {SPORTS.map(sport => (<option key={sport} value={sport}>{sport}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Position</label>
                <input type="text" name="position" value={form.position} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Pitcher, QB" />
              </div>
            </div>
          </div>

          <div className="bg-blue-600 text-white px-6 py-4">
            <h2 className="text-xl font-bold">2. Physical Stats & Goals</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Current Weight (lbs) *</label>
                <input type="number" name="current_weight" value={form.current_weight} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 150" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Goal Weight (lbs)</label>
                <input type="number" name="goal_weight" value={form.goal_weight} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 170" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Height</label>
                <div className="flex gap-2">
                  <input type="number" name="height_feet" value={form.height_feet} onChange={handleChange} min="4" max="7" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Feet" />
                  <input type="number" name="height_inches" value={form.height_inches} onChange={handleChange} min="0" max="11" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Inches" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Primary Goal *</label>
                <select name="primary_goal" value={form.primary_goal} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="gain">Gain Weight / Build Muscle</option>
                  <option value="lose">Lose Weight / Cut Fat</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="performance">Improve Performance</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Timeline / Upcoming Season</label>
              <input type="text" name="timeline" value={form.timeline} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Spring baseball starts March 1st" />
            </div>
          </div>

          <div className="bg-blue-600 text-white px-6 py-4">
            <h2 className="text-xl font-bold">3. Food Preferences</h2>
            <p className="text-blue-200 text-sm">Check all foods you LIKE and will eat</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Proteins I Like ✓</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {PROTEINS.map(protein => (
                  <label key={protein} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.proteins_liked.includes(protein)} onChange={() => toggleArrayItem('proteins_liked', protein)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">{protein}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Carbs I Like ✓</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {CARBS.map(carb => (
                  <label key={carb} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.carbs_liked.includes(carb)} onChange={() => toggleArrayItem('carbs_liked', carb)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">{carb}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fruits I Like ✓</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {FRUITS.map(fruit => (
                  <label key={fruit} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.fruits_liked.includes(fruit)} onChange={() => toggleArrayItem('fruits_liked', fruit)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">{fruit}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Vegetables I Like ✓</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {VEGETABLES.map(veg => (
                  <label key={veg} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.vegetables_liked.includes(veg)} onChange={() => toggleArrayItem('vegetables_liked', veg)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">{veg}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Foods You Absolutely WON'T Eat</label>
              <textarea name="foods_to_avoid" value={form.foods_to_avoid} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="List any foods you refuse to eat..." />
            </div>
          </div>

          <div className="bg-blue-600 text-white px-6 py-4">
            <h2 className="text-xl font-bold">4. Allergies & Restrictions</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Food Allergies (check all that apply)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Shellfish', 'Fish', 'Wheat/Gluten', 'Soy'].map(allergy => (
                  <label key={allergy} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.allergies.includes(allergy)} onChange={() => toggleArrayItem('allergies', allergy)} className="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
                    <span className="text-sm text-gray-700">{allergy}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dietary Restrictions</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Gluten-Free', 'Dairy-Free', 'Vegetarian', 'No Pork', 'No Red Meat', 'Kosher'].map(restriction => (
                  <label key={restriction} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.dietary_restrictions.includes(restriction)} onChange={() => toggleArrayItem('dietary_restrictions', restriction)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">{restriction}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-600 text-white px-6 py-4">
            <h2 className="text-xl font-bold">5. Meal Logistics</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Meals Per Day</label>
                <select name="meals_per_day" value={form.meals_per_day} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value={4}>4 (Breakfast, Lunch, Dinner, Snack)</option>
                  <option value={5}>5 (+ After School Snack)</option>
                  <option value={6}>6 (+ Evening Shake) - Recommended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Meal Prep Help at Home</label>
                <select name="meal_prep_help" value={form.meal_prep_help} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="none">None - I prep everything myself</option>
                  <option value="some">Some - Parents help with some meals</option>
                  <option value="full">Full - Parents prepare most meals</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="has_microwave_at_school" checked={form.has_microwave_at_school} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                <span className="text-gray-700">Microwave available at school</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="cooks_own_meals" checked={form.cooks_own_meals} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                <span className="text-gray-700">Athlete cooks their own meals</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Weekly Grocery Budget (optional)</label>
              <input type="text" name="grocery_budget" value={form.grocery_budget} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., $150/week" />
            </div>
          </div>

          <div className="bg-blue-600 text-white px-6 py-4">
            <h2 className="text-xl font-bold">6. Additional Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Current Supplements (if any)</label>
              <input type="text" name="current_supplements" value={form.current_supplements} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Protein powder, creatine, multivitamin" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Anything Else Coach Fouts Should Know?</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Medical conditions, schedule constraints, picky eater, etc." />
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
            )}
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Submitting...' : '🚀 Submit Intake Form'}
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">
              By submitting, you agree to be contacted by Coach Fouts Sports Nutrition.
            </p>
          </div>
        </form>

        <div className="text-center mt-8 text-blue-200 text-sm">
          <p>Coach Fouts Sports Nutrition | NCSF Certified</p>
          <p>JeremyFouts.com</p>
        </div>
      </div>
    </div>
  );
}
