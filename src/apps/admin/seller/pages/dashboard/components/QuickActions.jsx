import React from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';

const QuickActions = ({ subscription, onUseCredits }) => {
  const actions = [
    {
      title: 'Add Product',
      description: 'List a new product (5 credits)',
      icon: 'Plus',
      color: 'bg-primary text-white',
      link: '/product-management',
      credits: 5
    },
    {
      title: 'Boost Listing',
      description: 'Promote product visibility (10 credits)',
      icon: 'Zap',
      color: 'bg-warning text-white',
      action: 'boost',
      credits: 10
    },
    {
      title: 'View Analytics',
      description: 'Export detailed report (2 credits)',
      icon: 'BarChart3',
      color: 'bg-accent text-white',
      action: 'analytics',
      credits: 2
    },
    {
      title: 'Manage Orders',
      description: 'Check order status',
      icon: 'Package',
      color: 'bg-success text-white',
      link: '/order-management',
      credits: 0
    }
  ];

  const handleAction = async (action, credits, description) => {
    if (credits > 0) {
      const hasCredits = subscription?.credits_balance >= credits;
      
      if (!hasCredits) {
        alert('Insufficient credits. Please purchase more credits to continue.');
        return;
      }

      const confirmed = window.confirm(
        `This action will use ${credits} credits. Do you want to continue?`
      );
      
      if (confirmed && onUseCredits) {
        try {
          await onUseCredits(credits, description);
          alert(`Action completed! ${credits} credits have been deducted.`);
        } catch (error) {
          alert('Failed to complete action. Please try again.');
        }
      }
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border shadow-soft p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-6">Quick Actions</h3>
      
      <div className="space-y-3">
        {actions.map((action, index) => {
          const canAfford = action.credits === 0 || (subscription?.credits_balance >= action.credits);
          
          if (action.link) {
            return (
              <Link
                key={index}
                to={action.link}
                className={`flex items-center space-x-4 p-4 rounded-lg transition-smooth hover:bg-background ${
                  !canAfford ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={(e) => {
                  if (!canAfford) {
                    e.preventDefault();
                    alert('Insufficient credits');
                  }
                }}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon name={action.icon} size={24} className={action.color} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">{action.title}</h4>
                  <p className="text-sm text-text-secondary">{action.description}</p>
                </div>
                <Icon name="ChevronRight" size={20} className="text-text-secondary" />
              </Link>
            );
          }

          return (
            <button
              key={index}
              onClick={() => handleAction(action.action, action.credits, action.title)}
              disabled={!canAfford}
              className={`w-full flex items-center space-x-4 p-4 rounded-lg transition-smooth hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed ${
                !canAfford ? 'opacity-50' : ''
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center`}>
                <Icon name={action.icon} size={24} className={action.color} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-medium text-text-primary">{action.title}</h4>
                <p className="text-sm text-text-secondary">{action.description}</p>
              </div>
              <Icon name="ChevronRight" size={20} className="text-text-secondary" />
            </button>
          );
        })}
      </div>

      {/* Credit Balance Warning */}
      {subscription && subscription.credits_balance < 20 && (
        <div className="mt-6 bg-warning/10 border border-warning/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
            <div>
              <h4 className="font-medium text-warning mb-1">Low Credit Balance</h4>
              <p className="text-sm text-warning/80">
                You have {subscription.credits_balance} credits remaining. Consider purchasing more to continue using premium features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Tips */}
      <div className="mt-6 bg-accent/5 border border-accent/20 rounded-lg p-4">
        <h4 className="font-medium text-accent mb-2">💡 Credit Tips</h4>
        <ul className="text-sm text-accent/80 space-y-1">
          <li>• Product listings use 5 credits each</li>
          <li>• Boost visibility for better sales</li>
          <li>• Analytics help optimize performance</li>
          <li>• Order management is always free</li>
        </ul>
      </div>
    </div>
  );
};

export default QuickActions;
