import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import storage from '../../../core/storage';
import Icon from '../AppIcon';

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { userProfile } = useAuth();

  // Real-time user data update
  useEffect(() => {
    const unsubscribe = storage.subscribe('currentUser', () => {
      // Force re-render when user data changes
      window.dispatchEvent(new Event('userDataUpdated'));
    });

    return unsubscribe;
  }, []);

  const navigationSections = [
    {
      section: 'Products',
      icon: 'Package',
      items: [
        {
          label: 'Product Management',
          path: '/product-management',
          icon: 'ShoppingBag'
        }
      ]
    },
    {
      section: 'Orders',
      icon: 'ClipboardList',
      items: [
        {
          label: 'Order Management',
          path: '/order-management',
          icon: 'FileText'
        }
      ]
    },
    {
      section: 'Account',
      icon: 'Settings',
      items: [
        {
          label: 'Profile Settings',
          path: '/user-profile-settings',
          icon: 'User'
        }
      ]
    }
  ];

  const isActive = (path) => location.pathname === path;

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-1000 p-2 bg-surface rounded-lg shadow-soft border border-border"
      >
        <Icon name={isMobileOpen ? 'X' : 'Menu'} size={20} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-997"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-surface border-r border-border z-998 transition-all duration-300
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {!isCollapsed && (
              <Link to="/product-management" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <Icon name="Leaf" size={16} className="text-white" />
                </div>
                <span className="text-lg font-semibold text-text-primary">
                  Admin Panel
                </span>
              </Link>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-1.5 rounded-lg hover:bg-background transition-smooth"
            >
              <Icon
                name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'}
                size={16}
                className="text-text-secondary"
              />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {navigationSections.map((section) => (
              <div key={section.section}>
                {!isCollapsed && (
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                    {section.section}
                  </h3>
                )}

                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMobile}
                      className={`
                        flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-smooth group
                        ${isActive(item.path)
                          ? 'bg-primary text-white shadow-soft'
                          : 'text-text-secondary hover:text-text-primary hover:bg-background'
                        }
                      `}
                    >
                      <Icon
                        name={item.icon}
                        size={20}
                        strokeWidth={isActive(item.path) ? 2.5 : 2}
                      />
                      {!isCollapsed && (
                        <span className="font-medium">
                          {item.label}
                        </span>
                      )}

                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <Icon name="User" size={16} className="text-white" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {userProfile?.name || userProfile?.full_name || 'Admin'}
                  </p>
                  <p className="text-xs text-text-secondary truncate">
                    {userProfile?.email || 'admin@kirilmazlar.com'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
