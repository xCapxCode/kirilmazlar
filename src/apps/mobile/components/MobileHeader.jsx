
const MobileHeader = ({ showLogo = true }) => {
  return (
    <div className="bg-white shadow-sm">
      <div className="px-4 py-6">
        {/* Logo Ortalı */}
        <div className="flex items-center justify-center">
          {showLogo && (
            <img
              src="/assets/images/logo/KirilmazlarLogo.png"
              alt="Kırılmazlar"
              className="h-16 w-auto max-w-[280px] object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;