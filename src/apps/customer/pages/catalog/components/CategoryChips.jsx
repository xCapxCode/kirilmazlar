import React from 'react';
import Icon from '../../../../../shared/components/AppIcon';

const CategoryChips = ({ categories, selectedCategory, onCategorySelect }) => {
  return (
    <div>
      {/* Categories Container - Sola Yaslanmış */}
      <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide pb-2">
        {/* Tüm Ürünler - En Solda */}
        <button
          onClick={() => onCategorySelect('all')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md whitespace-nowrap transition-smooth ${
            selectedCategory === 'all'
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-surface text-text-secondary border border-border hover:bg-background hover:text-text-primary'
          }`}
        >
          <Icon 
            name="Package" 
            size={16} 
            strokeWidth={selectedCategory === 'all' ? 2.5 : 2}
          />
          <span className="text-sm font-medium">Tüm Ürünler</span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${
            selectedCategory === 'all'
              ? 'bg-primary/10 text-primary'
              : 'bg-background text-text-secondary'
          }`}>
            {categories.find(cat => cat.id === 'all')?.count || 0}
          </span>
        </button>
        
        {/* Diğer Kategoriler - Soldan Sağa */}
        {categories.filter(cat => cat.id !== 'all').map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md whitespace-nowrap transition-smooth ${
              selectedCategory === category.id
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-surface text-text-secondary border border-border hover:bg-background hover:text-text-primary'
            }`}
          >
            <Icon 
              name={category.icon} 
              size={16} 
              strokeWidth={selectedCategory === category.id ? 2.5 : 2}
            />
            <span className="text-sm font-medium">{category.name}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              selectedCategory === category.id
                ? 'bg-primary/10 text-primary'
                : 'bg-background text-text-secondary'
            }`}>
              {category.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryChips;