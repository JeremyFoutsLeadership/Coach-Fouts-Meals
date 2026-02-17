import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useParams } from 'react-router-dom';
import { localDB } from './lib/database';
import { FOOD_DATABASE, ALL_FOODS, getFoodById, searchFoods, FOOD_CATEGORIES } from './data/foods';
import { DEFAULT_MEAL_TEMPLATES, getAllMealTemplates } from './data/mealTemplates';
import { 
  calculateTargets, 
  calculateItemMacros, 
  calculateMealMacros, 
  calculateDayMacros,
  calculateTargetPercentage,
  getMacroStatus,
  formatHeight,
  parseHeightToInches,
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS 
} from './lib/calculations';
import { downloadMealPlanPDF } from './lib/pdfGenerator';
import { 
  getIntakeForms, 
  getIntakeFormsCounts, 
  updateIntakeFormStatus, 
  deleteIntakeForm,
  getSwapRequests,
  getSwapRequestsCounts,
  updateSwapRequestStatus,
  deleteSwapRequest
} from './lib/supabase';
import IntakeForm from './pages/IntakeForm';
import SwapForm from './pages/SwapForm';
import './App.css';

// Create context for global state
const AppContext = createContext();

const useApp = () => useContext(AppContext);

// ============================================
// HEADER COMPONENT
// ============================================
const Header = ({ intakeCount, swapCount }) => {
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
          <NavLink to="/intakes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Intakes
            {intakeCount > 0 && (
              <span style={{
                marginLeft: '6px',
                background: '#22c55e',
                color: 'white',
                borderRadius: '10px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {intakeCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/swaps-admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Swaps
            {swapCount > 0 && (
              <span style={{
                marginLeft: '6px',
                background: '#f59e0b',
                color: 'white',
                borderRadius: '10px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {swapCount}
              </span>
            )}
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
const Dashboard = ({ intakeCounts, swapCounts }) => {
  const { athletes, mealPlans } = useApp();
  const navigate = useNavigate();
  
  const recentAthletes = athletes.slice(0, 5);
  
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
        <div 
          className="stat-card" 
          onClick={() => navigate('/intakes')}
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div className="stat-number" style={{ color: intakeCounts.new > 0 ? '#22c55e' : undefined }}>
            {intakeCounts.new}
          </div>
          <div className="stat-label">New Intakes</div>
          {intakeCounts.new > 0 && (
            <div style={{ fontSize: '11px', color: '#22c55e', marginTop: '4px' }}>
              Click to view →
            </div>
          )}
        </div>
        <div 
          className="stat-card" 
          onClick={() => navigate('/swaps-admin')}
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div className="stat-number" style={{ color: swapCounts.new > 0 ? '#f59e0b' : undefined }}>
            {swapCounts.new}
          </div>
          <div className="stat-label">Swap Requests</div>
          {swapCounts.new > 0 && (
            <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px' }}>
              Click to view →
            </div>
          )}
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
            <NavLink to="/intakes" className="quick-action-btn">
              <span className="quick-action-icon">📋</span>
              <span>View Intakes</span>
            </NavLink>
            <NavLink to="/swaps-admin" className="quick-action-btn">
              <span className="quick-action-icon">🔄</span>
              <span>View Swaps</span>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// INTAKES PAGE
// ============================================
const IntakesPage = ({ onRefreshCounts }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await getIntakeForms();
      setSubmissions(data || []);
      if (onRefreshCounts) onRefreshCounts();
    } catch (err) {
      console.error('Error loading submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsContacted = async (id) => {
    try {
      await updateIntakeFormStatus(id, 'contacted');
      await loadSubmissions();
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(prev => ({ ...prev, status: 'contacted' }));
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status');
    }
  };

  const markAsConverted = async (id) => {
    try {
      await updateIntakeFormStatus(id, 'converted');
      await loadSubmissions();
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(prev => ({ ...prev, status: 'converted' }));
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;
    try {
      await deleteIntakeForm(id);
      await loadSubmissions();
      setSelectedSubmission(null);
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Error deleting submission');
    }
  };

  const getActivityLabel = (level) => {
    const labels = {
      'sedentary': 'Sedentary (little/no exercise)',
      'light': 'Lightly Active (1-3 days/week)',
      'moderate': 'Moderately Active (3-5 days/week)',
      'very_active': 'Very Active (6-7 days/week)',
      'extra_active': 'Extra Active (very hard exercise + physical job)'
    };
    return labels[level] || level || 'Not specified';
  };

  const generateClaudeText = (s) => {
    const heightStr = s.height_feet && s.height_inches !== null 
      ? `${s.height_feet}'${s.height_inches}"` 
      : 'Not provided';
    
    return `ATHLETE INTAKE FORM - ${s.athlete_name}

=== BASIC INFO ===
Name: ${s.athlete_name}
Parent/Guardian: ${s.parent_name || 'N/A'}
Email: ${s.email}
Phone: ${s.phone || 'N/A'}
Age: ${s.age}
Gender: ${s.gender || 'Not specified'}
Sport: ${s.sport}
Position: ${s.position || 'N/A'}

=== PHYSICAL STATS ===
Current Weight: ${s.current_weight} lbs
Goal Weight: ${s.goal_weight || 'Not specified'} lbs
Height: ${heightStr}
Activity Level: ${getActivityLabel(s.activity_level)}
Primary Goal: ${s.primary_goal}
Timeline: ${s.timeline || 'Not specified'}

=== CALCULATED TARGETS ===
BMR (Basal Metabolic Rate): ${s.bmr ? s.bmr.toLocaleString() + ' kcal/day' : 'Not calculated'}
TDEE (Total Daily Energy Expenditure): ${s.tdee ? s.tdee.toLocaleString() + ' kcal/day' : 'Not calculated'}

=== FOOD PREFERENCES ===
Proteins Liked: ${s.proteins_liked?.join(', ') || 'None selected'}
Carbs Liked: ${s.carbs_liked?.join(', ') || 'None selected'}
Fruits Liked: ${s.fruits_liked?.join(', ') || 'None selected'}
Vegetables Liked: ${s.vegetables_liked?.join(', ') || 'None selected'}
Foods to AVOID: ${s.foods_to_avoid || 'None specified'}

=== ALLERGIES & RESTRICTIONS ===
Allergies: ${s.allergies?.join(', ') || 'None'}
Dietary Restrictions: ${s.dietary_restrictions?.join(', ') || 'None'}

=== MEAL LOGISTICS ===
Meals Per Day: ${s.meals_per_day}
Meal Prep Help: ${s.meal_prep_help}
Microwave at School: ${s.has_microwave_at_school ? 'Yes' : 'No'}
Cooks Own Meals: ${s.cooks_own_meals ? 'Yes' : 'No'}
Grocery Budget: ${s.grocery_budget || 'Not specified'}

=== SUPPLEMENTS ===
Current Supplements: ${s.current_supplements || 'None'}

=== ADDITIONAL NOTES ===
${s.notes || 'None'}

---
Please create a personalized 7-day meal plan for this athlete with:
- Welcome Letter
- 7-Day Meal Plan with exact macros
- Grocery List
- CorVive supplement protocol (AM Hydrate + Creatine, Training Hydrate, Evening Protein+Collagen shake)`;
  };

  const copyForClaude = async (submission) => {
    const text = generateClaudeText(submission);
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'new') return s.status === 'new' || !s.status;
    return s.status === filter;
  });

  const getStatusBadge = (status) => {
    const styles = {
      new: { background: '#dcfce7', color: '#166534' },
      contacted: { background: '#fef3c7', color: '#92400e' },
      converted: { background: '#dbeafe', color: '#1e40af' }
    };
    const displayStatus = status || 'new';
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        ...styles[displayStatus]
      }}>
        {displayStatus}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="page">
        <h1 className="page-title">Intake Submissions</h1>
        <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
          Loading submissions...
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Intake Submissions</h1>
        <button className="btn btn-secondary" onClick={loadSubmissions}>
          🔄 Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total', count: submissions.length, color: '#6366f1' },
          { label: 'New', count: submissions.filter(s => s.status === 'new' || !s.status).length, color: '#22c55e' },
          { label: 'Contacted', count: submissions.filter(s => s.status === 'contacted').length, color: '#f59e0b' },
          { label: 'Converted', count: submissions.filter(s => s.status === 'converted').length, color: '#3b82f6' }
        ].map(stat => (
          <div key={stat.label} style={{ background: '#334155', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: stat.color }}>{stat.count}</div>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['all', 'new', 'contacted', 'converted'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              background: filter === status ? '#22c55e' : '#334155',
              color: filter === status ? 'white' : '#94a3b8'
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredSubmissions.length === 0 ? (
        <div style={{ background: '#334155', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <div style={{ color: '#94a3b8', fontSize: '18px' }}>No submissions found</div>
          <p style={{ color: '#64748b', marginTop: '8px' }}>
            Share your intake form: <a href="/intake" style={{ color: '#22c55e' }}>coach-fouts-meals.vercel.app/intake</a>
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredSubmissions.map(submission => (
            <div
              key={submission.id}
              onClick={() => setSelectedSubmission(submission)}
              style={{
                background: '#334155',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#22c55e'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>
                      {submission.athlete_name}
                    </span>
                    {getStatusBadge(submission.status)}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '14px', flexWrap: 'wrap' }}>
                    <span>🏀 {submission.sport}</span>
                    <span>📧 {submission.email}</span>
                    <span>⚖️ {submission.current_weight} lbs → {submission.goal_weight || '?'} lbs</span>
                    <span>🎯 {submission.primary_goal}</span>
                  </div>
                </div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>
                  {formatDate(submission.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSubmission && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }}
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            style={{
              background: '#1e293b',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                  {selectedSubmission.athlete_name}
                </h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {getStatusBadge(selectedSubmission.status)}
                  <span style={{ color: '#64748b', fontSize: '13px' }}>
                    Submitted {formatDate(selectedSubmission.created_at)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <button
              onClick={() => copyForClaude(selectedSubmission)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                background: copySuccess ? '#22c55e' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                marginBottom: '24px',
                transition: 'all 0.2s'
              }}
            >
              {copySuccess ? '✓ Copied to Clipboard!' : '📋 Copy for Claude - Generate Meal Plan'}
            </button>

            <div style={{ background: '#334155', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px' }}>Contact Info</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', color: 'white' }}>
                <div><strong>Email:</strong> {selectedSubmission.email}</div>
                <div><strong>Phone:</strong> {selectedSubmission.phone || 'N/A'}</div>
                <div><strong>Parent:</strong> {selectedSubmission.parent_name || 'N/A'}</div>
              </div>
            </div>

            <div style={{ background: '#334155', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px' }}>Physical Stats</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', color: 'white' }}>
                <div><strong>Age:</strong> {selectedSubmission.age}</div>
                <div><strong>Gender:</strong> {selectedSubmission.gender || 'N/A'}</div>
                <div><strong>Sport:</strong> {selectedSubmission.sport}</div>
                <div><strong>Position:</strong> {selectedSubmission.position || 'N/A'}</div>
                <div><strong>Current Weight:</strong> {selectedSubmission.current_weight} lbs</div>
                <div><strong>Goal Weight:</strong> {selectedSubmission.goal_weight || 'N/A'} lbs</div>
                <div><strong>Height:</strong> {selectedSubmission.height_feet}'{selectedSubmission.height_inches}"</div>
                <div><strong>Activity Level:</strong> {selectedSubmission.activity_level || 'N/A'}</div>
                <div><strong>Primary Goal:</strong> {selectedSubmission.primary_goal}</div>
                <div><strong>Timeline:</strong> {selectedSubmission.timeline || 'N/A'}</div>
              </div>
            </div>

            {/* BMR/TDEE Section */}
            {(selectedSubmission.bmr || selectedSubmission.tdee) && (
              <div style={{ background: 'linear-gradient(135deg, #065f46, #059669)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <h3 style={{ color: '#a7f3d0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px' }}>📈 Calculated Metabolic Stats</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ color: '#a7f3d0', fontSize: '12px', marginBottom: '4px' }}>BMR (Base Metabolic Rate)</div>
                    <div style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>{selectedSubmission.bmr?.toLocaleString() || '—'}</div>
                    <div style={{ color: '#6ee7b7', fontSize: '11px' }}>kcal/day at rest</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ color: '#a7f3d0', fontSize: '12px', marginBottom: '4px' }}>TDEE (Total Daily Energy)</div>
                    <div style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>{selectedSubmission.tdee?.toLocaleString() || '—'}</div>
                    <div style={{ color: '#6ee7b7', fontSize: '11px' }}>kcal/day with activity</div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ background: '#334155', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px' }}>Food Preferences</h3>
              <div style={{ color: 'white', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><strong>Proteins:</strong> {selectedSubmission.proteins_liked?.join(', ') || 'None selected'}</div>
                <div><strong>Carbs:</strong> {selectedSubmission.carbs_liked?.join(', ') || 'None selected'}</div>
                <div><strong>Fruits:</strong> {selectedSubmission.fruits_liked?.join(', ') || 'None selected'}</div>
                <div><strong>Vegetables:</strong> {selectedSubmission.vegetables_liked?.join(', ') || 'None selected'}</div>
                <div style={{ color: '#f87171' }}><strong>Won't Eat:</strong> {selectedSubmission.foods_to_avoid || 'None specified'}</div>
              </div>
            </div>

            <div style={{ background: '#334155', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px' }}>Allergies & Restrictions</h3>
              <div style={{ color: 'white', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><strong>Allergies:</strong> {selectedSubmission.allergies?.join(', ') || 'None'}</div>
                <div><strong>Dietary Restrictions:</strong> {selectedSubmission.dietary_restrictions?.join(', ') || 'None'}</div>
              </div>
            </div>

            <div style={{ background: '#334155', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px' }}>Meal Logistics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', color: 'white' }}>
                <div><strong>Meals/Day:</strong> {selectedSubmission.meals_per_day}</div>
                <div><strong>Meal Prep Help:</strong> {selectedSubmission.meal_prep_help}</div>
                <div><strong>Microwave at School:</strong> {selectedSubmission.has_microwave_at_school ? 'Yes' : 'No'}</div>
                <div><strong>Cooks Own Meals:</strong> {selectedSubmission.cooks_own_meals ? 'Yes' : 'No'}</div>
                <div><strong>Budget:</strong> {selectedSubmission.grocery_budget || 'N/A'}</div>
                <div><strong>Supplements:</strong> {selectedSubmission.current_supplements || 'None'}</div>
              </div>
            </div>

            {selectedSubmission.notes && (
              <div style={{ background: '#334155', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <h3 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px' }}>Additional Notes</h3>
                <div style={{ color: 'white' }}>{selectedSubmission.notes}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {selectedSubmission.status !== 'contacted' && selectedSubmission.status !== 'converted' && (
                <button
                  onClick={() => markAsContacted(selectedSubmission.id)}
                  style={{ flex: 1, minWidth: '150px', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', background: '#f59e0b', color: 'white' }}
                >
                  ✓ Mark as Contacted
                </button>
              )}
              {selectedSubmission.status !== 'converted' && (
                <button
                  onClick={() => markAsConverted(selectedSubmission.id)}
                  style={{ flex: 1, minWidth: '150px', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', background: '#22c55e', color: 'white' }}
                >
                  🎉 Mark as Converted
                </button>
              )}
              <button
                onClick={() => handleDelete(selectedSubmission.id)}
                style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', background: '#dc2626', color: 'white' }}
              >
                🗑️ Delete
              </button>
              <button
                onClick={() => setSelectedSubmission(null)}
                style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', background: '#475569', color: 'white' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// SWAPS PAGE
// ============================================
const SwapsPage = ({ onRefreshCounts }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getSwapRequests();
      setRequests(data || []);
      if (onRefreshCounts) onRefreshCounts();
    } catch (err) {
      console.error('Error loading swap requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (id) => {
    try {
      await updateSwapRequestStatus(id, 'completed');
      await loadRequests();
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => ({ ...prev, status: 'completed' }));
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this swap request?')) return;
    try {
      await deleteSwapRequest(id);
      await loadRequests();
      setSelectedRequest(null);
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Error deleting request');
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'new') return r.status === 'new' || !r.status;
    return r.status === filter;
  });

  const getStatusBadge = (status) => {
    const styles = {
      new: { background: '#fef3c7', color: '#92400e' },
      completed: { background: '#dcfce7', color: '#166534' }
    };
    const displayStatus = status || 'new';
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        ...styles[displayStatus]
      }}>
        {displayStatus}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const MEAL_SLOTS = [
    { key: 'preworkout', label: 'Pre-Workout Breakfast' },
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'am_snack', label: 'AM Snack' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'pm_snack', label: 'PM Snack' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'evening', label: 'Evening Shake' },
  ];

  const countSwaps = (request) => {
    return MEAL_SLOTS.filter(slot => 
      request[`${slot.key}_swap_out`] || request[`${slot.key}_replace_with`]
    ).length;
  };

  if (loading) {
    return (
      <div className="page">
        <h1 className="page-title">Swap Requests</h1>
        <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
          Loading swap requests...
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Swap Requests</h1>
        <button className="btn btn-secondary" onClick={loadRequests}>
          🔄 Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total', count: requests.length, color: '#6366f1' },
          { label: 'New', count: requests.filter(r => r.status === 'new' || !r.status).length, color: '#f59e0b' },
          { label: 'Completed', count: requests.filter(r => r.status === 'completed').length, color: '#22c55e' }
        ].map(stat => (
          <div key={stat.label} style={{ background: '#334155', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: stat.color }}>{stat.count}</div>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['all', 'new', 'completed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              background: filter === status ? '#f59e0b' : '#334155',
              color: filter === status ? 'white' : '#94a3b8'
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <div style={{ background: '#334155', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
          <div style={{ color: '#94a3b8', fontSize: '18px' }}>No swap requests found</div>
          <p style={{ color: '#64748b', marginTop: '8px' }}>
            Share the swap form: <a href="/swaps" style={{ color: '#f59e0b' }}>coach-fouts-meals.vercel.app/swaps</a>
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredRequests.map(request => (
            <div
              key={request.id}
              onClick={() => setSelectedRequest(request)}
              style={{
                background: '#334155',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f59e0b'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>
                      {request.athlete_name}
                    </span>
                    {getStatusBadge(request.status)}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '14px' }}>
                    <span>📧 {request.athlete_email}</span>
                    <span>🔄 {countSwaps(request)} swap(s) requested</span>
                  </div>
                </div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>
                  {formatDate(request.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRequest && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }}
          onClick={() => setSelectedRequest(null)}
        >
          <div
            style={{
              background: '#1e293b',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                  {selectedRequest.athlete_name}
                </h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {getStatusBadge(selectedRequest.status)}
                  <span style={{ color: '#64748b', fontSize: '13px' }}>
                    Submitted {formatDate(selectedRequest.created_at)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ background: '#334155', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px' }}>Contact</h3>
              <div style={{ color: 'white' }}>
                <strong>Email:</strong> {selectedRequest.athlete_email}
              </div>
            </div>

            <div style={{ background: '#334155', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px' }}>Swap Requests</h3>
              {MEAL_SLOTS.map(slot => {
                const swapOut = selectedRequest[`${slot.key}_swap_out`];
                const replaceWith = selectedRequest[`${slot.key}_replace_with`];
                if (!swapOut && !replaceWith) return null;
                return (
                  <div key={slot.key} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #475569' }}>
                    <div style={{ color: '#f59e0b', fontWeight: '600', marginBottom: '8px' }}>{slot.label}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '4px' }}>SWAP OUT:</div>
                        <div style={{ color: 'white' }}>{swapOut || '—'}</div>
                      </div>
                      <div>
                        <div style={{ color: '#22c55e', fontSize: '12px', marginBottom: '4px' }}>REPLACE WITH:</div>
                        <div style={{ color: 'white' }}>{replaceWith || '—'}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedRequest.notes && (
              <div style={{ background: '#334155', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <h3 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px' }}>Notes</h3>
                <div style={{ color: 'white' }}>{selectedRequest.notes}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              {(selectedRequest.status === 'new' || !selectedRequest.status) && (
                <button
                  onClick={() => markAsCompleted(selectedRequest.id)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', background: '#22c55e', color: 'white' }}
                >
                  ✓ Mark as Completed
                </button>
              )}
              <button
                onClick={() => handleDelete(selectedRequest.id)}
                style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', background: '#dc2626', color: 'white' }}
              >
                🗑️ Delete
              </button>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', background: '#475569', color: 'white' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Sport *</label>
            <input type="text" value={form.sport} onChange={e => setForm({ ...form, sport: e.target.value })} required />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Age *</label>
            <input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} required />
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
            <input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} required />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Height *</label>
            <div className="height-inputs">
              <input type="number" value={form.heightFeet} onChange={e => setForm({ ...form, heightFeet: e.target.value })} required />
              <span>ft</span>
              <input type="number" value={form.heightInches} onChange={e => setForm({ ...form, heightInches: e.target.value })} />
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
          <textarea value={form.preferences} onChange={e => setForm({ ...form, preferences: e.target.value })} />
        </div>
        
        <div className="form-group">
          <label>Restrictions / Dislikes</label>
          <textarea value={form.restrictions} onChange={e => setForm({ ...form, restrictions: e.target.value })} />
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
          </div>
        )}
        
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/athletes')}>Cancel</button>
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
          <button className="btn btn-primary" onClick={() => navigate('/athletes')}>Back to Athletes</button>
        </div>
      </div>
    );
  }
  
  const handleDelete = () => {
    if (window.confirm(`Delete ${athlete.name}?`)) {
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
          <button className="btn btn-secondary" onClick={() => navigate(`/athletes/${id}/edit`)}>Edit</button>
          <button className="btn btn-primary" onClick={() => navigate(`/builder?athlete=${id}`)}>Build Plan</button>
        </div>
      </div>
      
      <div className="athlete-detail-grid">
        <div className="detail-card">
          <h3>Profile</h3>
          <div className="detail-list">
            <div className="detail-row"><span>Age</span><span>{athlete.age} years</span></div>
            <div className="detail-row"><span>Weight</span><span>{athlete.weight} lbs</span></div>
            <div className="detail-row"><span>Height</span><span>{formatHeight(athlete.height)}</span></div>
            <div className="detail-row"><span>Activity</span><span>{ACTIVITY_MULTIPLIERS[athlete.activityLevel]?.label}</span></div>
            <div className="detail-row"><span>Goal</span><span>{GOAL_ADJUSTMENTS[athlete.goal]?.label}</span></div>
          </div>
        </div>
        
        <div className="detail-card">
          <h3>Daily Targets</h3>
          <div className="targets-grid">
            <div className="target-box"><span className="target-value">{athlete.targets?.calories}</span><span className="target-label">Calories</span></div>
            <div className="target-box"><span className="target-value">{athlete.targets?.protein}g</span><span className="target-label">Protein</span></div>
            <div className="target-box"><span className="target-value">{athlete.targets?.carbs}g</span><span className="target-label">Carbs</span></div>
            <div className="target-box"><span className="target-value">{athlete.targets?.fat}g</span><span className="target-label">Fat</span></div>
          </div>
        </div>
      </div>
      
      <div className="danger-zone">
        <button className="btn btn-danger" onClick={handleDelete}>Delete Athlete</button>
      </div>
    </div>
  );
};

// ============================================
// PLAN BUILDER PAGE (simplified for space)
// ============================================
const PlanBuilder = () => {
  const { athletes, mealPlans, addMealPlan, updateMealPlan } = useApp();
  const navigate = useNavigate();
  
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
  
  const emptyDay = { breakfast: [], snack1: [], lunch: [], snack2: [], dinner: [], evening: [] };
  
  const [plan, setPlan] = useState({
    athlete_id: athleteIdParam || '',
    targets: selectedAthlete?.targets || { calories: 3500, protein: 200, carbs: 400, fat: 120 },
    days: Array(7).fill(null).map(() => JSON.parse(JSON.stringify(emptyDay))),
  });
  
  useEffect(() => {
    if (planIdParam) {
      const existingPlan = mealPlans.find(p => p.id === planIdParam);
      if (existingPlan) {
        setPlan(existingPlan);
        setSelectedAthleteId(existingPlan.athlete_id);
      }
    }
  }, [planIdParam, mealPlans]);
  
  useEffect(() => {
    if (selectedAthlete) {
      setPlan(prev => ({ ...prev, athlete_id: selectedAthlete.id, targets: selectedAthlete.targets }));
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
    newPlan.days[selectedDay][currentMealSlot].push({ id: Date.now().toString(), foodId: food.id, food: food, quantity: quantity });
    setPlan(newPlan);
    setShowFoodPicker(false);
  };
  
  const addSavedMealToSlot = (savedMeal) => {
    if (currentMealSlot === null) return;
    const newPlan = { ...plan };
    savedMeal.items.forEach(item => {
      const food = getFoodById(item.foodId);
      newPlan.days[selectedDay][currentMealSlot].push({ id: Date.now().toString() + Math.random(), foodId: item.foodId, food: food, quantity: item.quantity });
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
    if (planIdParam) { updateMealPlan(planIdParam, plan); } else { addMealPlan(plan); }
    alert('Plan saved!');
  };
  
  const exportPDF = () => {
    if (!selectedAthlete) { alert('Please select an athlete first'); return; }
    downloadMealPlanPDF(selectedAthlete, plan);
  };
  
  const filteredFoods = searchFoods(searchTerm, selectedCategory);
  const mealTemplates = getAllMealTemplates();
  
  return (
    <div className="page builder-page">
      <div className="page-header">
        <h1 className="page-title">Meal Plan Builder</h1>
        <div className="header-actions">
          <select value={selectedAthleteId} onChange={e => setSelectedAthleteId(e.target.value)} className="athlete-select">
            <option value="">Select Athlete...</option>
            {athletes.map(a => (<option key={a.id} value={a.id}>{a.name} ({a.sport})</option>))}
          </select>
          <button className="btn btn-secondary" onClick={savePlan}>Save Plan</button>
          <button className="btn btn-primary" onClick={exportPDF}>Export PDF</button>
        </div>
      </div>
      
      {!selectedAthlete ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Select an athlete to start building</h3>
          <button className="btn btn-primary" onClick={() => navigate('/athletes/new')}>Add New Athlete</button>
        </div>
      ) : (
        <>
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
                      <span className={`macro-bar-values ${status}`}>{macro.actual}{macro.unit} / {macro.target}{macro.unit}</span>
                    </div>
                    <div className="macro-bar-track">
                      <div className={`macro-bar-fill ${status}`} style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: macro.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="day-selector">
            {dayNames.map((day, idx) => {
              const dayMacros = calculateDayMacros(plan.days[idx]);
              const hasContent = dayMacros.calories > 0;
              return (
                <button key={idx} onClick={() => setSelectedDay(idx)} className={`day-btn ${selectedDay === idx ? 'active' : ''}`}>
                  <span>{day}</span>
                  {hasContent && <small>{dayMacros.calories} cal</small>}
                </button>
              );
            })}
            <button className="day-btn copy-btn" onClick={copyDayToAll}>Copy to All</button>
          </div>
          
          <div className="meal-slots">
            {mealSlots.map(slot => {
              const items = plan.days[selectedDay][slot.key];
              const mealMacros = calculateMealMacros(items);
              return (
                <div key={slot.key} className="meal-slot">
                  <div className="meal-slot-header">
                    <span className="meal-slot-name">{slot.label}</span>
                    <div className="meal-slot-actions">
                      {items.length > 0 && <span className="meal-slot-macros">{mealMacros.calories} cal | {Math.round(mealMacros.protein)}P</span>}
                      <button className="btn btn-small btn-outline" onClick={() => { setCurrentMealSlot(slot.key); setShowMealPicker(true); }}>+ Saved</button>
                      <button className="btn btn-small btn-primary" onClick={() => { setCurrentMealSlot(slot.key); setShowFoodPicker(true); }}>+ Food</button>
                    </div>
                  </div>
                  {items.length > 0 && (
                    <div className="meal-slot-items">
                      {items.map((item, idx) => (
                        <div key={item.id} className="meal-item">
                          <input type="number" value={item.quantity} onChange={e => updateItemQuantity(slot.key, idx, e.target.value)} className="quantity-input" step="0.25" min="0" />
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
      
      {showFoodPicker && (
        <div className="modal-overlay" onClick={() => setShowFoodPicker(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Food</h2>
              <button className="close-btn" onClick={() => setShowFoodPicker(false)}>×</button>
            </div>
            <div className="modal-search">
              <input type="text" placeholder="Search foods..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} autoFocus />
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                {FOOD_CATEGORIES.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </div>
            <div className="modal-list">
              {filteredFoods.map(food => (
                <div key={food.id} className="food-picker-item" onClick={() => addFoodToMeal(food, 1)}>
                  <div className="food-picker-info">
                    <span className="food-picker-name">{food.name}</span>
                    <span className="food-picker-unit">per {food.unit}</span>
                  </div>
                  <span className="food-picker-macros">{food.calories} cal | {food.protein}P | {food.carbs}C | {food.fat}F</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
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
                  <div key={meal.id} className="meal-picker-item" onClick={() => addSavedMealToSlot(meal)}>
                    <div className="meal-picker-info">
                      <span className="meal-picker-name">{meal.name}</span>
                      <span className="meal-picker-desc">{meal.items.length} items</span>
                    </div>
                    <span className="meal-picker-macros">{macros.calories} cal | {Math.round(macros.protein)}P</span>
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
      <div className="meals-grid">
        {mealTemplates.map(meal => {
          const macros = calculateMealMacros(meal.items);
          return (
            <div key={meal.id} className="meal-card">
              <h3>{meal.name}</h3>
              <p className="meal-description">{meal.description}</p>
              <div className="meal-card-macros">
                <span>{macros.calories} cal</span>
                <span>{Math.round(macros.protein)}g P</span>
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
        <input type="text" placeholder="Search foods..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="search-input" />
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="category-select">
          {FOOD_CATEGORIES.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
        </select>
      </div>
      
      <div className="food-table">
        <div className="food-table-header">
          <span>Food</span><span>Unit</span><span>Cal</span><span>P</span><span>C</span><span>F</span>
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
// ADMIN APP WRAPPER
// ============================================
const AdminApp = () => {
  const [athletes, setAthletes] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [intakeCounts, setIntakeCounts] = useState({ total: 0, new: 0, contacted: 0, converted: 0 });
  const [swapCounts, setSwapCounts] = useState({ total: 0, new: 0, completed: 0 });
  
  useEffect(() => {
    setAthletes(localDB.getAthletes());
    setMealPlans(localDB.getMealPlans());
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const intakes = await getIntakeFormsCounts();
      setIntakeCounts(intakes);
      const swaps = await getSwapRequestsCounts();
      setSwapCounts(swaps);
    } catch (err) {
      console.error('Error loading counts:', err);
    }
  };
  
  const addAthlete = (athleteData) => { const newAthlete = localDB.addAthlete(athleteData); setAthletes(localDB.getAthletes()); return newAthlete; };
  const updateAthlete = (id, updates) => { localDB.updateAthlete(id, updates); setAthletes(localDB.getAthletes()); };
  const deleteAthlete = (id) => { localDB.deleteAthlete(id); setAthletes(localDB.getAthletes()); };
  const addMealPlan = (planData) => { const newPlan = localDB.addMealPlan(planData); setMealPlans(localDB.getMealPlans()); return newPlan; };
  const updateMealPlan = (id, updates) => { localDB.updateMealPlan(id, updates); setMealPlans(localDB.getMealPlans()); };
  const deleteMealPlan = (id) => { localDB.deleteMealPlan(id); setMealPlans(localDB.getMealPlans()); };
  
  const contextValue = { athletes, mealPlans, addAthlete, updateAthlete, deleteAthlete, addMealPlan, updateMealPlan, deleteMealPlan };
  
  return (
    <AppContext.Provider value={contextValue}>
      <div className="app">
        <Header intakeCount={intakeCounts.new} swapCount={swapCounts.new} />
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard intakeCounts={intakeCounts} swapCounts={swapCounts} />} />
            <Route path="/athletes" element={<AthletesList />} />
            <Route path="/athletes/new" element={<AthleteForm />} />
            <Route path="/athletes/:id" element={<AthleteDetail />} />
            <Route path="/athletes/:id/edit" element={<AthleteForm />} />
            <Route path="/intakes" element={<IntakesPage onRefreshCounts={loadCounts} />} />
            <Route path="/swaps-admin" element={<SwapsPage onRefreshCounts={loadCounts} />} />
            <Route path="/builder" element={<PlanBuilder />} />
            <Route path="/meals" element={<SavedMeals />} />
            <Route path="/foods" element={<FoodDatabase />} />
          </Routes>
        </main>
      </div>
    </AppContext.Provider>
  );
};

// ============================================
// MAIN APP
// ============================================
function App() {
  if (window.location.pathname === '/intake') {
    return <IntakeForm />;
  }
  if (window.location.pathname === '/swaps') {
    return <SwapForm />;
  }
  return (
    <BrowserRouter>
      <AdminApp />
    </BrowserRouter>
  );
}

export default App;
