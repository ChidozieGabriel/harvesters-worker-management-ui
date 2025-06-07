import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QrCode, Calendar, Users, BookOpen } from 'lucide-react';
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
    },
    {
      name: 'Habit Completion',
      value: `${dashboardData?.habitCompletion || 0}%`,
      icon: Users,
      color: 'bg-harvesters-500',
    },
    {
      name: 'Devotionals Read',
      value: dashboardData?.devotionalCount || 0,
      icon: BookOpen,
      color: 'bg-harvesters-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-harvesters-600 mt-1">Here's your spiritual journey overview</p>
        </div>
        <button
          onClick={() => setShowQRCode(!showQRCode)}
          className="flex items-center px-6 py-3 bg-harvesters-600 text-white rounded-xl hover:bg-harvesters-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <QrCode className="w-5 h-5 mr-2" />
          {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
        </button>
      </div>

      {showQRCode && (
        <div className="flex justify-center p-8 bg-white rounded-2xl shadow-lg border border-harvesters-100">
          <div className="text-center">
            <QRCode 
              value={user?.id || ''} 
              size={200} 
              fgColor="#977669"
              bgColor="#ffffff"
              level="M"
              includeMargin={true}
            />
            <p className="mt-4 text-sm text-harvesters-600 font-medium">
              Your personal QR code for attendance
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-2xl shadow-lg p-6 flex items-center space-x-4 border border-harvesters-100 hover:shadow-xl transition-shadow duration-200"
          >
            <div className={`${stat.color} p-3 rounded-xl`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-harvesters-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-harvesters-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Activity Overview</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardData?.recentActivity || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MMM d')}
                stroke="#6b7280"
              />
              <YAxis stroke="#6b7280" />
              <Tooltip
                labelFormatter={(value) => format(new Date(value), 'MMMM d, yyyy')}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="count" fill="#977669" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}