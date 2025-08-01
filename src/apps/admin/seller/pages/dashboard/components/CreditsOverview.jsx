import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const CreditsOverview = ({ subscription, onPurchaseCredits }) => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const creditPackages = [
    { name: 'Starter Pack', credits: 500, price: 19.99, popular: false },
    { name: 'Business Pack', credits: 1500, price: 49.99, popular: true },
    { name: 'Enterprise Pack', credits: 3000, price: 89.99, popular: false }
  ];

  const handlePurchase = (pkg) => {
    onPurchaseCredits?.(pkg.credits, pkg.name);
    setShowPurchaseModal(false);
  };

  const creditsBalance = subscription?.credits_balance || 0;
  const creditsLimit = subscription?.credits_limit || 1000;
  const usagePercentage = (creditsBalance / creditsLimit) * 100;

  return (
    <>
      <div className="bg-surface rounded-xl border border-border shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Credits Overview</h3>
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-smooth flex items-center space-x-2 text-sm"
          >
            <Icon name="Plus" size={16} />
            <span>Buy Credits</span>
          </button>
        </div>

        {/* Credits Balance */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-secondary">Available Credits</span>
            <span className="font-medium text-text-primary">
              {creditsBalance.toLocaleString()} / {creditsLimit.toLocaleString()}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                usagePercentage > 80 ? 'bg-error' : 
                usagePercentage > 50 ? 'bg-warning' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
          
          {usagePercentage < 20 && (
            <p className="text-sm text-error mt-2 flex items-center">
              <Icon name="AlertTriangle" size={16} className="mr-1" />
              Low credit balance - consider purchasing more credits
            </p>
          )}
        </div>

        {/* Credit Usage Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{creditsBalance.toLocaleString()}</p>
            <p className="text-sm text-text-secondary">Available</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-text-primary">
              {(creditsLimit - creditsBalance).toLocaleString()}
            </p>
            <p className="text-sm text-text-secondary">Used</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">85</p>
            <p className="text-sm text-text-secondary">This Week</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">
              {subscription?.plan_name || 'Basic'}
            </p>
            <p className="text-sm text-text-secondary">Plan</p>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl border border-border shadow-soft max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-text-primary">Purchase Credits</h3>
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="p-2 hover:bg-background rounded-lg transition-smooth"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>

              <div className="grid gap-4">
                {creditPackages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className={`border rounded-lg p-4 transition-smooth hover:border-primary ${
                      pkg.popular ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-text-primary">{pkg.name}</h4>
                          {pkg.popular && (
                            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-text-secondary">{pkg.credits.toLocaleString()} credits</p>
                        <p className="text-sm text-text-secondary">
                          ${(pkg.price / pkg.credits * 1000).toFixed(2)} per 1000 credits
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-text-primary">${pkg.price}</p>
                        <button
                          onClick={() => handlePurchase(pkg)}
                          className="mt-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-smooth"
                        >
                          Purchase
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-accent/5 border border-accent/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Icon name="Info" size={20} className="text-accent mt-0.5" />
                  <div>
                    <h4 className="font-medium text-accent mb-1">Credit Usage</h4>
                    <ul className="text-sm text-accent/80 space-y-1">
                      <li>• Product listing: 5 credits</li>
                      <li>• Premium placement: 10 credits</li>
                      <li>• Featured listing: 15 credits</li>
                      <li>• Analytics export: 2 credits</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreditsOverview;
