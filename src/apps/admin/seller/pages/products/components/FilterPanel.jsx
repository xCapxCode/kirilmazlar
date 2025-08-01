import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const FilterPanel = ({ onClose, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    priceRange: { min: '', max: '' },
    stockRange: { min: '', max: '' },
    categories: [],
    subCategories: [],
    status: [],
    dateRange: { start: '', end: '' },
    tags: []
  });

  const categories = ['Vegetables', 'Fruits'];
  const subCategories = {
    Vegetables: ['Leafy Greens', 'Root Vegetables', 'Nightshades', 'Peppers', 'Cruciferous'],
    Fruits: ['Tree Fruits', 'Berries', 'Citrus', 'Tropical Fruits', 'Stone Fruits']
  };
  const statusOptions = ['active', 'inactive'];
  const commonTags = ['organic', 'local', 'fresh', 'seasonal', 'premium'];

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleArrayFilterToggle = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const handleReset = () => {
    setFilters({
      priceRange: { min: '', max: '' },
      stockRange: { min: '', max: '' },
      categories: [],
      subCategories: [],
      status: [],
      dateRange: { start: '', end: '' },
      tags: []
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (filters.stockRange.min || filters.stockRange.max) count++;
    if (filters.categories.length > 0) count++;
    if (filters.subCategories.length > 0) count++;
    if (filters.status.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.tags.length > 0) count++;
    return count;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-1000">
      <div className="bg-surface h-full w-full max-w-md shadow-elevated flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-text-primary">Advanced Filters</h2>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-smooth"
          >
            <Icon name="X" size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Price Range */}
          <div>
            <h3 className="font-medium text-text-primary mb-3">Price Range (₺)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Min</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={filters.priceRange.min}
                  onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Max</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={filters.priceRange.max}
                  onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                  placeholder="999.99"
                />
              </div>
            </div>
          </div>

          {/* Stock Range */}
          <div>
            <h3 className="font-medium text-text-primary mb-3">Stock Range</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Min</label>
                <input
                  type="number"
                  min="0"
                  value={filters.stockRange.min}
                  onChange={(e) => handleFilterChange('stockRange', { ...filters.stockRange, min: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Max</label>
                <input
                  type="number"
                  min="0"
                  value={filters.stockRange.max}
                  onChange={(e) => handleFilterChange('stockRange', { ...filters.stockRange, max: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                  placeholder="9999"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-medium text-text-primary mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleArrayFilterToggle('categories', category)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-text-primary">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sub-Categories */}
          {filters.categories.length > 0 && (
            <div>
              <h3 className="font-medium text-text-primary mb-3">Sub-Categories</h3>
              <div className="space-y-2">
                {filters.categories.flatMap(category => 
                  subCategories[category] || []
                ).map(subCategory => (
                  <label key={subCategory} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.subCategories.includes(subCategory)}
                      onChange={() => handleArrayFilterToggle('subCategories', subCategory)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-text-primary">{subCategory}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <h3 className="font-medium text-text-primary mb-3">Status</h3>
            <div className="space-y-2">
              {statusOptions.map(status => (
                <label key={status} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => handleArrayFilterToggle('status', status)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-text-primary capitalize">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h3 className="font-medium text-text-primary mb-3">Date Added</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-text-secondary mb-1">From</label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">To</label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="font-medium text-text-primary mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {commonTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleArrayFilterToggle('tags', tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-smooth ${
                    filters.tags.includes(tag)
                      ? 'bg-primary text-white' :'bg-gray-100 text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-text-secondary hover:text-text-primary transition-smooth"
          >
            Reset All
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg hover:bg-background transition-smooth"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-smooth"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
