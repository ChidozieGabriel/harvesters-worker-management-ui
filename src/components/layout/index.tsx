import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Menu, X, Home, Users, Briefcase, Building2, Book, Activity, User } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin, logout } = useAuthStore();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <div className="lg:hidden">
        <button
          className="fixed top-4 left-4 p-2 rounded-md bg-gray-800 text-white"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:block transition-transform duration-300
      `}>
        <div className="h-full flex flex-col">
          <div className="flex-1 py-6 overflow-y-auto">
            <nav className="px-4 space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="lg:pl-64">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}