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

const COLORS = ['#977669', '#bfa094', '#d2bab0', '#e0cec7'];

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-harvesters-500"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Workers',
      value: dashboardData?.totalWorkers || 0,
      icon: Users,
      color: 'bg-harvesters-600',
    },
    {
      name: 'Departments',
      value: dashboardData?.totalDepartments || 0,
      icon: Building2,
      color: 'bg-harvesters-500',
    },
    {
      name: 'Teams',
      value: dashboardData?.totalTeams || 0,
      icon: Briefcase,
      color: 'bg-harvesters-400',
    },
    {
      name: 'Attendance Rate',
      value: `${dashboardData?.attendanceRate || 0}%`,
      icon: TrendingUp,
      color: 'bg-harvesters-700',
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-harvesters-600 mt-1">Overview of church activities and management</p>
        </div>
        <button
          onClick={handleExportReport}
          className="flex items-center px-6 py-3 bg-harvesters-600 text-white rounded-xl hover:bg-harvesters-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Download className="w-5 h-5 mr-2" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-harvesters-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Activity Timeline</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.activityTimeline || []}>
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
                <Bar dataKey="attendance" name="Attendance" fill="#977669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="habits" name="Habits" fill="#bfa094" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-harvesters-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Department Distribution</h2>
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
                  labelLine={false}
                >
                  {dashboardData?.departmentStats.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}