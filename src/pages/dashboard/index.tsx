import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QrCode, Calendar, Target, BookOpen, Eye, EyeOff } from 'lucide-react';
import { getWorkerDashboard } from '../../services';
import { useAuthStore } from '../../store/auth';
import QRCode from 'qrcode.react';

interface DashboardData {
  totalAttendance: number;
  habitCompletion: number;
  devotionalCount: number;
  recentActivity: {
    date: string;
    count: number;
  }[];
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [showQRCode, setShowQRCode] = useState(false);

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID not available');
      return await getWorkerDashboard(user.id);
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-harvesters-500"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Attendance',
      value: dashboardData?.totalAttendance || 0,
      icon: Calendar,
      color: 'bg-harvesters-600',
      description: 'Church services attended',
    },
    {
      name: 'Habit Completion',
      value: `${dashboardData?.habitCompletion || 0}%`,
      icon: Target,
      color: 'bg-harvesters-500',
      description: 'Spiritual habits completed',
    },
    {
      name: 'Devotionals Read',
      value: dashboardData?.devotionalCount || 0,
      icon: BookOpen,
      color: 'bg-harvesters-700',
      description: 'Daily devotionals completed',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-harvesters-600 mt-1">Here's your spiritual journey overview</p>
        </div>
        <button
          onClick={() => setShowQRCode(!showQRCode)}
          className="flex items-center justify-center px-6 py-3 bg-harvesters-600 text-white rounded-xl hover:bg-harvesters-700 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:ring-offset-2"
          aria-label={showQRCode ? 'Hide QR Code' : 'Show QR Code'}
        >
          {showQRCode ? <EyeOff className="w-5 h-5 mr-2" /> : <Eye className="w-5 h-5 mr-2" />}
          {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
        </button>
      </div>

      {/* High-Contrast QR Code Display */}
      {showQRCode && (
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-harvesters-200 p-8 max-w-sm w-full">
            <div className="text-center">
              <div className="bg-white p-5 rounded-xl border border-gray-200 inline-block">
                <QRCode 
                  value={user?.id || ''} 
                  size={200}
                  fgColor="#000000"
                  bgColor="#FFFFFF"
                  level="H"
                  includeMargin={false}
                  style={{
                    width: '200px',
                    height: '200px',
                    display: 'block'
                  }}
                />
              </div>
              <div className="mt-6 space-y-2">
                <h3 className="text-lg font-bold text-gray-900">Your Attendance QR Code</h3>
                <p className="text-sm text-harvesters-600 leading-relaxed">
                  Show this code to mark your attendance at church services and events
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-harvesters-100 text-harvesters-800">
                    High Contrast • Easily Scannable
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Dashboard Stats with Improved Icons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className="bg-white rounded-2xl shadow-lg border border-harvesters-100 hover:shadow-xl transition-all duration-200 overflow-hidden group"
            style={{ marginRight: index < stats.length - 1 ? '24px' : '0' }}
          >
            <div className="p-6">
              {/* Icon Container with High Contrast */}
              <div className="flex items-center justify-center mb-4">
                <div className={`${stat.color} p-4 rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-200`}>
                  <stat.icon 
                    className="h-8 w-8 text-white" 
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </div>
              </div>
              
              {/* Content with Proper Spacing */}
              <div className="text-center space-y-2">
                <h3 className="text-sm font-semibold text-harvesters-600 uppercase tracking-wide">
                  {stat.name}
                </h3>
                <p className="text-3xl font-bold text-gray-900 leading-none">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </div>
            
            {/* Progress indicator for visual enhancement */}
            <div className="h-1 bg-gradient-to-r from-harvesters-200 to-harvesters-400"></div>
          </div>
        ))}
      </div>

      {/* Activity Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-harvesters-100">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Activity Overview</h2>
          <p className="text-sm text-harvesters-600 mt-1">Your spiritual activities over the past week</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardData?.recentActivity || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MMM d')}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip
                labelFormatter={(value) => format(new Date(value), 'MMMM d, yyyy')}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '14px'
                }}
              />
              <Bar 
                dataKey="count" 
                fill="#977669" 
                radius={[8, 8, 0, 0]}
                name="Activities"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}