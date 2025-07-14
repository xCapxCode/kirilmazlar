import React from 'react';
import Icon from 'components/AppIcon';

const SubscriptionCard = ({ subscription }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-success bg-success/10';
      case 'trial':
        return 'text-accent bg-accent/10';
      case 'inactive':
        return 'text-text-secondary bg-gray-100';
      case 'cancelled':
        return 'text-error bg-error/10';
      default:
        return 'text-text-secondary bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const planName = subscription?.plan_name || 'Basic';
  const status = subscription?.status || 'trial';
  const monthlyFee = subscription?.monthly_fee || 29.99;
  const expiresAt = subscription?.expires_at;

  const daysUntilExpiry = expiresAt ? 
    Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="bg-surface rounded-xl border border-border shadow-soft p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Subscription</h3>
        <Icon name="Crown" size={20} className="text-accent" />
      </div>

      {/* Plan Info */}
      <div className="text-center mb-6">
        <h4 className="text-xl font-bold text-text-primary capitalize mb-1">
          {planName} Plan
        </h4>
        <p className="text-3xl font-bold text-primary mb-2">
          ${monthlyFee}
          <span className="text-sm text-text-secondary font-normal">/month</span>
        </p>
        
        <div className="flex items-center justify-center">
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Subscription Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Credits Limit</span>
          <span className="font-medium text-text-primary">
            {subscription?.credits_limit?.toLocaleString() || 'N/A'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Started</span>
          <span className="font-medium text-text-primary">
            {formatDate(subscription?.started_at)}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">
            {status === 'trial' ? 'Trial Expires' : 'Next Billing'}
          </span>
          <span className="font-medium text-text-primary">
            {formatDate(expiresAt)}
          </span>
        </div>

        {daysUntilExpiry > 0 && daysUntilExpiry <= 7 && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-warning" />
              <p className="text-sm text-warning">
                {status === 'trial' ? 'Trial' : 'Subscription'} expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Plan Features */}
      <div className="border-t border-border pt-4 mb-6">
        <h5 className="font-medium text-text-primary mb-3">Plan Features</h5>
        <div className="space-y-2">
          {[
            'Unlimited product listings',
            'Advanced analytics',
            'Priority customer support',
            'Custom branding options'
          ].map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <Icon name="Check" size={16} className="text-success" />
              <span className="text-text-secondary">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {status === 'trial' ? (
          <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-600 transition-smooth font-medium">
            Upgrade to Pro
          </button>
        ) : (
          <button className="w-full border border-border py-2 rounded-lg hover:bg-background transition-smooth font-medium text-text-primary">
            Manage Subscription
          </button>
        )}
        
        <button className="w-full text-text-secondary hover:text-text-primary transition-smooth text-sm">
          View Billing History
        </button>
      </div>
    </div>
  );
};

export default SubscriptionCard;