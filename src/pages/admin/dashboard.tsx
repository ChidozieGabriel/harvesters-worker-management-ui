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
    <div className="space-y-12">
      {/* Header Section with Professional Spacing and Alignment */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8">
        <div className="space-y-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Admin Dashboard
          </h1>
          <p className="text-lg text-harvesters-600 max-w-2xl leading-relaxed">
            Overview of church activities and management
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <button
            onClick={handleExportReport}
            className="flex items-center px-8 py-4 bg-harvesters-600 text-white rounded-2xl hover:bg-harvesters-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            <Download className="w-5 h-5 mr-3" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid with Consistent Spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-3xl shadow-lg border border-harvesters-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className="p-8">
              <div className="flex items-center space-x-6">
                <div className={`${stat.color} p-4 rounded-2xl group-hover:scale-105 transition-transform duration-200`}>
                  <stat.icon className="h-8 w-8 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-harvesters-600 uppercase tracking-wider truncate">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 leading-tight">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-harvesters-200 to-harvesters-400"></div>
          </div>
        ))}
      </div>

      {/* Charts Grid with Professional Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* Activity Timeline Chart */}
        <div className="bg-white rounded-3xl shadow-lg border border-harvesters-100">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Activity Timeline</h2>
            <p className="text-sm text-harvesters-600 mt-2">
              Daily attendance and habit completion trends
            </p>
          </div>
          <div className="p-8">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData?.activityTimeline || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                    stroke="#6b7280"
                    fontSize={12}
                    tickMargin={16}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} tickMargin={16} />
                  <Tooltip
                    labelFormatter={(value) => format(new Date(value), 'MMMM d, yyyy')}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '16px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      padding: '16px'
                    }}
                  />
                  <Bar dataKey="attendance" name="Attendance" fill="#977669" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="habits" name="Habits" fill="#bfa094" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Department Distribution Chart */}
        <div className="bg-white rounded-3xl shadow-lg border border-harvesters-100">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Department Distribution</h2>
            <p className="text-sm text-harvesters-600 mt-2">
              Worker distribution across departments
            </p>
          </div>
          <div className="p-8">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData?.departmentStats || []}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
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
                      borderRadius: '16px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      padding: '16px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}