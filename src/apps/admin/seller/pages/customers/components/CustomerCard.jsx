import React from 'react';
import Icon from '../../../components/AppIcon';

const CustomerCard = ({ customer, onSelect, isSelected, onEdit, onViewOrders }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'text-success bg-success/10';
      case 'inactive': return 'text-text-secondary bg-gray-100';
      case 'vip': return 'text-primary bg-primary/10';
      default: return 'text-text-secondary bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Pasif';
      case 'vip': return 'VIP';
      default: return 'Bilinmiyor';
    }
  };

  return (
    <div 
      className={`bg-surface rounded-lg border p-4 cursor-pointer transition-smooth hover:shadow-soft ${
        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
      }`}
      onClick={() => onSelect(customer)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
            {getInitials(customer.name)}
          </div>
          <div>
            <h4 className="font-medium text-text-primary">{customer.name}</h4>
            {customer.companyName && (
              <p className="text-sm text-text-secondary">{customer.companyName}</p>
            )}
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
          {getStatusText(customer.status)}
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center text-sm text-text-secondary">
          <Icon name="Phone" size={14} className="mr-2" />
          {customer.phone}
        </div>
        <div className="flex items-center text-sm text-text-secondary">
          <Icon name="Mail" size={14} className="mr-2" />
          {customer.email}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div className="text-center p-2 bg-background rounded">
          <div className="font-medium text-text-primary">{customer.orderCount}</div>
          <div className="text-text-secondary">Sipariş</div>
        </div>
        <div className="text-center p-2 bg-background rounded">
          <div className="font-medium text-text-primary">{formatCurrency(customer.totalSpent)}</div>
          <div className="text-text-secondary">Toplam</div>
        </div>
      </div>

      {/* Last Order */}
      <div className="text-xs text-text-secondary mb-3">
        Son sipariş: {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'Henüz sipariş yok'}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-2 border-t border-border">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewOrders(customer);
          }}
          className="text-primary hover:text-primary-dark text-sm font-medium transition-smooth"
        >
          Siparişler
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(customer);
          }}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-smooth"
        >
          Düzenle
        </button>
      </div>
    </div>
  );
};

export default CustomerCard; 