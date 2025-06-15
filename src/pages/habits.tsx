import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  DollarSign,
  BookOpen,
  Heart,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { getHabits, addHabit, updateHabit, deleteHabit } from '../services';
import { Habit, HabitType } from '../types/api';
import { AddHabitRequest, UpdateHabitRequest } from '../services/types';

interface HabitFormData {
  type: HabitType;
  notes: string;
  amount: number;
}

const habitTypeConfig = {
  [HabitType.BibleStudy]: {
    label: 'Bible Study',
    icon: BookOpen,
    color: 'bg-blue-600',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    unit: 'minutes',
    placeholder: 'Enter study duration in minutes',
  },
  [HabitType.NLPPrayer]: {
    label: 'NLP Prayer',
    icon: Heart,
    color: 'bg-purple-600',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    unit: 'minutes',
    placeholder: 'Enter prayer duration in minutes',
  },
  [HabitType.Giving]: {
    label: 'Giving',
    icon: DollarSign,
    color: 'bg-green-600',
    lightColor: 'bg-green-50',
    textColor: 'text-green-700',
    unit: 'amount',
    placeholder: 'Enter giving amount',
  },
  [HabitType.Fasting]: {
    label: 'Fasting',
    icon: Clock,
    color: 'bg-orange-600',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    unit: 'hours',
    placeholder: 'Enter fasting duration in hours',
  },
  [HabitType.Devotionals]: {
    label: 'Devotionals',
    icon: Calendar,
    color: 'bg-harvesters-600',
    lightColor: 'bg-harvesters-50',
    textColor: 'text-harvesters-700',
    unit: 'count',
    placeholder: 'Enter number of devotionals',
  },
};

export default function Habits() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: habits = [], isLoading } = useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: getHabits,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<HabitFormData>();

  const selectedType = watch('type');

  const addMutation = useMutation({
    mutationFn: addHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit added successfully!');
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(`Failed to add habit: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHabitRequest }) =>
      updateHabit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit updated successfully!');
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(`Failed to update habit: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit deleted successfully!');
      setDeleteConfirm(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete habit: ${error.message}`);
    },
  });

  const handleOpenModal = (habit?: Habit) => {
    if (habit) {
      setEditingHabit(habit);
      reset({
        type: habit.type,
        notes: habit.notes || '',
        amount: habit.amount || 0,
      });
    } else {
      setEditingHabit(null);
      reset({
        type: HabitType.BibleStudy,
        notes: '',
        amount: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingHabit(null);
    reset();
  };

  const onSubmit = async (data: HabitFormData) => {
    try {
      if (editingHabit) {
        await updateMutation.mutateAsync({
          id: editingHabit.id,
          data: {
            id: editingHabit.id,
            type: data.type,
            notes: data.notes,
            amount: data.amount,
            completedAt: new Date().toISOString(),
          },
        });
      } else {
        await addMutation.mutateAsync({
          type: data.type,
          notes: data.notes,
          amount: data.amount,
        });
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      // Error handling is done in mutation callbacks
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
            Spiritual Habits
          </h1>
          <p className="text-base lg:text-lg text-harvesters-600 leading-relaxed">
            Track and manage your spiritual growth journey
          </p>
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
            <span className="truncate">Add New Habit</span>
          </button>
        </div>
      </div>

      {/* Habits Grid */}
      {habits.length === 0 ? (
        <div className="text-center py-16 lg:py-24">
          <div className="bg-harvesters-50 rounded-full w-24 h-24 lg:w-32 lg:h-32 flex items-center justify-center mx-auto mb-6 lg:mb-8">
            <Heart className="w-12 h-12 lg:w-16 lg:h-16 text-harvesters-400" />
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">
            No habits yet
          </h3>
          <p className="text-base text-harvesters-600 mb-8 lg:mb-12 max-w-md mx-auto leading-relaxed">
            Start your spiritual journey by adding your first habit. Track Bible study, prayer, giving, and more.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base"
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
            Add Your First Habit
          </button>
        </div>
      ) : (
        <div className="grid-responsive grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {habits.map((habit) => {
            const config = habitTypeConfig[habit.type];
            const IconComponent = config.icon;

            return (
              <div
                key={habit.id}
                className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-harvesters-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="card-padding">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6 lg:mb-8">
                    <div className="flex items-center space-x-3 lg:space-x-4 min-w-0 flex-1">
                      <div className={`${config.color} p-3 lg:p-4 rounded-xl lg:rounded-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                        <IconComponent className="w-5 h-5 lg:w-6 lg:h-6 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg lg:text-xl font-bold text-gray-900 truncate">
                          {config.label}
                        </h3>
                        {habit.completedAt && (
                          <p className="text-xs lg:text-sm text-harvesters-600 truncate">
                            {format(new Date(habit.completedAt), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
                      <button
                        onClick={() => handleOpenModal(habit)}
                        className="p-2 lg:p-3 text-harvesters-600 hover:bg-harvesters-50 rounded-lg lg:rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:ring-offset-2"
                        aria-label="Edit habit"
                      >
                        <Edit3 className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(habit.id)}
                        className="p-2 lg:p-3 text-red-600 hover:bg-red-50 rounded-lg lg:rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        aria-label="Delete habit"
                      >
                        <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 lg:space-y-6">
                    {habit.amount && (
                      <div className={`${config.lightColor} rounded-xl lg:rounded-2xl p-4 lg:p-6`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">
                            {config.unit === 'amount' ? 'Amount' : 
                             config.unit === 'minutes' ? 'Duration' :
                             config.unit === 'hours' ? 'Duration' : 'Count'}
                          </span>
                          <span className={`text-lg lg:text-xl font-bold ${config.textColor}`}>
                            {habit.amount}
                            {config.unit === 'amount' ? '' : ` ${config.unit}`}
                          </span>
                        </div>
                      </div>
                    )}

                    {habit.notes && (
                      <div className="space-y-2 lg:space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700">Notes</h4>
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                          {habit.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual Enhancement */}
                <div className={`h-1 lg:h-2 ${config.color.replace('bg-', 'bg-gradient-to-r from-').replace('-600', '-200 to-').replace('from-', 'from-').concat('-400')}`}></div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-black bg-opacity-50"
              onClick={handleCloseModal}
            />

            <div className="inline-block w-full max-w-md p-6 lg:p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl lg:rounded-3xl">
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                  {editingHabit ? 'Edit Habit' : 'Add New Habit'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:ring-offset-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="form-spacing">
                {/* Habit Type */}
                <div className="space-y-2 lg:space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Habit Type *
                  </label>
                  <select
                    {...register('type', { required: 'Habit type is required' })}
                    className={`w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm text-sm lg:text-base
                      focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                      ${errors.type ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                  >
                    {Object.entries(habitTypeConfig).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{errors.type.message}</span>
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-2 lg:space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    {selectedType && habitTypeConfig[selectedType]?.unit === 'amount' ? 'Amount' :
                     selectedType && habitTypeConfig[selectedType]?.unit === 'minutes' ? 'Duration (minutes)' :
                     selectedType && habitTypeConfig[selectedType]?.unit === 'hours' ? 'Duration (hours)' : 'Count'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step={selectedType === HabitType.Giving ? '0.01' : '1'}
                    placeholder={selectedType ? habitTypeConfig[selectedType]?.placeholder : 'Enter amount'}
                    {...register('amount', {
                      required: 'Amount is required',
                      min: { value: 0, message: 'Amount must be positive' },
                    })}
                    className={`w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm text-sm lg:text-base
                      focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                      ${errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{errors.amount.message}</span>
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2 lg:space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Notes
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Add any notes or reflections about this habit..."
                    {...register('notes')}
                    className="w-full button-padding border border-gray-300 rounded-xl lg:rounded-2xl shadow-sm text-sm lg:text-base
                      focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                      hover:border-harvesters-300 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-4 lg:pt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 button-padding border border-gray-300 text-gray-700 rounded-xl lg:rounded-2xl hover:bg-gray-50 transition-all duration-200 font-medium text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 flex items-center justify-center button-padding rounded-xl lg:rounded-2xl font-medium text-sm lg:text-base text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:ring-offset-2
                      ${isSubmitting
                        ? 'bg-harvesters-400 cursor-not-allowed'
                        : 'bg-harvesters-600 hover:bg-harvesters-700 shadow-lg hover:shadow-xl'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingHabit ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        {editingHabit ? 'Update Habit' : 'Add Habit'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-black bg-opacity-50"
              onClick={() => setDeleteConfirm(null)}
            />

            <div className="inline-block w-full max-w-md p-6 lg:p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl lg:rounded-3xl">
              <div className="flex items-center space-x-4 mb-6 lg:mb-8">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900">
                    Delete Habit
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Are you sure you want to delete this habit? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 button-padding border border-gray-300 text-gray-700 rounded-xl lg:rounded-2xl hover:bg-gray-50 transition-all duration-200 font-medium text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleteMutation.isPending}
                  className={`flex-1 flex items-center justify-center button-padding rounded-xl lg:rounded-2xl font-medium text-sm lg:text-base text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                    ${deleteMutation.isPending
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl'
                    }`}
                >
                  {deleteMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Habit
                    </>
                    )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}