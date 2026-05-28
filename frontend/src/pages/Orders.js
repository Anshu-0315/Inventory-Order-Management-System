import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orders as ordersApi, customers as customersApi, products as productsApi } from '../api';
import { useToast } from '../context/ToastContext';

function OrderModal({ onClose, onSaved }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    Promise.all([customersApi.list(), productsApi.list()]).then(([cr, pr]) => {
      setCustomers(cr.data);
      setProducts(pr.data.filter(p => p.quantity > 0));
    });
  }, []);

  const setItem = (idx, field, value) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: value };
    setItems(next);
  };

  const addItem = () => setItems([...items, { product_id: '', quantity: 1 }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const calcTotal = () => {
    return items.reduce((sum, item) => {
      const p = products.find(p => String(p.id) === String(item.product_id));
      return sum + (p ? p.price * Number(item.quantity) : 0);
    }, 0);
  };

  const validate = () => {
    const e = {};
    if (!customerId) e.customer = 'Select a customer';
    if (items.length === 0) e.items = 'Add at least one item';
    items.forEach((item, i) => {
      if (!item.product_id) e[`item_${i}_product`] = 'Select a product';
      if (!item.quantity || Number(item.quantity) <= 0) e[`item_${i}_qty`] = 'Min 1';
    });
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await ordersApi.create({
        customer_id: Number(customerId),
        items: items.map(i => ({ product_id: Number(i.product_id), quantity: Number(i.quantity) }))
      });
      addToast('Order created successfully');
      onSaved();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Error creating order', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-wide">
        <div className="modal-header">
          <h2 className="modal-title">New Order</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label">Customer *</label>
          <select className="form-select" value={customerId} onChange={e => setCustomerId(e.target.value)}>
            <option value="">Select customer…</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
          </select>
          {errors.customer && <span className="form-error">{errors.customer}</span>}
        </div>

        <div className="order-items-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label className="form-label">Order Items *</label>
            <button className="btn btn-ghost btn-sm add-item-btn" onClick={addItem}>+ Add Item</button>
          </div>

          {items.map((item, idx) => {
            const selProd = products.find(p => String(p.id) === String(item.product_id));
            return (
              <div key={idx} className="order-item-row">
                <div>
                  <select className="form-select" value={item.product_id} onChange={e => setItem(idx, 'product_id', e.target.value)}>
                    <option value="">Select product…</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
                  </select>
                  {errors[`item_${idx}_product`] && <span className="form-error">{errors[`item_${idx}_product`]}</span>}
                </div>
                <div>
                  <input className="form-input" type="number" min="1" max={selProd?.quantity || 9999}
                    value={item.quantity} onChange={e => setItem(idx, 'quantity', e.target.value)} />
                  {errors[`item_${idx}_qty`] && <span className="form-error">{errors[`item_${idx}_qty`]}</span>}
                </div>
                <div style={{ color: 'var(--text3)', fontSize: '13px', fontFamily: 'var(--mono)' }}>
                  {selProd ? `$${(selProd.price * Number(item.quantity)).toFixed(2)}` : '—'}
                </div>
                <div style={{ color: 'var(--text3)', fontSize: '12px' }}>
                  {selProd ? `@$${selProd.price.toFixed(2)}` : ''}
                </div>
                {items.length > 1 && (
                  <button className="btn btn-danger btn-sm" onClick={() => removeItem(idx)} style={{ padding: '6px 8px' }}>×</button>
                )}
              </div>
            );
          })}
        </div>

        <div className="divider" />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
          <span className="text-muted" style={{ fontSize: '13px' }}>Total:</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '20px', color: 'var(--accent)' }}>
            ${calcTotal().toFixed(2)}
          </span>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? 'Placing…' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useToast();

  const load = () => ordersApi.list().then(r => setList(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm('Cancel this order? Stock will be restored.')) return;
    try {
      await ordersApi.delete(id);
      addToast('Order cancelled and stock restored');
      load();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Cannot cancel order', 'error');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-sub">{list.length} total orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Order</button>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : list.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◎</div>
          <p>No orders yet. Create your first order!</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(o => (
                <tr key={o.id}>
                  <td><span className="mono">#{String(o.id).padStart(4, '0')}</span></td>
                  <td><strong>{o.customer?.full_name || `Customer #${o.customer_id}`}</strong></td>
                  <td><span className="mono">{o.items?.length ?? 0} item{o.items?.length !== 1 ? 's' : ''}</span></td>
                  <td><strong style={{ color: 'var(--accent)' }}>${Number(o.total_amount).toFixed(2)}</strong></td>
                  <td><span className="badge badge-green">{o.status}</span></td>
                  <td><span className="mono" style={{ fontSize: '12px' }}>{new Date(o.created_at).toLocaleDateString()}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Link to={`/orders/${o.id}`} className="btn btn-ghost btn-sm">View</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(o.id)}>Cancel</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <OrderModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />
      )}
    </div>
  );
}
