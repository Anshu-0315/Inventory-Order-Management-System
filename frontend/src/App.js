import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import './App.css';

function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">▣</div>
        <div>
          <div className="brand-name">StockFlow</div>
          <div className="brand-sub">Inventory System</div>
        </div>
      </div>
      <ul className="nav-list">
        {[
          { to: '/', label: 'Dashboard', icon: '◈' },
          { to: '/products', label: 'Products', icon: '⬡' },
          { to: '/customers', label: 'Customers', icon: '◉' },
          { to: '/orders', label: 'Orders', icon: '◎' },
        ].map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink to={to} end={to === '/'} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon">{icon}</span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
