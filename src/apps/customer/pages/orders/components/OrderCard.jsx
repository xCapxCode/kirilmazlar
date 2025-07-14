import React from 'react';
import Icon from '../../../../../shared/components/AppIcon';
import Image from '../../../../../shared/components/AppImage';

const OrderCard = ({ 
  order, 
  onOrderSelect, 
  onOrderAction,
  getStatusColor, 
  getStatusText, 
  formatDate, 
  formatCurrency 
}) => {
  const handleQuickAction = (e, action) => {
    e.stopPropagation();
    onOrderAction(action, order);
  };

  return (
    <div 
      onClick={() => onOrderSelect(order)}
      className="bg-slate-100 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-colors cursor-pointer"
    >
      {/* Order Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-text-primary">
              {order.id}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
          <p className="text-sm text-text-secondary">
            {formatDate(order.date)}
          </p>
        </div>
        
        <div className="text-right">
          <p className="font-semibold text-text-primary">
            {formatCurrency(order.total)}
          </p>
          <p className="text-sm text-text-secondary">
            {order.itemCount} ürün
          </p>
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {order.items.slice(0, 4).map((item, index) => (
            <div key={item.id} className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
          {order.items.length > 4 && (
            <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center">
              <span className="text-xs font-medium text-text-secondary">
                +{order.items.length - 4}
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-text-secondary line-clamp-1">
            {order.items.slice(0, 3).map(item => item.name).join(', ')}
            {order.items.length > 3 && '...'}
          </p>
        </div>
      </div>

      {/* Progress Timeline for Active Orders */}
      {['confirmed', 'preparing', 'out_for_delivery'].includes(order.status) && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs">
            {order.timeline.map((step, index) => (
              <div key={step.status} className="flex flex-col items-center flex-1">
                <div className={`w-3 h-3 rounded-full mb-1 ${
                  step.completed ? 'bg-primary' : 'bg-gray-200'
                }`} />
                <span className={`text-center ${
                  step.completed ? 'text-primary font-medium' : 'text-text-secondary'
                }`}>
                  {step.status === 'confirmed' && 'Onaylandı'}
                  {step.status === 'preparing' && 'Hazırlanıyor'}
                  {step.status === 'out_for_delivery' && 'Yolda'}
                  {step.status === 'delivered' && 'Teslim Edildi'}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center mt-2">
            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ 
                  width: `${(order.timeline.filter(s => s.completed).length / order.timeline.length) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Estimated Delivery */}
      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <div className="mb-4 p-3 bg-slate-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="Truck" size={16} className="text-primary" />
            <span className="text-sm font-medium text-text-primary">
              Tahmini Teslimat
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            {formatDate(order.estimatedDelivery)}
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center space-x-4">
          {/* İptal butonu - sadece pending, confirmed, preparing durumlarında */}
          {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing') && (
            <button
              onClick={(e) => handleQuickAction(e, 'cancel')}
              className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-smooth"
            >
              <Icon name="X" size={16} />
              <span>İptal Et</span>
            </button>
          )}
          
          {/* Yeniden sipariş butonu - sadece delivered veya cancelled durumlarında */}
          {(order.status === 'delivered' || order.status === 'cancelled') && (
            <button
              onClick={(e) => handleQuickAction(e, 'reorder')}
              className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-700 transition-smooth"
            >
              <Icon name="RotateCcw" size={16} />
              <span>Yeniden Sipariş</span>
            </button>
          )}
          
          {/* Sipariş takibi - aktif siparişler için */}
          {(order.status === 'confirmed' || order.status === 'preparing' || order.status === 'out_for_delivery') && (
            <button
              onClick={(e) => handleQuickAction(e, 'track')}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-smooth"
            >
              <Icon name="MapPin" size={16} />
              <span>Takip Et</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 text-text-secondary">
          <span className="text-sm">Detaylar</span>
          <Icon name="ChevronRight" size={16} />
        </div>
      </div>
    </div>
  );
};

export default OrderCard;