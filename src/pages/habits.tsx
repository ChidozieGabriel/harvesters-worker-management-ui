import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Save, X, Target, BookOpen, Heart, Zap, DollarSign } from 'lucide-react';
import { getHabits, addHabit, updateHabit, deleteHabit } from '../services';
import { Habit, HabitType } from '../types/api';

interface HabitFormData {
  type: HabitType;
  notes: string;
  amount: number;
}

// Configuration for habit types with user-friendly labels and icons
const habitTypeConfig = {
  [HabitType.BibleStudy]: {
    label: 'Bible Study',
    description: 'Daily Bible reading and study',
    icon: BookOpen,
    color: 'bg-blue-500',
    unit: 'minutes'
  },
  [HabitType.NLPPrayer]: {
    label: 'Prayer',
    description: 'Prayer and meditation time',
    icon: Heart,
    color: 'bg-purple-500',
    unit: 'minutes'
  },
  [HabitType.Giving]: {
    label: 'Giving',
    description: 'Financial contributions and tithing',
    icon: DollarSign,
    color: 'bg-green-500',
    unit: 'amount'
  },
  [HabitType.Fasting]: {
    label: 'Fasting',
    description: 'Spiritual fasting practices',
    icon: Zap,
    color: 'bg-orange-500',
    unit: 'hours'
  },
  [HabitType.Devotionals]: {
    label: 'Devotionals',
    description: 'Daily devotional reading',
    icon: Target,
    color: 'bg-indigo-500',
    unit: 'sessions'
  }
};

export default function HabitsManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<HabitFormData>();

  // Fetch all habits
  const { data: habits = [], isLoading } = useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: getHabits,
  });

  // Create habit mutation
  const createHabitMutation = useMutation({
    mutationFn: addHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit created successfully');
      setIsCreating(false);
      reset();
    },
    onError: (error) => {
      toast.error(`Failed to create habit: ${error.message}`);
    },
  });

  // Update habit mutation
  const updateHabitMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Habit> }) => 
      updateHabit(id, {
        id,
        type: data.type!,
        completedAt: data.completedAt || new Date().toISOString(),
        notes: data.notes,
        amount: data.amount,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit updated successfully');
      setEditingHabit(null);
      reset();
    },
    onError: (error) => {
      toast.error(`Failed to update habit: ${error.message}`);
    },
  });

  // Delete habit mutation
  const deleteHabitMutation = useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete habit: ${error.message}`);
    },
  });

  const onSubmit = (data: HabitFormData) => {
    if (editingHabit) {
      updateHabitMutation.mutate({
        id: editingHabit.id,
        data: {
          ...data,
          completedAt: editingHabit.completedAt,
        },
      });
    } else {
      createHabitMutation.mutate({
        type: data.type,
        notes: data.notes || '',
        amount: data.amount || 0,
      });
    }
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    reset({
      type: habit.type,
      notes: habit.notes || '',
      amount: habit.amount || 0,
    });
  };

  const handleCancelEdit = () => {
    setEditingHabit(null);
    setIsCreating(false);
    reset();
  };

  const handleDelete = (habitId: string) => {
    if (window.confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      deleteHabitMutation.mutate(habitId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-harvesters-500"></div>
      </div>
    );
  }

  return (
    <div className="content-spacing no-horizontal-scroll">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 lg:gap-8">
        <div className="space-y-3 lg:space-y-4 min-w-0 flex-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Habit Management
          </h1>
          <p className="text-base lg:text-lg text-harvesters-600 leading-relaxed">
            Create and manage spiritual habits for church members
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <button
            onClick={() => setIsCreating(true)}
            disabled={isCreating || editingHabit}
            className="flex items-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 disabled:bg-harvesters-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base whitespace-nowrap"
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
            <span className="truncate">Create Habit</span>
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingHabit) && (
        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-harvesters-100 overflow-hidden">
          <div className="card-padding border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                {editingHabit ? 'Edit Habit' : 'Create New Habit'}
              </h2>
              <button
                onClick={handleCancelEdit}
                className="p-2 lg:p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg lg:rounded-xl transition-colors duration-200"
                aria-label="Cancel"
              >
                <X className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            </div>
          </div>
          
          <div className="card-padding">
            <form onSubmit={handleSubmit(onSubmit)} className="form-spacing">
              {/* Habit Type Selection */}
              <div className="space-y-3 lg:space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Habit Type *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                  {Object.entries(habitTypeConfig).map(([type, config]) => (
                    <label
                      key={type}
                      className="relative flex items-center p-4 lg:p-6 border-2 border-gray-200 rounded-xl lg:rounded-2xl cursor-pointer hover:border-harvesters-300 hover:bg-harvesters-50 transition-all duration-200 group"
                    >
                      <input
                        type="radio"
                        value={type}
                        {...register('type', { required: 'Habit type is required' })}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3 lg:space-x-4 w-full">
                        <div className={`${config.color} p-2 lg:p-3 rounded-lg lg:rounded-xl text-white group-hover:scale-105 transition-transform duration-200 flex-shrink-0`}>
                          <config.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm lg:text-base font-semibold text-gray-900 truncate">
                            {config.label}
                          </p>
                          <p className="text-xs lg:text-sm text-gray-600 truncate">
                            {config.description}
                          </p>
                        </div>
                      </div>
                      <div className="absolute inset-0 border-2 border-harvesters-500 rounded-xl lg:rounded-2xl opacity-0 peer-checked:opacity-100 transition-opacity duration-200"></div>
                    </label>
                  ))}
                </div>
                {errors.type && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-2">⚠</span>
                    <span className="truncate">{errors.type.message}</span>
                  </p>
                )}
              </div>

              {/* Notes Field */}
              <div className="space-y-2 lg:space-y-3">
                <label htmlFor="notes" className="block text-sm font-semibold text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="appearance-none block w-full button-padding border border-gray-300 rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent hover:border-harvesters-300 transition-all duration-200 resize-none"
                  placeholder="Add any additional notes or instructions for this habit..."
                  {...register('notes')}
                />
              </div>

              {/* Amount Field */}
              <div className="space-y-2 lg:space-y-3">
                <label htmlFor="amount" className="block text-sm font-semibold text-gray-700">
                  Target Amount
                </label>
                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  className="appearance-none block w-full button-padding border border-gray-300 rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent hover:border-harvesters-300 transition-all duration-200"
                  placeholder="Enter target amount (minutes, hours, sessions, etc.)"
                  {...register('amount', { 
                    valueAsNumber: true,
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                />
                {errors.amount && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-2">⚠</span>
                    <span className="truncate">{errors.amount.message}</span>
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-4 lg:pt-6">
                <button
                  type="submit"
                  disabled={createHabitMutation.isPending || updateHabitMutation.isPending}
                  className="flex items-center justify-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 disabled:bg-harvesters-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base"
                >
                  {(createHabitMutation.isPending || updateHabitMutation.isPending) ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-b-2 border-white mr-2 lg:mr-3"></div>
                      <span className="truncate">Saving...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
                      <span className="truncate">{editingHabit ? 'Update Habit' : 'Create Habit'}</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center justify-center button-padding border border-gray-300 text-gray-700 rounded-xl lg:rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm lg:text-base"
                >
                  <X className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
                  <span className="truncate">Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Habits List */}
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-harvesters-100 overflow-hidden">
        <div className="card-padding border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
              Existing Habits ({habits.length})
            </h2>
          </div>
        </div>

        {habits.length === 0 ? (
          <div className="card-padding text-center py-12 lg:py-16">
            <Target className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-4 lg:mb-6" />
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 lg:mb-3">
              No habits created yet
            </h3>
            <p className="text-sm lg:text-base text-gray-600 mb-6 lg:mb-8">
              Create your first spiritual habit to get started with tracking member progress.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
              Create First Habit
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {habits.map((habit) => {
              const config = habitTypeConfig[habit.type];
              return (
                <div key={habit.id} className="card-padding hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between gap-4 lg:gap-6">
                    <div className="flex items-center space-x-4 lg:space-x-6 flex-1 min-w-0">
                      <div className={`${config.color} p-3 lg:p-4 rounded-xl lg:rounded-2xl text-white flex-shrink-0`}>
                        <config.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 lg:gap-4 mb-2">
                          <h3 className="text-base lg:text-lg font-semibold text-gray-900 truncate">
                            {config.label}
                          </h3>
                          {habit.amount && (
                            <span className="inline-flex items-center px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-medium bg-harvesters-100 text-harvesters-800 flex-shrink-0">
                              {habit.amount} {config.unit}
                            </span>
                          )}
                        </div>
                        
                        {habit.notes && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {habit.notes}
                          </p>
                        )}
                        
                        {habit.completedAt && (
                          <p className="text-xs text-harvesters-600">
                            Last completed: {new Date(habit.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(habit)}
                        disabled={isCreating || editingHabit}
                        className="p-2 lg:p-3 text-harvesters-600 hover:text-harvesters-700 hover:bg-harvesters-50 rounded-lg lg:rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Edit habit"
                      >
                        <Edit2 className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(habit.id)}
                        disabled={deleteHabitMutation.isPending}
                        className="p-2 lg:p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg lg:rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete habit"
                      >
                        <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}