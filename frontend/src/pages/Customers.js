import React, { useEffect, useState } from 'react';
import { customers as api } from '../api';
import { useToast } from '../context/ToastContext';

function CustomerModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await api.create(form);
      addToast('Customer created');
      onSaved();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Error creating customer', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">New Customer</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Jane Doe" />
            {errors.full_name && <span className="form-error">{errors.full_name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Add Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useToast();

  const load = () => api.list().then(r => setList(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const remove = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"? This may affect their orders.`)) return;
    try {
      await api.delete(id);
      addToast('Customer deleted');
      load();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Cannot delete customer', 'error');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-sub">{list.length} registered customers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Customer</button>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : list.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◉</div>
          <p>No customers yet. Add your first customer!</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.full_name}</strong></td>
                  <td><span style={{ color: 'var(--accent)', fontSize: '13px' }}>{c.email}</span></td>
                  <td><span className="mono">{c.phone || '—'}</span></td>
                  <td><span className="mono" style={{ fontSize: '12px' }}>{new Date(c.created_at).toLocaleDateString()}</span></td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(c.id, c.full_name)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <CustomerModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}
