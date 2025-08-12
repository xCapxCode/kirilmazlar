const MobilePromoCard = ({
  title = "Hafta Sonu",
  subtitle = "%25 İndirim",
  description = "Tüm Ürünlerde",
  icon = "🛒",
  bgColor = "from-green-100 to-green-50",
  iconBgColor = "bg-green-200"
}) => {
  return (
    <div className={`bg-gradient-to-r ${bgColor} rounded-3xl p-6 mb-6 relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-green-600 font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{subtitle}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className={`w-24 h-24 ${iconBgColor} rounded-2xl flex items-center justify-center`}>
          <span className="text-4xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default MobilePromoCard;