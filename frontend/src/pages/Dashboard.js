import React, { useEffect, useState } from 'react';
import { dashboard } from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboard.get()
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">System overview and quick stats</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{data?.total_products ?? 0}</div>
          <div className="stat-icon">⬡</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{data?.total_customers ?? 0}</div>
          <div className="stat-icon">◉</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{data?.total_orders ?? 0}</div>
          <div className="stat-icon">◎</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low Stock Items</div>
          <div className="stat-value" style={{ color: data?.low_stock_products?.length ? 'var(--yellow)' : 'var(--accent)' }}>
            {data?.low_stock_products?.length ?? 0}
          </div>
          <div className="stat-icon">⚠</div>
        </div>
      </div>

      {data?.low_stock_products?.length > 0 && (
        <div className="card">
          <h2 style={{ fontFamily: 'var(--mono)', fontSize: '14px', marginBottom: '16px', color: 'var(--yellow)' }}>
            ⚠ Low Stock Alert (≤ 10 units)
          </h2>
          <div className="table-wrap">
            <table className="low-stock-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {data.low_stock_products.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td><span className="mono">{p.sku}</span></td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? 'badge-red' : 'badge-yellow'}`}>
                        {p.quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
