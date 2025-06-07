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
    <div className="content-spacing no-horizontal-scroll">
      {/* Header Section with Responsive Layout */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 lg:gap-8">
        <div className="space-y-3 lg:space-y-4 min-w-0 flex-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight truncate">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-base lg:text-lg text-harvesters-600 leading-relaxed">
            Here's your spiritual journey overview
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <button
            onClick={() => setShowQRCode(!showQRCode)}
            className="flex items-center justify-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:ring-offset-2 font-medium text-sm lg:text-base whitespace-nowrap"
            aria-label={showQRCode ? 'Hide QR Code' : 'Show QR Code'}
          >
            {showQRCode ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />}
            <span className="truncate">{showQRCode ? 'Hide QR Code' : 'Show QR Code'}</span>
          </button>
        </div>
      </div>

      {/* High-Contrast QR Code Display with Responsive Layout */}
      {showQRCode && (
        <div className="flex justify-center py-6 lg:py-8">
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl border border-harvesters-200 card-padding max-w-sm w-full mx-4">
            <div className="text-center space-y-6 lg:space-y-8">
              <div className="bg-white p-6 lg:p-8 rounded-xl lg:rounded-2xl border-2 border-gray-200 inline-block shadow-inner">
                <QRCode 
                  value={user?.id || ''} 
                  size={200}
                  fgColor="#000000"
                  bgColor="#FFFFFF"
                  level="H"
                  includeMargin={false}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxWidth: '200px',
                    display: 'block'
                  }}
                />
              </div>
              
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900">Your Attendance QR Code</h3>
                <p className="text-sm text-harvesters-600 leading-relaxed">
                  Show this code to mark your attendance at church services and events
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center px-3 lg:px-4 py-1 lg:py-2 rounded-full text-xs font-medium bg-harvesters-100 text-harvesters-800">
                    High Contrast • Easily Scannable
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Dashboard Stats with Responsive Grid */}
      <div className="grid-responsive grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-harvesters-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className="card-padding">
              {/* Icon Container with Responsive Spacing */}
              <div className="flex items-center justify-center mb-6 lg:mb-8">
                <div className={`${stat.color} p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-lg group-hover:scale-105 transition-transform duration-200`}>
                  <stat.icon 
                    className="h-8 w-8 lg:h-10 lg:w-10 text-white" 
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </div>
              </div>
              
              {/* Content with Proper Spacing and Alignment */}
              <div className="text-center space-y-3 lg:space-y-4">
                <h3 className="text-xs lg:text-sm font-semibold text-harvesters-600 uppercase tracking-wider">
                  {stat.name}
                </h3>
                <p className="text-3xl lg:text-4xl font-bold text-gray-900 leading-none">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </div>
            
            {/* Visual Enhancement */}
            <div className="h-1 lg:h-2 bg-gradient-to-r from-harvesters-200 to-harvesters-400"></div>
          </div>
        ))}
      </div>

      {/* Activity Chart with Responsive Layout */}
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-harvesters-100 no-horizontal-scroll">
        <div className="card-padding border-b border-gray-100">
          <div className="space-y-2 lg:space-y-3">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Activity Overview</h2>
            <p className="text-sm text-harvesters-600 leading-relaxed">
              Your spiritual activities over the past week
            </p>
          </div>
        </div>
        
        <div className="card-padding">
          <div className="h-64 sm:h-80 lg:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={dashboardData?.recentActivity || []} 
                margin={{ 
                  top: 20, 
                  right: 20, 
                  left: 20, 
                  bottom: 20 
                }}
              >
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
                  radius={[8, 8, 0, 0]}
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