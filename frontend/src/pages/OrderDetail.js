import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orders as api } from '../api';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(id).then(r => setOrder(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading order…</div>;
  if (!order) return <div className="page"><p>Order not found.</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/orders" style={{ color: 'var(--text3)', fontSize: '13px', textDecoration: 'none' }}>
            ← Back to Orders
          </Link>
          <h1 className="page-title" style={{ marginTop: '6px' }}>
            Order #{String(order.id).padStart(4, '0')}
          </h1>
          <p className="page-sub">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <span className="badge badge-green" style={{ padding: '6px 14px', fontSize: '13px' }}>{order.status}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="card">
          <h3 style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text3)', marginBottom: '12px' }}>CUSTOMER</h3>
          <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{order.customer?.full_name}</div>
          <div style={{ color: 'var(--accent)', fontSize: '13px' }}>{order.customer?.email}</div>
          {order.customer?.phone && <div style={{ color: 'var(--text3)', fontSize: '13px', marginTop: '4px' }}>{order.customer.phone}</div>}
        </div>
        <div className="card">
          <h3 style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text3)', marginBottom: '12px' }}>ORDER SUMMARY</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text2)' }}>Items</span>
            <span style={{ fontFamily: 'var(--mono)' }}>{order.items?.length}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text2)' }}>Total Amount</span>
            <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', fontSize: '20px' }}>
              ${Number(order.total_amount).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text3)', marginBottom: '16px' }}>ORDER ITEMS</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Unit Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.product?.name || `Product #${item.product_id}`}</strong></td>
                  <td><span className="mono">{item.product?.sku || '—'}</span></td>
                  <td><span className="mono">${Number(item.unit_price).toFixed(2)}</span></td>
                  <td><span className="mono">{item.quantity}</span></td>
                  <td><strong style={{ color: 'var(--accent)' }}>${(item.unit_price * item.quantity).toFixed(2)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
