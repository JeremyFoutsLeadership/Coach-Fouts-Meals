import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase directly in this file
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function IntakeAdmin() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    if (!supabase) {
      setError('Supabase not configured');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('intake_forms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      console.error('Error loading submissions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('intake_forms')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      await loadSubmissions();
      setSelectedSubmission(null);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status: ' + err.message);
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'new') return !s.status || s.status === 'new';
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
        ...styles[displayStatus] || styles.new
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
      <div style={{ minHeight: '100vh', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading submissions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ color: '#ef4444', fontSize: '18px' }}>Error: {error}</div>
        <button onClick={loadSubmissions} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1e293b', padding: '32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            📋 Intake Form Submissions
          </h1>
          <p style={{ color: '#94a3b8' }}>
            Manage athlete intake form submissions
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total', count: submissions.length, color: '#6366f1' },
            { label: 'New', count: submissions.filter(s => !s.status || s.status === 'new').length, color: '#22c55e' },
            { label: 'Contacted', count: submissions.filter(s => s.status === 'contacted').length, color: '#f59e0b' },
            { label: 'Converted', count: submissions.filter(s => s.status === 'converted').length, color: '#3b82f6' }
          ].map(stat => (
            <div key={stat.label} style={{ background: '#334155', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: stat.color }}>{stat.count}</div>
              <div style={{ color: '#94a3b8', fontSize: '14px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
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
                background: filter === status ? '#3b82f6' : '#334155',
                color: filter === status ? 'white' : '#94a3b8'
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
          <button
            onClick={loadSubmissions}
            style={{
              marginLeft: 'auto',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              background: '#334155',
              color: '#94a3b8'
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div style={{ background: '#334155', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <div style={{ color: '#94a3b8', fontSize: '18px' }}>No submissions found</div>
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
                  border: '2px solid transparent'
                }}
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
                      <span>🏀 {submission.sport || 'N/A'}</span>
                      <span>📧 {submission.email}</span>
                      <span>⚖️ {submission.current_weight || '?'} lbs → {submission.goal_weight || '?'} lbs</span>
                      <span>🎯 {submission.primary_goal || 'N/A'}</span>
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

        {/* Detail Modal */}
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
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
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

              {/* Contact Info */}
              <div style={{ background: '#334155', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <h3 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px' }}>Contact Info</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', color: 'white' }}>
                  <div><strong>Email:</strong> {selectedSubmission.email}</div>
                  <div><strong>Phone:</strong> {selectedSubmission.phone || 'N/A'}</div>
                  <div><strong>Parent:</strong> {selectedSubmission.parent_name || 'N/A'}</div>
                </div>
              </div>

              {/* Physical Stats */}
              <div style={{ background: '#334155', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <h3 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px' }}>Physical Stats</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', color: 'white' }}>
                  <div><strong>Age:</strong> {selectedSubmission.age}</div>
                  <div><strong>Sport:</strong> {selectedSubmission.sport}</div>
                  <div><strong>Position:</strong> {selectedSubmission.position || 'N/A'}</div>
                  <div><strong>Current Weight:</strong> {selectedSubmission.current_weight} lbs</div>
                  <div><strong>Goal Weight:</strong> {selectedSubmission.goal_weight || 'N/A'} lbs</div>
                  <div><strong>Height:</strong> {selectedSubmission.height_feet}'{selectedSubmission.height_inches}"</div>
                  <div><strong>Primary Goal:</strong> {selectedSubmission.primary_goal}</div>
                  <div><strong>Timeline:</strong> {selectedSubmission.timeline || 'N/A'}</div>
                </div>
              </div>

              {/* Food Preferences */}
              <div style={{ background: '#334155', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <h3 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px' }}>Food Preferences</h3>
                <div style={{ color: 'white', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div><strong>Proteins:</strong> {selectedSubmission.proteins_liked?.join(', ') || 'None selected'}</div>
                  <div><strong>Carbs:</strong> {selectedSubmission.carbs_liked?.join(', ') || 'None selected'}</div>
                  <div><strong>Fruits:</strong> {selectedSubmission.fruits_liked?.join(', ') || 'None selected'}</div>
                  <div><strong>Vegetables:</strong> {selectedSubmission.vegetables_liked?.join(', ') || 'None selected'}</div>
                  <div><strong>Won't Eat:</strong> {selectedSubmission.foods_to_avoid || 'None specified'}</div>
                </div>
              </div>

              {/* Restrictions */}
              <div style={{ background: '#334155', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <h3 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px' }}>Allergies & Restrictions</h3>
                <div style={{ color: 'white', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div><strong>Allergies:</strong> {selectedSubmission.allergies?.join(', ') || 'None'}</div>
                  <div><strong>Dietary Restrictions:</strong> {selectedSubmission.dietary_restrictions?.join(', ') || 'None'}</div>
                </div>
              </div>

              {/* Logistics */}
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

              {/* Notes */}
              {selectedSubmission.notes && (
                <div style={{ background: '#334155', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                  <h3 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px' }}>Additional Notes</h3>
                  <div style={{ color: 'white' }}>{selectedSubmission.notes}</div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {(!selectedSubmission.status || selectedSubmission.status === 'new') && (
                  <button
                    onClick={() => updateStatus(selectedSubmission.id, 'contacted')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      background: '#f59e0b',
                      color: 'white'
                    }}
                  >
                    ✓ Mark as Contacted
                  </button>
                )}
                {selectedSubmission.status !== 'converted' && (
                  <button
                    onClick={() => updateStatus(selectedSubmission.id, 'converted')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      background: '#22c55e',
                      color: 'white'
                    }}
                  >
                    🎉 Mark as Converted
                  </button>
                )}
                <button
                  onClick={() => setSelectedSubmission(null)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    background: '#475569',
                    color: 'white'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <a href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>
            ← Back to Meal Plan Builder
          </a>
        </div>
      </div>
    </div>
  );
}
