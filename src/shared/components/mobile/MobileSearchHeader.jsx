import { useEffect, useRef, useState } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import Icon from '../AppIcon';

const MobileSearchHeader = ({
  onSearch,
  searchQuery = '',
  placeholder = 'Ürün, marka ara...',
  showLocationSelector = true,
  location = 'İstanbul, Türkiye'
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const { showSuccess } = useNotification();
  const searchInputRef = useRef(null);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      onSearch(localSearchQuery.trim());
      searchInputRef.current?.blur();
    }
  };

  const handleSearchClear = () => {
    setLocalSearchQuery('');
    onSearch('');
    searchInputRef.current?.focus();
  };

  const handleLocationChange = () => {
    showSuccess('Konum değiştirme özelliği yakında gelecek!');
  };

  const handleNotificationClick = () => {
    // NotificationDropdown mobilde farklı şekilde açılacak
    showSuccess('Bildirimler açılıyor...');
  };

  return (
    <div className="md:hidden bg-white border-b border-gray-200 safe-area-inset">
      {/* Ana Header */}
      <div className="px-4 py-3">
        {/* Logo ve Konum */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Icon name="ShoppingCart" size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-none">
                  Kırılmazlar
                </h1>
                <p className="text-xs text-gray-500 leading-none mt-0.5">
                  Market
                </p>
              </div>
            </div>
          </div>

          {/* Sağ Taraf - Bildirim */}
          <button
            onClick={handleNotificationClick}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
          >
            <Icon name="Bell" size={20} className="text-gray-600" />
            {/* Bildirim Badge */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </button>
        </div>

        {/* Konum Seçici */}
        {showLocationSelector && (
          <button
            onClick={handleLocationChange}
            className="flex items-center gap-2 mb-4 p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation"
          >
            <Icon name="MapPin" size={16} className="text-primary-500" />
            <div className="flex-1 text-left">
              <p className="text-xs text-gray-500">Teslimat Konumu</p>
              <p className="text-sm font-medium text-gray-900 truncate">{location}</p>
            </div>
            <Icon name="ChevronDown" size={16} className="text-gray-400" />
          </button>
        )}

        {/* Arama Çubuğu */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className={`
            flex items-center bg-gray-50 rounded-xl border-2 transition-all duration-200
            ${isSearchFocused
              ? 'border-primary-300 bg-white shadow-mobile-sm'
              : 'border-transparent'
            }
          `}>
            {/* Arama İkonu */}
            <div className="pl-4 pr-3">
              <Icon name="Search" size={18} className="text-gray-400" />
            </div>

            {/* Arama Input */}
            <input
              ref={searchInputRef}
              type="search"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder={placeholder}
              className="flex-1 py-3 text-base bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-no-zoom"
              autoComplete="off"
            />

            {/* Temizle Butonu */}
            {localSearchQuery && (
              <button
                type="button"
                onClick={handleSearchClear}
                className="p-2 mr-2 rounded-full hover:bg-gray-200 transition-colors touch-manipulation"
              >
                <Icon name="X" size={16} className="text-gray-400" />
              </button>
            )}

            {/* Filtre Butonu */}
            <button
              type="button"
              className="p-2 mr-2 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation"
            >
              <Icon name="SlidersHorizontal" size={18} className="text-gray-600" />
            </button>
          </div>
        </form>
      </div>

      {/* Promosyon Banner */}
      <div className="mx-4 mb-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-base mb-1">
              %30'a varan indirim!
            </h3>
            <p className="text-sm text-primary-100">
              Her gün yeni fırsatlar sizi bekliyor
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors touch-manipulation">
              Keşfet
            </button>
          </div>
          {/* Dekoratif İkon */}
          <div className="absolute right-2 bottom-2 opacity-20">
            <Icon name="ShoppingBag" size={32} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSearchHeader;
