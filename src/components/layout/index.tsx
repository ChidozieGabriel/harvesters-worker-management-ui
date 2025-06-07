import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Menu, X, Home, Users, Briefcase, Building2, Book, Activity, User, LogOut } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin, logout, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    ...(isAdmin() ? [
      { name: 'Workers', href: '/admin/workers', icon: Users },
      { name: 'Teams', href: '/admin/teams', icon: Briefcase },
      { name: 'Departments', href: '/admin/departments', icon: Building2 },
    ] : []),
    { name: 'Devotionals', href: '/devotionals', icon: Book },
    { name: 'Habits', href: '/habits', icon: Activity },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (href: string) => {
    navigate(href);
    setSidebarOpen(false);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header Navigation */}
      <header className="hidden lg:block bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.svg" 
                alt="Church CRM Logo" 
                className="h-8 w-auto"
                onError={(e) => {
                  // Fallback to PNG if SVG fails
                  e.currentTarget.src = '/logo-192.png';
                }}
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Church CRM</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="flex space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigate(item.href)}
                    className={`
                      flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className={`mr-2 h-4 w-4 ${isActive ? 'text-indigo-700' : 'text-gray-400'}`} />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* User Profile and Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="hidden xl:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.email || 'User'
                    }
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role?.toLowerCase() || 'Member'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-2 hidden xl:block">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 lg:hidden transition-colors duration-200"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-controls="sidebar"
        aria-expanded={sidebarOpen}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        <span className="sr-only">{sidebarOpen ? 'Close sidebar' : 'Open sidebar'}</span>
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.svg" 
                alt="Church CRM Logo" 
                className="h-8 w-auto"
                onError={(e) => {
                  // Fallback to PNG if SVG fails
                  e.currentTarget.src = '/logo-192.png';
                }}
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Church CRM</h1>
                <p className="text-sm text-gray-500">Worker Management</p>
              </div>
            </div>
            
            <button
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              onClick={closeSidebar}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mobile User info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.email || 'User'
                  }
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role?.toLowerCase() || 'Member'}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.href)}
                  className={`
                    flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-indigo-700' : 'text-gray-400'}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Mobile Logout button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pt-0">
        <main className="p-6 min-h-screen lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}