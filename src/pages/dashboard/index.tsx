import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QrCode, Calendar, Target, BookOpen, Eye, EyeOff, CheckCircle, Clock, Heart, Zap, DollarSign, Plus } from 'lucide-react';
import { getWorkerDashboard, getHabits, updateHabit } from '../../services';
import { useAuthStore } from '../../store/auth';
import { Habit, HabitType } from '../../types/api';
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

// Configuration for habit types with user-friendly labels and icons
const habitTypeConfig = {
  [HabitType.BibleStudy]: {
    label: 'Bible Study',
    description: 'Daily Bible reading and study',
    icon: BookOpen,
    color: 'bg-blue-500',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    unit: 'minutes'
  },
  [HabitType.NLPPrayer]: {
    label: 'Prayer',
    description: 'Prayer and meditation time',
    icon: Heart,
    color: 'bg-purple-500',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    unit: 'minutes'
  },
  [HabitType.Giving]: {
    label: 'Giving',
    description: 'Financial contributions and tithing',
    icon: DollarSign,
    color: 'bg-green-500',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    unit: 'amount'
  },
  [HabitType.Fasting]: {
    label: 'Fasting',
    description: 'Spiritual fasting practices',
    icon: Zap,
    color: 'bg-orange-500',
    borderColor: 'border-orange-200',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    unit: 'hours'
  },
  [HabitType.Devotionals]: {
    label: 'Devotionals',
    description: 'Daily devotional reading',
    icon: Target,
    color: 'bg-indigo-500',
    borderColor: 'border-indigo-200',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    unit: 'sessions'
  }
};

interface HabitCompletionForm {
  notes: string;
  amount: number;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [showQRCode, setShowQRCode] = useState(false);
  const [completingHabit, setCompletingHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState<HabitCompletionForm>({ notes: '', amount: 0 });
  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID not available');
      return await getWorkerDashboard(user.id);
    },
    enabled: !!user?.id,
  });

  // Fetch all habits
  const { data: habits = [], isLoading: habitsLoading } = useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: getHabits,
  });

  // Complete habit mutation
  const completeHabitMutation = useMutation({
    mutationFn: ({ habit, data }: { habit: Habit; data: HabitCompletionForm }) =>
      updateHabit(habit.id, {
        id: habit.id,
        type: habit.type,
        completedAt: new Date().toISOString(),
        notes: data.notes || habit.notes,
        amount: data.amount || habit.amount,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Habit completed successfully! 🎉');
      setCompletingHabit(null);
      setFormData({ notes: '', amount: 0 });
    },
    onError: (error) => {
      toast.error(`Failed to complete habit: ${error.message}`);
    },
  });

  const handleCompleteHabit = (habit: Habit) => {
    setCompletingHabit(habit);
    setFormData({
      notes: habit.notes || '',
      amount: habit.amount || 0,
    });
  };

  const handleSubmitCompletion = () => {
    if (completingHabit) {
      completeHabitMutation.mutate({
        habit: completingHabit,
        data: formData,
      });
    }
  };

  const handleCancelCompletion = () => {
    setCompletingHabit(null);
    setFormData({ notes: '', amount: 0 });
  };

  const isCompletedToday = (habit: Habit) => {
    if (!habit.completedAt) return false;
    const completedDate = new Date(habit.completedAt);
    const today = new Date();
    return completedDate.toDateString() === today.toDateString();
  };

  if (dashboardLoading) {
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
      {/* My Spiritual Habits Section - Prominent at Top */}
      <div className="bg-gradient-to-br from-harvesters-50 via-white to-harvesters-100 rounded-3xl lg:rounded-4xl shadow-2xl border-2 border-harvesters-200 overflow-hidden mb-12 lg:mb-16">
        <div className="card-padding border-b border-harvesters-200 bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 lg:gap-6">
            <div className="space-y-2 lg:space-y-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                My Spiritual Habits
              </h2>
              <p className="text-base lg:text-lg text-harvesters-600 leading-relaxed">
                Track your daily spiritual practices and build consistent habits
              </p>
            </div>
            
            {habits.length > 0 && (
              <div className="flex items-center space-x-3 lg:space-x-4 text-sm lg:text-base">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">
                    {habits.filter(isCompletedToday).length} completed today
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-600">
                    {habits.length - habits.filter(isCompletedToday).length} remaining
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Completion Modal */}
        {completingHabit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="card-padding border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className={`${habitTypeConfig[completingHabit.type].color} p-3 rounded-xl text-white`}>
                    {React.createElement(habitTypeConfig[completingHabit.type].icon, { className: "w-6 h-6" })}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Complete {habitTypeConfig[completingHabit.type].label}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {habitTypeConfig[completingHabit.type].description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-padding space-y-6">
                {/* Amount Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Amount ({habitTypeConfig[completingHabit.type].unit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full button-padding border border-gray-300 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent"
                    placeholder={`Enter ${habitTypeConfig[completingHabit.type].unit}`}
                  />
                </div>

                {/* Notes Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full button-padding border border-gray-300 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent resize-none"
                    placeholder="Add any notes about this habit completion..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={handleSubmitCompletion}
                    disabled={completeHabitMutation.isPending}
                    className="flex items-center justify-center button-padding bg-harvesters-600 text-white rounded-xl hover:bg-harvesters-700 disabled:bg-harvesters-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm"
                  >
                    {completeHabitMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Completing...
                      </div>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Completed
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleCancelCompletion}
                    className="flex items-center justify-center button-padding border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Habits Content */}
        <div className="card-padding">
          {habitsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-harvesters-500"></div>
            </div>
          ) : habits.length === 0 ? (
            <div className="text-center py-12 lg:py-16">
              <Target className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-4 lg:mb-6" />
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 lg:mb-3">
                No habits available
              </h3>
              <p className="text-sm lg:text-base text-gray-600">
                Contact your administrator to set up spiritual habits for tracking.
              </p>
            </div>
          ) : (
            <div className="grid-responsive grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {habits.map((habit) => {
                const config = habitTypeConfig[habit.type];
                const completedToday = isCompletedToday(habit);
                
                return (
                  <div
                    key={habit.id}
                    className={`bg-white rounded-2xl lg:rounded-3xl shadow-lg border-2 transition-all duration-300 overflow-hidden group hover:shadow-xl
                      ${completedToday 
                        ? `${config.borderColor} ${config.bgColor}` 
                        : 'border-gray-200 hover:border-harvesters-200'
                      }`}
                  >
                    <div className="card-padding">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4 lg:mb-6">
                        <div className={`${config.color} p-3 lg:p-4 rounded-xl lg:rounded-2xl text-white group-hover:scale-105 transition-transform duration-200`}>
                          <config.icon className="w-6 h-6 lg:w-7 lg:h-7" />
                        </div>
                        
                        {completedToday && (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-3 lg:space-y-4 mb-6 lg:mb-8">
                        <div>
                          <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1">
                            {config.label}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {config.description}
                          </p>
                        </div>

                        {habit.amount && (
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-harvesters-600" />
                            <span className="text-sm text-gray-700">
                              Target: {habit.amount} {config.unit}
                            </span>
                          </div>
                        )}

                        {habit.notes && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {habit.notes}
                          </p>
                        )}

                        {habit.completedAt && (
                          <div className="flex items-center space-x-2 text-xs text-harvesters-600">
                            <Clock className="w-3 h-3" />
                            <span>
                              Last completed: {format(new Date(habit.completedAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleCompleteHabit(habit)}
                        disabled={completedToday || completeHabitMutation.isPending}
                        className={`w-full flex items-center justify-center button-padding rounded-xl lg:rounded-2xl font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl
                          ${completedToday
                            ? `${config.textColor} ${config.bgColor} cursor-default`
                            : 'bg-harvesters-600 text-white hover:bg-harvesters-700 disabled:bg-harvesters-400 disabled:cursor-not-allowed'
                          }`}
                      >
                        {completedToday ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Completed Today
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Mark as Completed
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

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