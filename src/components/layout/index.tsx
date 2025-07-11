import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu as MenuComponent, Disclosure, Transition } from '@headlessui/react';
import { useAuthStore } from '../../store/auth';
import { Menu, X, Home, Users, Briefcase, Book, User, LogOut, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import Logo from '../ui/Logo';
import navigationService from '../../services/navigation';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

interface NavigationGroup {
  name: string;
  icon: React.ComponentType<any>;
  children: NavigationItem[];
}

type NavigationEntry = NavigationItem | NavigationGroup;

function isNavigationGroup(item: NavigationEntry): item is NavigationGroup {
  return 'children' in item;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin, logout, user } = useAuthStore();
  const location = useLocation();

  const navigation: NavigationEntry[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    ...(isAdmin() ? [
      {
        name: 'Admin Hub',
        icon: Users,
        children: [
          { name: 'Overview', href: '/admin', icon: Home },
          { name: 'Workers', href: '/admin/workers', icon: Users },
          { name: 'Teams & Departments', href: '/admin/teams', icon: Briefcase },
          { name: 'Habit Management', href: '/admin/habit-management', icon: Settings },
        ]
      } as NavigationGroup,
    ] : []),
    { name: 'Devotionals', href: '/devotionals', icon: Book },
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
    // Navigation is handled by the auth store using navigationService
  };

  const handleNavigate = (href: string) => {
    navigationService.navigateTo(href);
    setSidebarOpen(false);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Check if any child route is active for grouped navigation
  const isGroupActive = (group: NavigationGroup) => {
    return group.children.some(child => location.pathname === child.href);
  };

  // Check if a single navigation item is active
  const isItemActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gray-50 no-horizontal-scroll">
      {/* Desktop Header Navigation */}
      <header className="hidden lg:block bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container-responsive">
          <div className="flex justify-between items-center h-16 lg:h-20 xl:h-24">
            {/* Logo and Brand */}
            <div className="flex items-center flex-shrink-0">
              <Logo size="sm" className="text-harvesters-700" />
            </div>

            {/* Desktop Navigation - Responsive spacing */}
            <nav className="flex items-center space-x-1 lg:space-x-2 xl:space-x-3 flex-no-overflow">
              {navigation.map((item) => {
                if (isNavigationGroup(item)) {
                  const isActive = isGroupActive(item);
                  return (
                    <MenuComponent key={item.name} as="div" className="relative">
                      <MenuComponent.Button
                        className={`
                          flex items-center px-3 py-2 lg:px-4 lg:py-3 xl:px-6 xl:py-3 text-xs lg:text-sm font-medium rounded-lg lg:rounded-xl transition-all duration-200 whitespace-nowrap
                          ${isActive 
                            ? 'bg-harvesters-50 text-harvesters-700 border border-harvesters-200 shadow-sm' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                          }
                        `}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <item.icon className={`mr-2 lg:mr-3 h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0 ${isActive ? 'text-harvesters-700' : 'text-gray-400'}`} />
                        <span className="truncate">{item.name}</span>
                        <ChevronDown className={`ml-1 lg:ml-2 h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0 ${isActive ? 'text-harvesters-700' : 'text-gray-400'}`} />
                      </MenuComponent.Button>

                      <Transition
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <MenuComponent.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl lg:rounded-2xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200">
                          <div className="py-2">
                            {item.children.map((child) => {
                              const isChildActive = isItemActive(child.href);
                              return (
                                <MenuComponent.Item key={child.name}>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleNavigate(child.href)}
                                      className={`
                                        flex items-center w-full px-4 py-3 text-sm font-medium transition-all duration-200
                                        ${isChildActive
                                          ? 'bg-harvesters-50 text-harvesters-700 border-r-2 border-harvesters-700'
                                          : active
                                          ? 'bg-gray-50 text-gray-900'
                                          : 'text-gray-600'
                                        }
                                      `}
                                    >
                                      <child.icon className={`mr-3 h-4 w-4 flex-shrink-0 ${isChildActive ? 'text-harvesters-700' : 'text-gray-400'}`} />
                                      <span className="truncate">{child.name}</span>
                                    </button>
                                  )}
                                </MenuComponent.Item>
                              );
                            })}
                          </div>
                        </MenuComponent.Items>
                      </Transition>
                    </MenuComponent>
                  );
                } else {
                  const isActive = isItemActive(item.href);
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigate(item.href)}
                      className={`
                        flex items-center px-3 py-2 lg:px-4 lg:py-3 xl:px-6 xl:py-3 text-xs lg:text-sm font-medium rounded-lg lg:rounded-xl transition-all duration-200 whitespace-nowrap
                        ${isActive 
                          ? 'bg-harvesters-50 text-harvesters-700 border border-harvesters-200 shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon className={`mr-2 lg:mr-3 h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0 ${isActive ? 'text-harvesters-700' : 'text-gray-400'}`} />
                      <span className="truncate">{item.name}</span>
                    </button>
                  );
                }
              })}
            </nav>

            {/* User Profile and Logout - Responsive */}
            <div className="flex items-center space-x-3 lg:space-x-4 xl:space-x-6 flex-shrink-0">
              <div className="flex items-center space-x-2 lg:space-x-3 xl:space-x-4 min-w-0">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-harvesters-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 lg:w-5 lg:h-5 text-harvesters-600" />
                </div>
                <div className="hidden xl:block min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-harvesters-600 capitalize truncate">
                    {user?.role?.toLowerCase() || 'Member'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg lg:rounded-xl transition-all duration-200 whitespace-nowrap"
              >
                <LogOut className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                <span className="ml-2 hidden xl:block">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 lg:top-6 lg:left-6 z-50 p-2 lg:p-3 rounded-lg lg:rounded-xl bg-white shadow-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 lg:hidden transition-colors duration-200"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-controls="sidebar"
        aria-expanded={sidebarOpen}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
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

      {/* Mobile Sidebar - Responsive width */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden no-horizontal-scroll
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-6 lg:p-8 border-b border-gray-200 bg-harvesters-50">
            <Logo size="sm" className="text-harvesters-700" />
            
            <button
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              onClick={closeSidebar}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mobile User info */}
          <div className="p-6 lg:p-8 border-b border-gray-200 bg-gradient-to-r from-harvesters-50 to-harvesters-100">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-harvesters-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 lg:w-6 lg:h-6 text-harvesters-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-harvesters-600 capitalize truncate">
                  {user?.role?.toLowerCase() || 'Member'}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-4 sm:px-6 py-6 lg:py-8 space-y-2 lg:space-y-3 overflow-y-auto">
            {navigation.map((item) => {
              if (isNavigationGroup(item)) {
                const isActive = isGroupActive(item);
                return (
                  <Disclosure key={item.name} defaultOpen={isActive}>
                    {({ open }) => (
                      <>
                        <Disclosure.Button
                          className={`
                            flex items-center justify-between w-full px-4 sm:px-6 py-3 lg:py-4 text-sm font-medium rounded-lg lg:rounded-xl transition-all duration-200
                            ${isActive 
                              ? 'bg-harvesters-50 text-harvesters-700 border-r-2 border-harvesters-700' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }
                          `}
                        >
                          <div className="flex items-center space-x-3 lg:space-x-4">
                            <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-harvesters-700' : 'text-gray-400'}`} />
                            <span className="truncate">{item.name}</span>
                          </div>
                          <ChevronRight
                            className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${
                              open ? 'rotate-90' : ''
                            } ${isActive ? 'text-harvesters-700' : 'text-gray-400'}`}
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel className="mt-2 space-y-1">
                          {item.children.map((child) => {
                            const isChildActive = isItemActive(child.href);
                            return (
                              <button
                                key={child.name}
                                onClick={() => handleNavigate(child.href)}
                                className={`
                                  flex items-center w-full pl-12 pr-4 sm:pr-6 py-2 lg:py-3 text-sm font-medium rounded-lg lg:rounded-xl transition-all duration-200
                                  ${isChildActive 
                                    ? 'bg-harvesters-100 text-harvesters-700 border-r-2 border-harvesters-700' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                  }
                                `}
                                aria-current={isChildActive ? 'page' : undefined}
                              >
                                <child.icon className={`mr-3 lg:mr-4 h-4 w-4 flex-shrink-0 ${isChildActive ? 'text-harvesters-700' : 'text-gray-400'}`} />
                                <span className="truncate">{child.name}</span>
                              </button>
                            );
                          })}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                );
              } else {
                const isActive = isItemActive(item.href);
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigate(item.href)}
                    className={`
                      flex items-center w-full px-4 sm:px-6 py-3 lg:py-4 text-sm font-medium rounded-lg lg:rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-harvesters-50 text-harvesters-700 border-r-2 border-harvesters-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className={`mr-3 lg:mr-4 h-5 w-5 flex-shrink-0 ${isActive ? 'text-harvesters-700' : 'text-gray-400'}`} />
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              }
            })}
          </nav>

          {/* Mobile Logout button */}
          <div className="p-4 sm:p-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 sm:px-6 py-3 lg:py-4 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg lg:rounded-xl transition-all duration-200"
            >
              <LogOut className="mr-3 lg:mr-4 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content with responsive container system */}
      <div className="lg:pt-0 no-horizontal-scroll">
        <main className="section-spacing lg:pt-8 xl:pt-12">
          <div className="container-responsive">
            <div className="content-spacing">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}