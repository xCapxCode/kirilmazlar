import React from 'react';
import Icon from '../../../../../shared/components/AppIcon';
import { memoComparisonHelpers, trackRender } from '../../../../../utils/memoizationHelpers';

const FilterPanel = ({
  isOpen,
  onClose,
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangeChange,
  showAvailableOnly,
  onAvailableOnlyChange,
  categories,
  selectedCategory,
  onCategorySelect
}) => {
  // Performance tracking
  trackRender('FilterPanel');

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  const handlePriceChange = (index, value) => {
    const newRange = [...priceRange];
    newRange[index] = parseFloat(value);
    onPriceRangeChange(newRange);
  };

  const resetFilters = () => {
    onSortChange('relevance');
    onPriceRangeChange([0, 1000]);
    onAvailableOnlyChange(false);
    onCategorySelect('all');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-998"
        onClick={onClose}
      />

      {/* Filter Panel */}
      <div className="fixed inset-x-0 bottom-0 md:right-0 md:top-0 md:left-auto md:w-96 bg-surface z-999 md:border-l border-border shadow-2xl">
        {/* Mobile: Slide up from bottom */}
        <div className="md:hidden h-full max-h-[80vh] rounded-t-2xl overflow-hidden">
          {/* Handle */}
          <div className="flex justify-center py-3 border-b border-border">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-background rounded-lg transition-smooth"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <FilterContent
              sortOptions={sortOptions}
              sortBy={sortBy}
              onSortChange={onSortChange}
              priceRange={priceRange}
              handlePriceChange={handlePriceChange}
              showAvailableOnly={showAvailableOnly}
              onAvailableOnlyChange={onAvailableOnlyChange}
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={onCategorySelect}
            />
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-background">
            <div className="flex space-x-3">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 px-4 border border-border rounded-lg text-text-secondary hover:bg-surface transition-smooth"
              >
                Reset
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary-600 transition-smooth"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: Slide in from right */}
        <div className="hidden md:flex md:flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-background rounded-lg transition-smooth"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <FilterContent
              sortOptions={sortOptions}
              sortBy={sortBy}
              onSortChange={onSortChange}
              priceRange={priceRange}
              handlePriceChange={handlePriceChange}
              showAvailableOnly={showAvailableOnly}
              onAvailableOnlyChange={onAvailableOnlyChange}
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={onCategorySelect}
            />
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border">
            <div className="flex space-x-3">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 px-4 border border-border rounded-lg text-text-secondary hover:bg-surface transition-smooth"
              >
                Reset
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary-600 transition-smooth"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const FilterContent = ({
  sortOptions,
  sortBy,
  onSortChange,
  priceRange,
  handlePriceChange,
  showAvailableOnly,
  onAvailableOnlyChange,
  categories,
  selectedCategory,
  onCategorySelect
}) => (
  <>
    {/* Sort By */}
    <div>
      <h3 className="text-sm font-semibold text-text-primary mb-3">Sort By</h3>
      <div className="space-y-2">
        {sortOptions.map((option) => (
          <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="sort"
              value={option.value}
              checked={sortBy === option.value}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-4 h-4 text-primary border-border focus:ring-primary"
            />
            <span className="text-sm text-text-secondary">{option.label}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Price Range */}
    <div>
      <h3 className="text-sm font-semibold text-text-primary mb-3">Price Range</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <label className="block text-xs text-text-secondary mb-1">Min Price</label>
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => handlePriceChange(0, e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="0"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-text-secondary mb-1">Max Price</label>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(1, e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="1000"
            />
          </div>
        </div>
        <div className="text-xs text-text-secondary">
          ₺{priceRange[0]} - ₺{priceRange[1]}
        </div>
      </div>
    </div>

    {/* Availability */}
    <div>
      <h3 className="text-sm font-semibold text-text-primary mb-3">Availability</h3>
      <label className="flex items-center space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={showAvailableOnly}
          onChange={(e) => onAvailableOnlyChange(e.target.checked)}
          className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
        />
        <span className="text-sm text-text-secondary">Show available only</span>
      </label>
    </div>

    {/* Categories */}
    <div>
      <h3 className="text-sm font-semibold text-text-primary mb-3">Categories</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <label key={category.id} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="category"
              value={category.id}
              checked={selectedCategory === category.id}
              onChange={(e) => onCategorySelect(e.target.value)}
              className="w-4 h-4 text-primary border-border focus:ring-primary"
            />
            <Icon name={category.icon} size={16} className="text-text-secondary" />
            <span className="text-sm text-text-secondary flex-1">{category.name}</span>
            <span className="text-xs text-text-secondary bg-gray-100 px-2 py-1 rounded-full">
              {category.count}
            </span>
          </label>
        ))}
      </div>
    </div>
  </>
);

export default React.memo(FilterPanel, memoComparisonHelpers.filterPanel);
