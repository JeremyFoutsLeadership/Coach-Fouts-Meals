import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useParams } from 'react-router-dom';
import { localDB, isSupabaseConfigured } from './lib/database';
import { FOOD_DATABASE, ALL_FOODS, getFoodById, searchFoods, FOOD_CATEGORIES } from './data/foods';
import { DEFAULT_MEAL_TEMPLATES, getAllMealTemplates } from './data/mealTemplates';
import { 
  calculateTargets, 
  calculateItemMacros, 
  calculateMealMacros, 
  calculateDayMacros,
  calculateWeeklyAverage,
  calculateTargetPercentage,
  getMacroStatus,
  formatHeight,
  parseHeightToInches,
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS 
} from './lib/calculations';
import { downloadMealPlanPDF, generateMealPlanText } from './lib/pdfGenerator';
import './App.css';

// Create context for global state
const AppContext = createContext();

const useApp = () => useContext(AppContext);

// ============================================
// HEADER COMPONENT
// ============================================
const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">CF</div>
          <div className="logo-text">
            <span className="logo-title">Coach Fouts</span>
            <span className="logo-subtitle">Meal Plan Builder</span>
          </div>
        </div>
        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Dashboard
          </NavLink>
          <NavLink to="/athletes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Athletes
          </NavLink>
          <NavLink to="/builder" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Plan Builder
          </NavLink>
          <NavLink to="/meals" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Saved Meals
          </NavLink>
          <NavLink to="/foods" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Food Database
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

// ============================================
// DASHBOARD PAGE
// ============================================
const Dashboard = () => {
  const { athletes, mealPlans } = useApp();
  
  const recentAthletes = athletes.slice(0, 5);
  const athletesNeedingPlans = athletes.filter(a => {
    const plans = mealPlans.filter(p => p.athlete_id === a.id);
    return plans.length === 0;
  });
  
  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{athletes.length}</div>
          <div className="stat-label">Total Athletes</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{mealPlans.length}</div>
          <div className="stat-label">Meal Plans</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{athletesNeedingPlans.length}</div>
          <div className="stat-label">Need Plans</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{ALL_FOODS.length}</div>
          <div className="stat-label">Foods in Database</div>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2>Recent Athletes</h2>
          {recentAthletes.length === 0 ? (
            <div className="empty-state small">
              <p>No athletes yet. Add your first athlete to get started.</p>
              <NavLink to="/athletes" className="btn btn-primary">Add Athlete</NavLink>
            </div>
          ) : (
            <div className="athlete-list-small">
              {recentAthletes.map(athlete => (
                <NavLink to={`/athletes/${athlete.id}`} key={athlete.id} className="athlete-row">
                  <div className="athlete-row-info">
                    <span className="athlete-row-name">{athlete.name}</span>
                    <span className="athlete-row-sport">{athlete.sport}</span>
                  </div>
                  <span className="athlete-row-targets">{athlete.targets?.calories} cal</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
        
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <NavLink to="/athletes/new" className="quick-action-btn">
              <span className="quick-action-icon">+</span>
              <span>New Athlete</span>
            </NavLink>
            <NavLink to="/builder" className="quick-action-btn">
              <span className="quick-action-icon">📋</span>
              <span>Build Plan</span>
            </NavLink>
            <NavLink to="/foods" className="quick-action-btn">
              <span className="quick-action-icon">🔍</span>
              <span>Search Foods</span>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ATHLETES LIST PAGE
// ============================================
const AthletesList = () => {
  const { athletes } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  const filteredAthletes = athletes.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.sport?.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Athletes</h1>
        <button className="btn btn-primary" onClick={() => navigate('/athletes/new')}>
          + New Athlete
        </button>
      </div>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search athletes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      </div>
      
      {filteredAthletes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏃‍♂️</div>
          <h3>No athletes found</h3>
          <p>Add your first athlete to start building meal plans</p>
          <button className="btn btn-primary" onClick={() => navigate('/athletes/new')}>
            Add Athlete
          </button>
        </div>
      ) : (
        <div className="athletes-grid">
          {filteredAthletes.map(athlete => (
            <div 
              key={athlete.id} 
              className="athlete-card"
              onClick={() => navigate(`/athletes/${athlete.id}`)}
            >
              <div className="athlete-card-header">
                <h3>{athlete.name}</h3>
                <span className="sport-badge">{athlete.sport}</span>
              </div>
              <div className="athlete-card-stats">
                <div>Age: {athlete.age}</div>
                <div>Weight: {athlete.weight} lbs</div>
                <div>Calories: {athlete.targets?.calories}</div>
                <div>Protein: {athlete.targets?.protein}g</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// NEW/EDIT ATHLETE PAGE
// ============================================
const AthleteForm = () => {
  const { addAthlete, updateAthlete, athletes } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const existingAthlete = id && id !== 'new' ? athletes.find(a => a.id === id) : null;
  
  const [form, setForm] = useState({
    name: existingAthlete?.name || '',
    sport: existingAthlete?.sport || '',
    age: existingAthlete?.age || '',
    gender: existingAthlete?.gender || 'male',
    weight: existingAthlete?.weight || '',
    heightFeet: existingAthlete ? Math.floor(existingAthlete.height / 12) : '',
    heightInches: existingAthlete ? existingAthlete.height % 12 : '',
    activityLevel: existingAthlete?.activityLevel || 'active',
    goal: existingAthlete?.goal || 'gain',
    preferences: existingAthlete?.preferences || '',
    restrictions: existingAthlete?.restrictions || '',
  });
  
  const [calculatedTargets, setCalculatedTargets] = useState(null);
  
  useEffect(() => {
    if (form.weight && form.heightFeet && form.age) {
      const heightInches = parseHeightToInches(form.heightFeet, form.heightInches);
      const targets = calculateTargets(
        parseFloat(form.weight),
        heightInches,
        parseInt(form.age),
        form.gender,
        form.activityLevel,
        form.goal
      );
      setCalculatedTargets(targets);
    } else {
      setCalculatedTargets(null);
    }
  }, [form]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const heightInches = parseHeightToInches(form.heightFeet, form.heightInches);
    const athleteData = {
      name: form.name,
      sport: form.sport,
      age: parseInt(form.age),
      gender: form.gender,
      weight: parseFloat(form.weight),
      height: heightInches,
      activityLevel: form.activityLevel,
      goal: form.goal,
      preferences: form.preferences,
      restrictions: form.restrictions,
      targets: calculatedTargets,
    };
    
    if (existingAthlete) {
      updateAthlete(existingAthlete.id, athleteData);
    } else {
      addAthlete(athleteData);
    }
    
    navigate('/athletes');
  };
  
  return (
    <div className="page">
      <h1 className="page-title">{existingAthlete ? 'Edit Athlete' : 'New Athlete'}</h1>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Antonio D'Alessandro"
              required
            />
          </div>
          <div className="form-group">
            <label>Sport *</label>
            <input
              type="text"
              value={form.sport}
              onChange={e => setForm({ ...form, sport: e.target.value })}
              placeholder="Football"
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Age *</label>
            <input
              type="number"
              value={form.age}
              onChange={e => setForm({ ...form, age: e.target.value })}
              placeholder="16"
              required
            />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label>Weight (lbs) *</label>
            <input
              type="number"
              value={form.weight}
              onChange={e => setForm({ ...form, weight: e.target.value })}
              placeholder="183"
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Height *</label>
            <div className="height-inputs">
              <input
                type="number"
                value={form.heightFeet}
                onChange={e => setForm({ ...form, heightFeet: e.target.value })}
                placeholder="6"
                required
              />
              <span>ft</span>
              <input
                type="number"
                value={form.heightInches}
                onChange={e => setForm({ ...form, heightInches: e.target.value })}
                placeholder="1"
              />
              <span>in</span>
            </div>
          </div>
          <div className="form-group">
            <label>Activity Level</label>
            <select value={form.activityLevel} onChange={e => setForm({ ...form, activityLevel: e.target.value })}>
              {Object.entries(ACTIVITY_MULTIPLIERS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Goal</label>
            <select value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}>
              {Object.entries(GOAL_ADJUSTMENTS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>Food Preferences</label>
          <textarea
            value={form.preferences}
            onChange={e => setForm({ ...form, preferences: e.target.value })}
            placeholder="Loves: Steak, sushi, chicken, Chipotle, breakfast burritos..."
          />
        </div>
        
        <div className="form-group">
          <label>Restrictions / Dislikes</label>
          <textarea
            value={form.restrictions}
            onChange={e => setForm({ ...form, restrictions: e.target.value })}
            placeholder="NO bacon, onions, waffles..."
          />
        </div>
        
        {calculatedTargets && (
          <div className="calculated-targets">
            <h3>Calculated Daily Targets</h3>
            <div className="targets-grid">
              <div className="target-box">
                <span className="target-value">{calculatedTargets.calories}</span>
                <span className="target-label">Calories</span>
              </div>
              <div className="target-box">
                <span className="target-value">{calculatedTargets.protein}g</span>
                <span className="target-label">Protein</span>
              </div>
              <div className="target-box">
                <span className="target-value">{calculatedTargets.carbs}g</span>
                <span className="target-label">Carbs</span>
              </div>
              <div className="target-box">
                <span className="target-value">{calculatedTargets.fat}g</span>
                <span className="target-label">Fat</span>
              </div>
            </div>
            <div className="targets-detail">
              <small>BMR: {calculatedTargets.bmr} | TDEE: {calculatedTargets.tdee}</small>
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/athletes')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!calculatedTargets}>
            {existingAthlete ? 'Update Athlete' : 'Create Athlete'}
          </button>
        </div>
      </form>
    </div>
  );
};

// ============================================
// ATHLETE DETAIL PAGE
// ============================================
const AthleteDetail = () => {
  const { athletes, mealPlans, deleteAthlete } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const athlete = athletes.find(a => a.id === id);
  const athletePlans = mealPlans.filter(p => p.athlete_id === id);
  
  if (!athlete) {
    return (
      <div className="page">
        <div className="empty-state">
          <h3>Athlete not found</h3>
          <button className="btn btn-primary" onClick={() => navigate('/athletes')}>
            Back to Athletes
          </button>
        </div>
      </div>
    );
  }
  
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${athlete.name}?`)) {
      deleteAthlete(athlete.id);
      navigate('/athletes');
    }
  };
  
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{athlete.name}</h1>
          <span className="sport-badge large">{athlete.sport}</span>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate(`/athletes/${id}/edit`)}>
            Edit
          </button>
          <button className="btn btn-primary" onClick={() => navigate(`/builder?athlete=${id}`)}>
            Build Plan
          </button>
        </div>
      </div>
      
      <div className="athlete-detail-grid">
        <div className="detail-card">
          <h3>Profile</h3>
          <div className="detail-list">
            <div className="detail-row">
              <span>Age</span>
              <span>{athlete.age} years</span>
            </div>
            <div className="detail-row">
              <span>Weight</span>
              <span>{athlete.weight} lbs</span>
            </div>
            <div className="detail-row">
              <span>Height</span>
              <span>{formatHeight(athlete.height)}</span>
            </div>
            <div className="detail-row">
              <span>Activity</span>
              <span>{ACTIVITY_MULTIPLIERS[athlete.activityLevel]?.label}</span>
            </div>
            <div className="detail-row">
              <span>Goal</span>
              <span>{GOAL_ADJUSTMENTS[athlete.goal]?.label}</span>
            </div>
          </div>
        </div>
        
        <div className="detail-card">
          <h3>Daily Targets</h3>
          <div className="targets-grid">
            <div className="target-box">
              <span className="target-value">{athlete.targets?.calories}</span>
              <span className="target-label">Calories</span>
            </div>
            <div className="target-box">
              <span className="target-value">{athlete.targets?.protein}g</span>
              <span className="target-label">Protein</span>
            </div>
            <div className="target-box">
              <span className="target-value">{athlete.targets?.carbs}g</span>
              <span className="target-label">Carbs</span>
            </div>
            <div className="target-box">
              <span className="target-value">{athlete.targets?.fat}g</span>
              <span className="target-label">Fat</span>
            </div>
          </div>
        </div>
        
        {(athlete.preferences || athlete.restrictions) && (
          <div className="detail-card full-width">
            <h3>Food Notes</h3>
            {athlete.preferences && (
              <p><strong>Loves:</strong> {athlete.preferences}</p>
            )}
            {athlete.restrictions && (
              <p><strong>Restrictions:</strong> {athlete.restrictions}</p>
            )}
          </div>
        )}
        
        <div className="detail-card full-width">
          <h3>Meal Plans ({athletePlans.length})</h3>
          {athletePlans.length === 0 ? (
            <div className="empty-state small">
              <p>No meal plans yet</p>
              <button className="btn btn-primary" onClick={() => navigate(`/builder?athlete=${id}`)}>
                Create First Plan
              </button>
            </div>
          ) : (
            <div className="plans-list">
              {athletePlans.map(plan => (
                <div key={plan.id} className="plan-row">
                  <span>Created {new Date(plan.created_at).toLocaleDateString()}</span>
                  <button className="btn btn-small" onClick={() => navigate(`/builder?plan=${plan.id}`)}>
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="danger-zone">
        <button className="btn btn-danger" onClick={handleDelete}>
          Delete Athlete
        </button>
      </div>
    </div>
  );
};

// ============================================
// PLAN BUILDER PAGE
// ============================================
const PlanBuilder = () => {
  const { athletes, mealPlans, addMealPlan, updateMealPlan } = useApp();
  const navigate = useNavigate();
  
  // Get query params
  const params = new URLSearchParams(window.location.search);
  const athleteIdParam = params.get('athlete');
  const planIdParam = params.get('plan');
  
  const [selectedAthleteId, setSelectedAthleteId] = useState(athleteIdParam || '');
  const [selectedDay, setSelectedDay] = useState(0);
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [showMealPicker, setShowMealPicker] = useState(false);
  const [currentMealSlot, setCurrentMealSlot] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const selectedAthlete = athletes.find(a => a.id === selectedAthleteId);
  
  // Initialize plan
  const emptyDay = {
    breakfast: [],
    snack1: [],
    lunch: [],
    snack2: [],
    dinner: [],
    evening: [],
  };
  
  const [plan, setPlan] = useState({
    athlete_id: athleteIdParam || '',
    targets: selectedAthlete?.targets || { calories: 3500, protein: 200, carbs: 400, fat: 120 },
    days: Array(7).fill(null).map(() => JSON.parse(JSON.stringify(emptyDay))),
  });
  
  // Load existing plan if editing
  useEffect(() => {
    if (planIdParam) {
      const existingPlan = mealPlans.find(p => p.id === planIdParam);
      if (existingPlan) {
        setPlan(existingPlan);
        setSelectedAthleteId(existingPlan.athlete_id);
      }
    }
  }, [planIdParam, mealPlans]);
  
  // Update targets when athlete changes
  useEffect(() => {
    if (selectedAthlete) {
      setPlan(prev => ({
        ...prev,
        athlete_id: selectedAthlete.id,
        targets: selectedAthlete.targets,
      }));
    }
  }, [selectedAthlete]);
  
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const mealSlots = [
    { key: 'breakfast', label: 'Breakfast + AM' },
    { key: 'snack1', label: 'Snack 1' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'snack2', label: 'Snack 2' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'evening', label: 'Evening Shake' },
  ];
  
  const dayTotals = calculateDayMacros(plan.days[selectedDay]);
  const targets = plan.targets;
  
  const addFoodToMeal = (food, quantity = 1) => {
    if (currentMealSlot === null) return;
    
    const newPlan = { ...plan };
    newPlan.days[selectedDay][currentMealSlot].push({
      id: Date.now().toString(),
      foodId: food.id,
      food: food,
      quantity: quantity,
    });
    setPlan(newPlan);
    setShowFoodPicker(false);
  };
  
  const addSavedMealToSlot = (savedMeal) => {
    if (currentMealSlot === null) return;
    
    const newPlan = { ...plan };
    savedMeal.items.forEach(item => {
      const food = getFoodById(item.foodId);
      newPlan.days[selectedDay][currentMealSlot].push({
        id: Date.now().toString() + Math.random(),
        foodId: item.foodId,
        food: food,
        quantity: item.quantity,
      });
    });
    setPlan(newPlan);
    setShowMealPicker(false);
  };
  
  const updateItemQuantity = (mealSlot, itemIndex, newQuantity) => {
    const newPlan = { ...plan };
    newPlan.days[selectedDay][mealSlot][itemIndex].quantity = parseFloat(newQuantity) || 0;
    setPlan(newPlan);
  };
  
  const removeItem = (mealSlot, itemIndex) => {
    const newPlan = { ...plan };
    newPlan.days[selectedDay][mealSlot].splice(itemIndex, 1);
    setPlan(newPlan);
  };
  
  const copyDayToAll = () => {
    const newPlan = { ...plan };
    const sourceDay = JSON.parse(JSON.stringify(newPlan.days[selectedDay]));
    newPlan.days = newPlan.days.map(() => JSON.parse(JSON.stringify(sourceDay)));
    setPlan(newPlan);
  };
  
  const savePlan = () => {
    if (planIdParam) {
      updateMealPlan(planIdParam, plan);
    } else {
      addMealPlan(plan);
    }
    alert('Plan saved!');
  };
  
  const exportPDF = () => {
    if (!selectedAthlete) {
      alert('Please select an athlete first');
      return;
    }
    downloadMealPlanPDF(selectedAthlete, plan);
  };
  
  const filteredFoods = searchFoods(searchTerm, selectedCategory);
  const mealTemplates = getAllMealTemplates();
  
  return (
    <div className="page builder-page">
      <div className="page-header">
        <h1 className="page-title">Meal Plan Builder</h1>
        <div className="header-actions">
          <select 
            value={selectedAthleteId} 
            onChange={e => setSelectedAthleteId(e.target.value)}
            className="athlete-select"
          >
            <option value="">Select Athlete...</option>
            {athletes.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.sport})</option>
            ))}
          </select>
          <button className="btn btn-secondary" onClick={savePlan}>Save Plan</button>
          <button className="btn btn-primary" onClick={exportPDF}>Export PDF</button>
        </div>
      </div>
      
      {!selectedAthlete ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Select an athlete to start building</h3>
          <p>Choose an athlete from the dropdown above, or create a new one first.</p>
          <button className="btn btn-primary" onClick={() => navigate('/athletes/new')}>
            Add New Athlete
          </button>
        </div>
      ) : (
        <>
          {/* Targets Display */}
          <div className="targets-bar">
            <div className="athlete-info">
              <strong>{selectedAthlete.name}</strong>
              <span>{selectedAthlete.sport} • {selectedAthlete.weight} lbs</span>
            </div>
            <div className="macro-bars">
              {[
                { label: 'Calories', target: targets.calories, actual: dayTotals.calories, color: '#22c55e' },
                { label: 'Protein', target: targets.protein, actual: Math.round(dayTotals.protein), unit: 'g', color: '#3b82f6' },
                { label: 'Carbs', target: targets.carbs, actual: Math.round(dayTotals.carbs), unit: 'g', color: '#f59e0b' },
                { label: 'Fat', target: targets.fat, actual: Math.round(dayTotals.fat), unit: 'g', color: '#ef4444' },
              ].map(macro => {
                const pct = calculateTargetPercentage(macro.actual, macro.target);
                const status = getMacroStatus(macro.actual, macro.target);
                return (
                  <div key={macro.label} className="macro-bar-item">
                    <div className="macro-bar-header">
                      <span className="macro-bar-label">{macro.label}</span>
                      <span className={`macro-bar-values ${status}`}>
                        {macro.actual}{macro.unit} / {macro.target}{macro.unit}
                      </span>
                    </div>
                    <div className="macro-bar-track">
                      <div 
                        className={`macro-bar-fill ${status}`} 
                        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: macro.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Day Selector */}
          <div className="day-selector">
            {dayNames.map((day, idx) => {
              const dayMacros = calculateDayMacros(plan.days[idx]);
              const hasContent = dayMacros.calories > 0;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(idx)}
                  className={`day-btn ${selectedDay === idx ? 'active' : ''}`}
                >
                  <span>{day}</span>
                  {hasContent && <small>{dayMacros.calories} cal</small>}
                </button>
              );
            })}
            <button className="day-btn copy-btn" onClick={copyDayToAll}>
              Copy to All
            </button>
          </div>
          
          {/* Meal Slots */}
          <div className="meal-slots">
            {mealSlots.map(slot => {
              const items = plan.days[selectedDay][slot.key];
              const mealMacros = calculateMealMacros(items);
              return (
                <div key={slot.key} className="meal-slot">
                  <div className="meal-slot-header">
                    <span className="meal-slot-name">{slot.label}</span>
                    <div className="meal-slot-actions">
                      {items.length > 0 && (
                        <span className="meal-slot-macros">
                          {mealMacros.calories} cal | {Math.round(mealMacros.protein)}P
                        </span>
                      )}
                      <button 
                        className="btn btn-small btn-outline"
                        onClick={() => { setCurrentMealSlot(slot.key); setShowMealPicker(true); }}
                      >
                        + Saved
                      </button>
                      <button 
                        className="btn btn-small btn-primary"
                        onClick={() => { setCurrentMealSlot(slot.key); setShowFoodPicker(true); }}
                      >
                        + Food
                      </button>
                    </div>
                  </div>
                  
                  {items.length > 0 && (
                    <div className="meal-slot-items">
                      {items.map((item, idx) => (
                        <div key={item.id} className="meal-item">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={e => updateItemQuantity(slot.key, idx, e.target.value)}
                            className="quantity-input"
                            step="0.25"
                            min="0"
                          />
                          <span className="item-unit">{item.food.unit}</span>
                          <span className="item-name">{item.food.name}</span>
                          <span className="item-calories">{calculateItemMacros(item).calories} cal</span>
                          <button className="remove-btn" onClick={() => removeItem(slot.key, idx)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
      
      {/* Food Picker Modal */}
      {showFoodPicker && (
        <div className="modal-overlay" onClick={() => setShowFoodPicker(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Food</h2>
              <button className="close-btn" onClick={() => setShowFoodPicker(false)}>×</button>
            </div>
            <div className="modal-search">
              <input
                type="text"
                placeholder="Search foods..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
              />
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                {FOOD_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="modal-list">
              {filteredFoods.map(food => (
                <div
                  key={food.id}
                  className="food-picker-item"
                  onClick={() => addFoodToMeal(food, 1)}
                >
                  <div className="food-picker-info">
                    <span className="food-picker-name">{food.name}</span>
                    <span className="food-picker-unit">per {food.unit}</span>
                  </div>
                  <span className="food-picker-macros">
                    {food.calories} cal | {food.protein}P | {food.carbs}C | {food.fat}F
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Saved Meal Picker Modal */}
      {showMealPicker && (
        <div className="modal-overlay" onClick={() => setShowMealPicker(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Saved Meal</h2>
              <button className="close-btn" onClick={() => setShowMealPicker(false)}>×</button>
            </div>
            <div className="modal-list">
              {mealTemplates.map(meal => {
                const macros = calculateMealMacros(meal.items);
                return (
                  <div
                    key={meal.id}
                    className="meal-picker-item"
                    onClick={() => addSavedMealToSlot(meal)}
                  >
                    <div className="meal-picker-info">
                      <span className="meal-picker-name">{meal.name}</span>
                      <span className="meal-picker-desc">{meal.items.length} items</span>
                    </div>
                    <span className="meal-picker-macros">
                      {macros.calories} cal | {Math.round(macros.protein)}P
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// SAVED MEALS PAGE
// ============================================
const SavedMeals = () => {
  const mealTemplates = getAllMealTemplates();
  
  return (
    <div className="page">
      <h1 className="page-title">Saved Meal Templates</h1>
      <p className="page-subtitle">Pre-built meals you can quickly add to any plan</p>
      
      <div className="meals-grid">
        {mealTemplates.map(meal => {
          const macros = calculateMealMacros(meal.items);
          return (
            <div key={meal.id} className="meal-card">
              <h3>{meal.name}</h3>
              <p className="meal-description">{meal.description}</p>
              <div className="meal-items">
                {meal.items.map((item, idx) => (
                  <div key={idx} className="meal-item-preview">
                    • {item.quantity} {item.food?.unit} {item.food?.name}
                  </div>
                ))}
              </div>
              <div className="meal-card-macros">
                <span>{macros.calories} cal</span>
                <span>{Math.round(macros.protein)}g P</span>
                <span>{Math.round(macros.carbs)}g C</span>
                <span>{Math.round(macros.fat)}g F</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// FOOD DATABASE PAGE
// ============================================
const FoodDatabase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const filteredFoods = searchFoods(searchTerm, selectedCategory);
  
  return (
    <div className="page">
      <h1 className="page-title">Food Database</h1>
      <p className="page-subtitle">USDA-verified nutrition data for {ALL_FOODS.length} foods</p>
      
      <div className="search-filters">
        <input
          type="text"
          placeholder="Search foods..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select 
          value={selectedCategory} 
          onChange={e => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          {FOOD_CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      
      <div className="food-table">
        <div className="food-table-header">
          <span>Food</span>
          <span>Unit</span>
          <span>Cal</span>
          <span>P</span>
          <span>C</span>
          <span>F</span>
        </div>
        <div className="food-table-body">
          {filteredFoods.map((food, idx) => (
            <div key={food.id} className={`food-table-row ${idx % 2 === 0 ? 'even' : 'odd'}`}>
              <span className="food-name">{food.name}</span>
              <span className="food-unit">{food.unit}</span>
              <span>{food.calories}</span>
              <span>{food.protein}g</span>
              <span>{food.carbs}g</span>
              <span>{food.fat}g</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================
function App() {
  const [athletes, setAthletes] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  
  // Load data on mount
  useEffect(() => {
    setAthletes(localDB.getAthletes());
    setMealPlans(localDB.getMealPlans());
  }, []);
  
  // Helper functions
  const addAthlete = (athleteData) => {
    const newAthlete = localDB.addAthlete(athleteData);
    setAthletes(localDB.getAthletes());
    return newAthlete;
  };
  
  const updateAthlete = (id, updates) => {
    localDB.updateAthlete(id, updates);
    setAthletes(localDB.getAthletes());
  };
  
  const deleteAthlete = (id) => {
    localDB.deleteAthlete(id);
    setAthletes(localDB.getAthletes());
  };
  
  const addMealPlan = (planData) => {
    const newPlan = localDB.addMealPlan(planData);
    setMealPlans(localDB.getMealPlans());
    return newPlan;
  };
  
  const updateMealPlan = (id, updates) => {
    localDB.updateMealPlan(id, updates);
    setMealPlans(localDB.getMealPlans());
  };
  
  const deleteMealPlan = (id) => {
    localDB.deleteMealPlan(id);
    setMealPlans(localDB.getMealPlans());
  };
  
  const contextValue = {
    athletes,
    mealPlans,
    addAthlete,
    updateAthlete,
    deleteAthlete,
    addMealPlan,
    updateMealPlan,
    deleteMealPlan,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      <BrowserRouter>
        <div className="app">
          <Header />
          <main className="main">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/athletes" element={<AthletesList />} />
              <Route path="/athletes/new" element={<AthleteForm />} />
              <Route path="/athletes/:id" element={<AthleteDetail />} />
              <Route path="/athletes/:id/edit" element={<AthleteForm />} />
              <Route path="/builder" element={<PlanBuilder />} />
              <Route path="/meals" element={<SavedMeals />} />
              <Route path="/foods" element={<FoodDatabase />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
