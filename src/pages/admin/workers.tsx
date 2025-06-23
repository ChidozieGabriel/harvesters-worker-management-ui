import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Users, 
  Mail, 
  User, 
  Building2, 
  Shield,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  getWorkers, 
  createWorker, 
  updateWorker, 
  deleteWorker,
  getAllDepartments
} from '../../services';
import { Worker, Department, UserRole } from '../../types/api';

interface WorkerFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  departmentName: string;
  password?: string;
}

const roleConfig = {
  [UserRole.Admin]: {
    label: 'Administrator',
    description: 'Full system access and management',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  [UserRole.Worker]: {
    label: 'Worker',
    description: 'Active church worker with attendance tracking',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  [UserRole.NonWorker]: {
    label: 'Non-Worker',
    description: 'Church member without worker responsibilities',
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
};

export default function Workers() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<WorkerFormData>();

  // Watch the role field to conditionally show password field
  const watchedRole = watch('role');

  // Fetch all workers
  const { data: workers = [], isLoading: workersLoading } = useQuery<Worker[]>({
    queryKey: ['workers'],
    queryFn: getWorkers,
  });

  // Fetch all departments for dropdown
  const { data: departments = [], isLoading: departmentsLoading } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: getAllDepartments,
  });

  // Create worker mutation
  const createWorkerMutation = useMutation({
    mutationFn: createWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Worker created successfully! 🎉');
      setIsCreating(false);
      reset();
    },
    onError: (error) => {
      toast.error(`Failed to create worker: ${error.message}`);
    },
  });

  // Update worker mutation
  const updateWorkerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<WorkerFormData, 'password'> }) => 
      updateWorker(id, {
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        departmentName: data.departmentName,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Worker updated successfully! ✨');
      setEditingWorker(null);
      reset();
    },
    onError: (error) => {
      toast.error(`Failed to update worker: ${error.message}`);
    },
  });

  // Delete worker mutation
  const deleteWorkerMutation = useMutation({
    mutationFn: deleteWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Worker deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete worker: ${error.message}`);
    },
  });

  // Form handlers
  const onSubmit = (data: WorkerFormData) => {
    if (editingWorker) {
      updateWorkerMutation.mutate({
        id: editingWorker.id,
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          departmentName: data.departmentName,
        },
      });
    } else {
      createWorkerMutation.mutate({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        departmentName: data.departmentName,
        password: data.password || 'password123', // Default password
      });
    }
  };

  const handleEdit = (worker: Worker) => {
    setEditingWorker(worker);
    reset({
      email: worker.email,
      firstName: worker.firstName,
      lastName: worker.lastName,
      role: worker.role,
      departmentName: worker.departmentName,
    });
  };

  const handleCancelEdit = () => {
    setEditingWorker(null);
    setIsCreating(false);
    reset();
    setShowPassword(false);
  };

  const handleDelete = (workerId: string, workerName: string) => {
    if (window.confirm(`Are you sure you want to delete ${workerName}? This action cannot be undone and will remove all associated data.`)) {
      deleteWorkerMutation.mutate(workerId);
    }
  };

  // Filter workers based on search and filters
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = searchTerm === '' || 
      worker.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === '' || worker.departmentName === selectedDepartment;
    const matchesRole = selectedRole === '' || worker.role === selectedRole;
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  // Get unique departments and roles for filters
  const uniqueDepartments = [...new Set(workers.map(w => w.departmentName))];
  const uniqueRoles = Object.values(UserRole);

  if (workersLoading || departmentsLoading) {
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
            Workers Management
          </h1>
          <p className="text-base lg:text-lg text-harvesters-600 leading-relaxed">
            Manage church workers, their roles, and department assignments
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 flex-shrink-0">
          <button
            onClick={() => setIsCreating(true)}
            disabled={isCreating || editingWorker || departments.length === 0}
            className="flex items-center justify-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 disabled:bg-harvesters-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base whitespace-nowrap"
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
            <span className="truncate">Add Worker</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-harvesters-100 overflow-hidden">
        <div className="card-padding border-b border-gray-100">
          <div className="flex items-center space-x-4 lg:space-x-6">
            <div className="bg-harvesters-600 p-3 lg:p-4 rounded-xl lg:rounded-2xl text-white">
              <Search className="w-6 h-6 lg:w-7 lg:h-7" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                Search & Filter Workers
              </h2>
              <p className="text-sm text-harvesters-600 mt-1">
                Find workers by name, email, department, or role
              </p>
            </div>
          </div>
        </div>

        <div className="card-padding">
          <div className="grid-responsive grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            {/* Search Input */}
            <div className="space-y-2 lg:space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Search Workers
              </label>
              <div className="relative">
                <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="appearance-none block w-full pl-10 lg:pl-12 pr-4 py-2 lg:py-3 border border-gray-300 rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent hover:border-harvesters-300 transition-all duration-200"
                  placeholder="Search by name or email..."
                />
              </div>
            </div>

            {/* Department Filter */}
            <div className="space-y-2 lg:space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Filter by Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="appearance-none block w-full button-padding border border-gray-300 rounded-xl lg:rounded-2xl shadow-sm text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent hover:border-harvesters-300 transition-all duration-200"
              >
                <option value="">All Departments</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div className="space-y-2 lg:space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Filter by Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="appearance-none block w-full button-padding border border-gray-300 rounded-xl lg:rounded-2xl shadow-sm text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent hover:border-harvesters-300 transition-all duration-200"
              >
                <option value="">All Roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {roleConfig[role].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="space-y-2 lg:space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Results
              </label>
              <div className="flex items-center justify-center button-padding bg-harvesters-50 border border-harvesters-200 rounded-xl lg:rounded-2xl">
                <span className="text-sm lg:text-base font-semibold text-harvesters-700">
                  {filteredWorkers.length} of {workers.length} workers
                </span>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedDepartment || selectedRole) && (
            <div className="mt-4 lg:mt-6 flex justify-center">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDepartment('');
                  setSelectedRole('');
                }}
                className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base font-medium text-harvesters-600 hover:text-harvesters-700 hover:bg-harvesters-50 rounded-lg lg:rounded-xl transition-colors duration-200"
              >
                <X className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingWorker) && (
        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-harvesters-100 overflow-hidden">
          <div className="card-padding border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 lg:space-x-6">
                <div className="bg-harvesters-600 p-3 lg:p-4 rounded-xl lg:rounded-2xl text-white">
                  <User className="w-6 h-6 lg:w-7 lg:h-7" />
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                    {editingWorker ? 'Edit Worker' : 'Add New Worker'}
                  </h2>
                  <p className="text-sm text-harvesters-600 mt-1">
                    {editingWorker ? 'Update worker information and settings' : 'Create a new worker account with role and department assignment'}
                  </p>
                </div>
              </div>
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
              {/* Personal Information */}
              <div className="grid-responsive grid-cols-1 md:grid-cols-2">
                <div className="space-y-2 lg:space-y-3">
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base
                      focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                      ${errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                    placeholder="Enter first name"
                    {...register('firstName', { 
                      required: 'First name is required',
                      minLength: { value: 2, message: 'First name must be at least 2 characters' },
                      maxLength: { value: 50, message: 'First name must be less than 50 characters' }
                    })}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="mr-2">⚠</span>
                      <span className="truncate">{errors.firstName.message}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2 lg:space-y-3">
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base
                      focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                      ${errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                    placeholder="Enter last name"
                    {...register('lastName', { 
                      required: 'Last name is required',
                      minLength: { value: 2, message: 'Last name must be at least 2 characters' },
                      maxLength: { value: 50, message: 'Last name must be less than 50 characters' }
                    })}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="mr-2">⚠</span>
                      <span className="truncate">{errors.lastName.message}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2 lg:space-y-3">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  disabled={!!editingWorker}
                  className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base
                    focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                    ${editingWorker ? 'bg-gray-100 cursor-not-allowed' : ''}
                    ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                  placeholder="Enter email address"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {editingWorker && (
                  <p className="text-xs text-gray-500">
                    Email cannot be changed after account creation
                  </p>
                )}
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-2">⚠</span>
                    <span className="truncate">{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Role and Department */}
              <div className="grid-responsive grid-cols-1 md:grid-cols-2">
                <div className="space-y-2 lg:space-y-3">
                  <label htmlFor="role" className="block text-sm font-semibold text-gray-700">
                    Role *
                  </label>
                  <select
                    id="role"
                    className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm text-sm lg:text-base
                      focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                      ${errors.role ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                    {...register('role', { required: 'Role is required' })}
                  >
                    <option value="">Select a role...</option>
                    {Object.entries(roleConfig).map(([role, config]) => (
                      <option key={role} value={role}>
                        {config.label} - {config.description}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="mr-2">⚠</span>
                      <span className="truncate">{errors.role.message}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2 lg:space-y-3">
                  <label htmlFor="departmentName" className="block text-sm font-semibold text-gray-700">
                    Department *
                  </label>
                  <select
                    id="departmentName"
                    className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm text-sm lg:text-base
                      focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                      ${errors.departmentName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                    {...register('departmentName', { required: 'Department is required' })}
                  >
                    <option value="">Select a department...</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name} ({dept.teamName})
                      </option>
                    ))}
                  </select>
                  {errors.departmentName && (
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="mr-2">⚠</span>
                      <span className="truncate">{errors.departmentName.message}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Password (only for new workers) */}
              {!editingWorker && (
                <div className="space-y-2 lg:space-y-3">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password {!editingWorker && '*'}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base pr-12
                        focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                        ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                      placeholder="Enter password (leave blank for default: password123)"
                      {...register('password', !editingWorker ? { 
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      } : {})}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    If left blank, the default password "password123" will be used. Worker can change it after first login.
                  </p>
                  {errors.password && (
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="mr-2">⚠</span>
                      <span className="truncate">{errors.password.message}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-4 lg:pt-6">
                <button
                  type="submit"
                  disabled={createWorkerMutation.isPending || updateWorkerMutation.isPending}
                  className="flex items-center justify-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 disabled:bg-harvesters-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base"
                >
                  {(createWorkerMutation.isPending || updateWorkerMutation.isPending) ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-b-2 border-white mr-2 lg:mr-3"></div>
                      <span className="truncate">Saving...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
                      <span className="truncate">{editingWorker ? 'Update Worker' : 'Create Worker'}</span>
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

      {/* Workers List */}
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-harvesters-100 overflow-hidden">
        <div className="card-padding border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 lg:space-x-6">
              <div className="bg-harvesters-600 p-3 lg:p-4 rounded-xl lg:rounded-2xl text-white">
                <Users className="w-6 h-6 lg:w-7 lg:h-7" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Church Workers ({filteredWorkers.length})
                </h2>
                <p className="text-sm text-harvesters-600 mt-1">
                  Manage worker accounts, roles, and department assignments
                </p>
              </div>
            </div>
          </div>
        </div>

        {workers.length === 0 ? (
          <div className="card-padding text-center py-12 lg:py-16">
            <Users className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-4 lg:mb-6" />
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 lg:mb-3">
              No workers added yet
            </h3>
            <p className="text-sm lg:text-base text-gray-600 mb-6 lg:mb-8 max-w-md mx-auto">
              {departments.length === 0 
                ? 'Create departments first, then add workers to manage church operations effectively.'
                : 'Add your first worker to start managing church operations and attendance tracking.'
              }
            </p>
            {departments.length > 0 && (
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base"
              >
                <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
                Add First Worker
              </button>
            )}
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="card-padding text-center py-12 lg:py-16">
            <Search className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-4 lg:mb-6" />
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 lg:mb-3">
              No workers match your filters
            </h3>
            <p className="text-sm lg:text-base text-gray-600 mb-6 lg:mb-8">
              Try adjusting your search terms or filters to find the workers you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDepartment('');
                setSelectedRole('');
              }}
              className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base font-medium text-harvesters-600 hover:text-harvesters-700 hover:bg-harvesters-50 rounded-lg lg:rounded-xl transition-colors duration-200"
            >
              <X className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredWorkers.map((worker) => {
              const config = roleConfig[worker.role];
              return (
                <div key={worker.id} className="card-padding hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between gap-4 lg:gap-6">
                    <div className="flex items-center space-x-4 lg:space-x-6 flex-1 min-w-0">
                      <div className={`${config.color} p-3 lg:p-4 rounded-xl lg:rounded-2xl text-white flex-shrink-0`}>
                        <User className="w-5 h-5 lg:w-6 lg:h-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 lg:gap-4 mb-2">
                          <h3 className="text-base lg:text-lg font-semibold text-gray-900 truncate">
                            {worker.firstName} {worker.lastName}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} border flex-shrink-0`}>
                            {config.label}
                          </span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{worker.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{worker.departmentName}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(worker)}
                        disabled={isCreating || editingWorker}
                        className="p-2 lg:p-3 text-harvesters-600 hover:text-harvesters-700 hover:bg-harvesters-50 rounded-lg lg:rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Edit worker"
                      >
                        <Edit2 className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(worker.id, `${worker.firstName} ${worker.lastName}`)}
                        disabled={deleteWorkerMutation.isPending}
                        className="p-2 lg:p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg lg:rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete worker"
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