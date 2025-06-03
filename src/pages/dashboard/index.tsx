import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QrCode, Calendar, Users, BookOpen } from 'lucide-react';
import api from '../../lib/api';
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
      const response = await api.get(`/api/Dashboard/${user?.id}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Attendance',
      value: dashboardData?.totalAttendance || 0,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      name: 'Habit Completion',
      value: `${dashboardData?.habitCompletion || 0}%`,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Devotionals Read',
      value: dashboardData?.devotionalCount || 0,
      icon: BookOpen,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.email}</h1>
        <button
          onClick={() => setShowQRCode(!showQRCode)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <QrCode className="w-5 h-5 mr-2" />
          {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
        </button>
      </div>

      {showQRCode && (
        <div className="flex justify-center p-6 bg-white rounded-lg shadow">
          <QRCode value={user?.id || ''} size={200} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow p-6 flex items-center space-x-4"
          >
            <div className={`${stat.color} p-3 rounded-full`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardData?.recentActivity || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MMM d')}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => format(new Date(value), 'MMMM d, yyyy')}
              />
              <Bar dataKey="count" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}