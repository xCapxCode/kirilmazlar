import React from 'react';
import Icon from 'components/AppIcon';

const FilterSidebar = ({ 
  isOpen, 
  onClose, 
  dateRange, 
  onDateRangeChange, 
  sortBy, 
  onSortByChange, 
  sortOrder, 
  onSortOrderChange 
}) => {
  const handleDateRangeChange = (field, value) => {
    onDateRangeChange({
      ...dateRange,
      [field]: value
    });
  };

  const clearFilters = () => {
    onDateRangeChange({ start: '', end: '' });
    onSortByChange('date');
    onSortOrderChange('desc');
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getWeekAgoDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  };

  const setQuickDateRange = (range) => {
    const today = new Date();
    let startDate, endDate;

    switch (range) {
      case 'today':
        startDate = endDate = getTodayDate();
        break;
      case 'week':
        startDate = getWeekAgoDate();
        endDate = getTodayDate();
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        endDate = getTodayDate();
        break;
      default:
        return;
    }

    onDateRangeChange({ start: startDate, end: endDate });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-998"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 right-0 h-full lg:h-auto w-80 bg-surface border-l lg:border-l-0 lg:border-r border-border z-999 lg:z-auto
        transform transition-transform duration-300 lg:transform-none
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        ${isOpen ? 'lg:block' : 'hidden lg:block'}
      `}>
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-text-primary">Filters & Sort</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearFilters}
                className="text-sm text-text-secondary hover:text-primary transition-smooth"
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="lg:hidden p-1 hover:bg-background rounded transition-smooth"
              >
                <Icon name="X" size={16} className="text-text-secondary" />
              </button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="mb-6">
            <h4 className="font-medium text-text-primary mb-3">Date Range</h4>
            
            {/* Quick Date Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => setQuickDateRange('today')}
                className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-background transition-smooth"
              >
                Today
              </button>
              <button
                onClick={() => setQuickDateRange('week')}
                className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-background transition-smooth"
              >
                This Week
              </button>
              <button
                onClick={() => setQuickDateRange('month')}
                className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-background transition-smooth"
              >
                This Month
              </button>
            </div>

            {/* Custom Date Range */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-text-secondary mb-1">From Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">To Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                />
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="mb-6">
            <h4 className="font-medium text-text-primary mb-3">Sort By</h4>
            <div className="space-y-2">
              {[
                { value: 'date', label: 'Order Date' },
                { value: 'customer', label: 'Customer Name' },
                { value: 'amount', label: 'Order Amount' },
                { value: 'status', label: 'Status' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sortBy"
                    value={option.value}
                    checked={sortBy === option.value}
                    onChange={(e) => onSortByChange(e.target.value)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-text-primary">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort Order */}
          <div className="mb-6">
            <h4 className="font-medium text-text-primary mb-3">Sort Order</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="sortOrder"
                  value="desc"
                  checked={sortOrder === 'desc'}
                  onChange={(e) => onSortOrderChange(e.target.value)}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">Newest First</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="sortOrder"
                  value="asc"
                  checked={sortOrder === 'asc'}
                  onChange={(e) => onSortOrderChange(e.target.value)}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">Oldest First</span>
              </label>
            </div>
          </div>

          {/* Order Value Filter */}
          <div className="mb-6">
            <h4 className="font-medium text-text-primary mb-3">Order Value Range</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Min (₺)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Max (₺)</label>
                <input
                  type="number"
                  placeholder="1000"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-background rounded-lg p-4 border border-border">
            <h4 className="font-medium text-text-primary mb-3">Quick Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Total Orders:</span>
                <span className="font-medium text-text-primary">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Pending:</span>
                <span className="font-medium text-warning">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Delivered:</span>
                <span className="font-medium text-success">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Total Revenue:</span>
                <span className="font-medium text-primary">₺2,847.50</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;