import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Subscription = () => {
  const { user, loadUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async (plan) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const res = await api.post('/api/payment/create-checkout-session', 
        { plan },
        {
          headers: {
            'x-auth-token': token
          }
        }
      );
      
      // Redirect to Stripe checkout
      const { url } = res.data;
      if (url) {
        window.location.href = url;
      } else {
        alert('Failed to initiate checkout');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to initiate checkout');
      setLoading(false);
    }
  };

  // Note: In a real implementation, you would use the official Stripe checkout
  // For now, we're just showing the plans
  return (
    <div className="subscription card">
      <h2>Subscription Plans</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="pricing-grid">
        <div className="pricing-card">
          <h3>Free</h3>
          <div className="price">$0/month</div>
          <ul>
            <li>10 credits per month</li>
            <li>Basic video processing</li>
          </ul>
          <div className="current-plan">Current Plan</div>
        </div>
        
        <div className="pricing-card">
          <h3>Premium</h3>
          <div className="price">$9.99/month</div>
          <ul>
            <li>100 credits per month</li>
            <li>Priority processing</li>
            <li>Advanced features</li>
          </ul>
          <button 
            className="btn btn-primary" 
            onClick={() => handleCheckout('premium')}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Upgrade to Premium'}
          </button>
        </div>
        
        <div className="pricing-card">
          <h3>Pro</h3>
          <div className="price">$29.99/month</div>
          <ul>
            <li>500 credits per month</li>
            <li>Priority processing</li>
            <li>Advanced features</li>
            <li>Priority support</li>
          </ul>
          <button 
            className="btn btn-primary" 
            onClick={() => handleCheckout('pro')}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Upgrade to Pro'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;