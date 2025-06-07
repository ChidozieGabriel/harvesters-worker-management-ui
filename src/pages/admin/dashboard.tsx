import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  Download,
} from 'lucide-react';
import { getWorkerActivitySummary, exportSummaryReport } from '../../services';

interface AdminDashboardData {
  totalWorkers: number;
  totalDepartments: number;
  totalTeams: number;
  attendanceRate: number;
  departmentStats: {
    name: string;
    count: number;
  }[];
  activityTimeline: {
    date: string;
    attendance: number;
    habits: number;
  }[];
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export default function AdminDashboard() {
  const { data: dashboardData, isLoading } = useQuery<AdminDashboardData>({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      return await getWorkerActivitySummary({
        isAdmin: true,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
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
      name: 'Total Workers',
      value: dashboardData?.totalWorkers || 0,
      icon: Users,
      color: 'bg-indigo-500',
    },
    {
      name: 'Departments',
      value: dashboardData?.totalDepartments || 0,
      icon: Building2,
      color: 'bg-green-500',
    },
    {
      name: 'Teams',
      value: dashboardData?.totalTeams || 0,
      icon: Briefcase,
      color: 'bg-yellow-500',
    },
    {
      name: 'Attendance Rate',
      value: `${dashboardData?.attendanceRate || 0}%`,
      icon: TrendingUp,
      color: 'bg-red-500',
    },
  ];

  const handleExportReport = async () => {
    try {
      const blob = await exportSummaryReport({
        isAdmin: true,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={handleExportReport}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Download className="w-5 h-5 mr-2" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.activityTimeline || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => format(new Date(value), 'MMMM d, yyyy')}
                />
                <Bar dataKey="attendance" name="Attendance" fill="#4F46E5" />
                <Bar dataKey="habits" name="Habits" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData?.departmentStats || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => entry.name}
                >
                  {dashboardData?.departmentStats.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}