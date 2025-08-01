import React from 'react';
import Icon from '../../../../../shared/components/AppIcon';

const FilterModal = ({ sortBy, setSortBy, onClose }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: 'ArrowDown' },
    { value: 'oldest', label: 'Oldest First', icon: 'ArrowUp' },
    { value: 'highest', label: 'Highest Amount', icon: 'TrendingUp' },
    { value: 'lowest', label: 'Lowest Amount', icon: 'TrendingDown' }
  ];

  const handleSortChange = (value) => {
    setSortBy(value);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-1000 flex items-end md:items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface rounded-t-2xl md:rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">
            Sort Orders
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-background transition-smooth"
          >
            <Icon name="X" size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* Sort Options */}
        <div className="p-4">
          <div className="space-y-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-smooth ${
                  sortBy === option.value
                    ? 'bg-primary text-white' :'hover:bg-background text-text-primary'
                }`}
              >
                <Icon 
                  name={option.icon} 
                  size={20} 
                  className={sortBy === option.value ? 'text-white' : 'text-text-secondary'}
                />
                <span className="font-medium">
                  {option.label}
                </span>
                {sortBy === option.value && (
                  <Icon name="Check" size={20} className="text-white ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-background text-text-primary rounded-lg hover:bg-gray-100 transition-smooth font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
