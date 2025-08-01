import Icon from '../../../shared/components/AppIcon';

const MobileCategoryChips = ({ categories, selectedCategory, onCategorySelect }) => {
  return (
    <div className="px-4 py-4 bg-white/90 backdrop-blur-md border-b border-white/50 safe-area-padding-x shadow-lg">
      <div
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`group flex-shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ease-out active:scale-95 touch-manipulation min-h-[48px] shadow-lg border ${selectedCategory === category.id
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-200 ring-2 ring-green-200 scale-105'
              : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-xl active:bg-gray-50 border-white/50'
              }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className={`w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200 ${selectedCategory === category.id
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-600'
              }`}>
              <Icon
                name={category.icon}
                size={14}
                className="flex-shrink-0"
              />
            </div>

            <span className="whitespace-nowrap font-semibold tracking-tight">
              {category.name}
            </span>

            <div className={`flex-shrink-0 text-xs px-2 py-1 rounded-full font-bold min-w-[24px] text-center transition-all duration-200 ${selectedCategory === category.id
              ? 'bg-white/20 text-white'
              : 'bg-green-100 text-green-600 group-hover:bg-green-200'
              }`}>
              {category.count}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileCategoryChips;