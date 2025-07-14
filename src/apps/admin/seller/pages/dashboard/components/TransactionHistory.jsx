import React from 'react';
import Icon from 'components/AppIcon';

const TransactionHistory = ({ transactions = [] }) => {
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase':
        return { name: 'Plus', color: 'text-success' };
      case 'usage':
        return { name: 'Minus', color: 'text-error' };
      case 'refund':
        return { name: 'RotateCcw', color: 'text-accent' };
      case 'bonus':
        return { name: 'Gift', color: 'text-warning' };
      default:
        return { name: 'Circle', color: 'text-text-secondary' };
    }
  };

  const formatAmount = (amount, type) => {
    const sign = type === 'purchase' || type === 'bonus' || type === 'refund' ? '+' : '-';
    return `${sign}${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-GB'),
      time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border shadow-soft p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Transaction History</h3>
        <div className="text-center py-8">
          <Icon name="Receipt" size={48} className="text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary">No transactions found</p>
          <p className="text-sm text-text-secondary mt-1">Your credit transactions will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Transaction History</h3>
        <button className="text-primary hover:text-primary/80 text-sm font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => {
          const iconInfo = getTransactionIcon(transaction.type);
          const { date, time } = formatDate(transaction.created_at);
          
          return (
            <div key={transaction.id} className="flex items-center space-x-4 p-3 hover:bg-background rounded-lg transition-smooth">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconInfo.color}`}>
                <Icon name={iconInfo.name} size={20} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-text-primary truncate">
                  {transaction.description || `Credit ${transaction.type}`}
                </h4>
                <div className="flex items-center space-x-2 text-sm text-text-secondary">
                  <span>{date}</span>
                  <span>•</span>
                  <span>{time}</span>
                  <span>•</span>
                  <span className="capitalize">{transaction.type}</span>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'purchase' || transaction.type === 'bonus' || transaction.type === 'refund' ?'text-success' :'text-error'
                }`}>
                  {formatAmount(transaction.amount, transaction.type)} credits
                </p>
                
                {transaction.reference_id && (
                  <p className="text-xs text-text-secondary">
                    Ref: {transaction.reference_id.slice(-8)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Transaction Summary */}
      <div className="border-t border-border mt-6 pt-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-text-secondary">This Month</p>
            <p className="font-semibold text-success">
              +{transactions
                .filter(t => (t.type === 'purchase' || t.type === 'bonus') && 
                       new Date(t.created_at).getMonth() === new Date().getMonth())
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Used</p>
            <p className="font-semibold text-error">
              -{transactions
                .filter(t => t.type === 'usage' && 
                       new Date(t.created_at).getMonth() === new Date().getMonth())
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Net Change</p>
            <p className="font-semibold text-text-primary">
              {(transactions
                .filter(t => new Date(t.created_at).getMonth() === new Date().getMonth())
                .reduce((sum, t) => {
                  return sum + (t.type === 'usage' ? -t.amount : t.amount);
                }, 0) > 0 ? '+' : '')
              }{transactions
                .filter(t => new Date(t.created_at).getMonth() === new Date().getMonth())
                .reduce((sum, t) => {
                  return sum + (t.type === 'usage' ? -t.amount : t.amount);
                }, 0)
                .toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;