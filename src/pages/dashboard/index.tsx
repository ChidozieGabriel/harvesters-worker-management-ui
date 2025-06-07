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
    <div className="space-y-12">
      {/* Header Section with Professional Spacing */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8">
        <div className="space-y-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-lg text-harvesters-600 max-w-2xl leading-relaxed">
            Here's your spiritual journey overview
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <button
            onClick={() => setShowQRCode(!showQRCode)}
            className="flex items-center justify-center px-8 py-4 bg-harvesters-600 text-white rounded-2xl hover:bg-harvesters-700 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:ring-offset-2 font-medium"
            aria-label={showQRCode ? 'Hide QR Code' : 'Show QR Code'}
          >
            {showQRCode ? <EyeOff className="w-5 h-5 mr-3" /> : <Eye className="w-5 h-5 mr-3" />}
            {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
          </button>
        </div>
      </div>

      {/* High-Contrast QR Code Display with Professional Layout */}
      {showQRCode && (
        <div className="flex justify-center py-8">
          <div className="bg-white rounded-3xl shadow-2xl border border-harvesters-200 p-12 max-w-md w-full">
            <div className="text-center space-y-8">
              <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 inline-block shadow-inner">
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
              
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Your Attendance QR Code</h3>
                <p className="text-sm text-harvesters-600 leading-relaxed max-w-xs mx-auto">
                  Show this code to mark your attendance at church services and events
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-harvesters-100 text-harvesters-800">
                    High Contrast • Easily Scannable
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Dashboard Stats with Grid System */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className="bg-white rounded-3xl shadow-lg border border-harvesters-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className="p-8">
              {/* Icon Container with Professional Spacing */}
              <div className="flex items-center justify-center mb-8">
                <div className={`${stat.color} p-6 rounded-3xl shadow-lg group-hover:scale-105 transition-transform duration-200`}>
                  <stat.icon 
                    className="h-10 w-10 text-white" 
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </div>
              </div>
              
              {/* Content with Proper Spacing and Alignment */}
              <div className="text-center space-y-4">
                <h3 className="text-sm font-semibold text-harvesters-600 uppercase tracking-wider">
                  {stat.name}
                </h3>
                <p className="text-4xl font-bold text-gray-900 leading-none">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </div>
            
            {/* Visual Enhancement with Consistent Spacing */}
            <div className="h-2 bg-gradient-to-r from-harvesters-200 to-harvesters-400"></div>
          </div>
        ))}
      </div>

      {/* Activity Chart with Professional Layout */}
      <div className="bg-white rounded-3xl shadow-lg border border-harvesters-100">
        <div className="p-8 border-b border-gray-100">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Activity Overview</h2>
            <p className="text-sm text-harvesters-600 leading-relaxed">
              Your spiritual activities over the past week
            </p>
          </div>
        </div>
        
        <div className="p-8">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.recentActivity || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  stroke="#6b7280"
                  fontSize={12}
                  tickMargin={16}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickMargin={16}
                />
                <Tooltip
                  labelFormatter={(value) => format(new Date(value), 'MMMM d, yyyy')}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: '14px',
                    padding: '16px'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#977669" 
                  radius={[12, 12, 0, 0]}
                  name="Activities"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}