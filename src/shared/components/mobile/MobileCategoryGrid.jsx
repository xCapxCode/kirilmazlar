import Icon from '../../../../shared/components/AppIcon';

const MobileCategoryGrid = ({ categories, onCategorySelect, selectedCategory }) => {
  // Default kategoriler (tasarım örneğinden)
  const defaultCategories = [
    {
      id: 'vegetables',
      name: 'Sebzeler',
      icon: 'Carrot',
      color: 'bg-green-100 text-green-600',
      count: 45
    },
    {
      id: 'fruits',
      name: 'Meyveler',
      icon: 'Apple',
      color: 'bg-red-100 text-red-600',
      count: 32
    },
    {
      id: 'dairy',
      name: 'Süt Ürünleri',
      icon: 'Milk',
      color: 'bg-blue-100 text-blue-600',
      count: 28
    },
    {
      id: 'drinks',
      name: 'İçecekler',
      icon: 'Coffee',
      color: 'bg-orange-100 text-orange-600',
      count: 19
    },
    {
      id: 'meat',
      name: 'Et & Tavuk',
      icon: 'Beef',
      color: 'bg-red-100 text-red-700',
      count: 15
    },
    {
      id: 'bakery',
      name: 'Fırın',
      icon: 'Croissant',
      color: 'bg-yellow-100 text-yellow-700',
      count: 23
    },
    {
      id: 'snacks',
      name: 'Atıştırmalık',
      icon: 'Cookie',
      color: 'bg-purple-100 text-purple-600',
      count: 12
    },
    {
      id: 'frozen',
      name: 'Dondurulmuş',
      icon: 'Snowflake',
      color: 'bg-cyan-100 text-cyan-600',
      count: 8
    }
  ];

  const displayCategories = categories && categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="px-4 py-4">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Kategoriler</h2>
        <button className="text-primary-600 text-sm font-medium">
          Tümünü Gör
        </button>
      </div>

      {/* Kategori Grid */}
      <div className="grid grid-cols-4 gap-3">
        {displayCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`
              flex flex-col items-center p-3 rounded-xl transition-all duration-200
              touch-manipulation relative group
              ${selectedCategory === category.id
                ? 'bg-primary-50 border-2 border-primary-500 shadow-mobile-sm'
                : 'bg-white border border-gray-200 hover:shadow-mobile-md hover:scale-105'
              }
            `}
          >
            {/* Kategori İkonu */}
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center mb-2
              transition-colors duration-200
              ${selectedCategory === category.id
                ? 'bg-primary-500 text-white'
                : category.color || 'bg-gray-100 text-gray-600'
              }
            `}>
              <Icon
                name={category.icon || 'Package'}
                size={20}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </div>

            {/* Kategori Adı */}
            <span className={`
              text-xs font-medium text-center line-clamp-2 leading-tight
              ${selectedCategory === category.id
                ? 'text-primary-700'
                : 'text-gray-700'
              }
            `}>
              {category.name}
            </span>

            {/* Ürün Sayısı */}
            {category.count && (
              <span className="text-xs text-gray-500 mt-0.5">
                {category.count}
              </span>
            )}

            {/* Seçili Kategori İndikatörü */}
            {selectedCategory === category.id && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full flex items-center justify-center">
                <Icon name="Check" size={8} className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Hızlı Filtreler */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Hızlı Filtreler</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'discount', label: 'İndirimli', icon: 'Percent' },
            { id: 'new', label: 'Yeni', icon: 'Sparkles' },
            { id: 'popular', label: 'Popüler', icon: 'TrendingUp' },
            { id: 'organic', label: 'Organik', icon: 'Leaf' }
          ].map((filter) => (
            <button
              key={filter.id}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 whitespace-nowrap transition-colors touch-manipulation"
            >
              <Icon name={filter.icon} size={14} />
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileCategoryGrid;
