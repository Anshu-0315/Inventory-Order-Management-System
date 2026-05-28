import React, { useEffect, useState } from 'react';
import { products as api } from '../api';
import { useToast } from '../context/ToastContext';

function ProductModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || { name: '', sku: '', price: '', quantity: '', description: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.sku.trim()) e.sku = 'Required';
    if (form.price === '' || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid price required';
    if (form.quantity === '' || isNaN(form.quantity) || Number(form.quantity) < 0) e.quantity = 'Non-negative integer required';
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), quantity: Number(form.quantity) };
      if (initial?.id) {
        await api.update(initial.id, payload);
        addToast('Product updated');
      } else {
        await api.create(payload);
        addToast('Product created');
      }
      onSaved();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Error saving product', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{initial?.id ? 'Edit Product' : 'New Product'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Laptop Pro X" />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">SKU *</label>
            <input className="form-input" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. LAP-001" />
            {errors.sku && <span className="form-error">{errors.sku}</span>}
          </div>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input className="form-input" type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
              {errors.price && <span className="form-error">{errors.price}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input className="form-input" type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
              {errors.quantity && <span className="form-error">{errors.quantity}</span>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | product
  const { addToast } = useToast();

  const load = () => api.list().then(r => setList(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const remove = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(id);
      addToast('Product deleted');
      load();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Cannot delete product', 'error');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-sub">{list.length} items in inventory</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>+ Add Product</button>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : list.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⬡</div>
          <p>No products yet. Add your first product!</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(p => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    {p.description && <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{p.description}</div>}
                  </td>
                  <td><span className="mono">{p.sku}</span></td>
                  <td><strong>${Number(p.price).toFixed(2)}</strong></td>
                  <td><span className="mono">{p.quantity}</span></td>
                  <td>
                    {p.quantity === 0
                      ? <span className="badge badge-red">Out of Stock</span>
                      : p.quantity <= 10
                      ? <span className="badge badge-yellow">Low Stock</span>
                      : <span className="badge badge-green">In Stock</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal(p)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(p.id, p.name)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <ProductModal
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
