import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getTeam, saveTeam } from '../auth';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  addedOn: string;
}

export default function TeamPage() {
  const [team, setTeamList] = useState<TeamMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState(''); // Just for form visual

  useEffect(() => {
    setTeamList(getTeam());
  }, []);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: newName,
      email: newEmail,
      status: 'active',
      addedOn: new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
    };

    const updated = [...team, newMember];
    setTeamList(updated);
    saveTeam(updated);
    
    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
    setNewPassword('');
  };

  const handleRemoveMember = (id: string) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    const updated = team.filter(m => m.id !== id);
    setTeamList(updated);
    saveTeam(updated);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header__text">
          <h1>Team Management</h1>
          <p className="page-header__subtitle">Manage administrative access to the Calling App</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Member
          </button>
        </div>
      </div>

      <div className="page-card">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>STATUS</th>
                <th>ADDED ON</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {team.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">No team members found.</td>
                </tr>
              ) : (
                team.map(member => (
                  <tr key={member.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500 }}>{member.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{member.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-badge--${member.status === 'active' ? 'active' : 'suspended'}`}>
                        {member.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{member.addedOn}</td>
                    <td>
                      <button 
                        className="btn btn--ghost btn--sm" 
                        style={{ color: 'var(--destructive)', padding: '0.2rem 0.5rem', height: '32px' }}
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="dialog-overlay" onClick={() => setShowAddModal(false)}>
          <div className="dialog-panel" onClick={e => e.stopPropagation()}>
            <h3>Add Team Member</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Provision a new dashboard account and set their initial password.
            </p>
            
            <form onSubmit={handleAddMember}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={newEmail} 
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="jane@promptline.app"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Temporary Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter a secure password..."
                  required
                />
              </div>

              <div className="dialog-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
