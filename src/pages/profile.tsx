import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Building2, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  Calendar,
  MapPin,
  Phone,
  Edit2,
  Check,
  X,
  Key,
  Settings,
  UserCircle,
  Briefcase
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { resetPassword } from '../services';
import { UserRole } from '../types/api';

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const roleConfig = {
  [UserRole.Admin]: {
    label: 'Administrator',
    description: 'Full management capabilities',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: Shield
  },
  [UserRole.Worker]: {
    label: 'Church Worker',
    description: 'Active church worker',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Briefcase
  },
  [UserRole.NonWorker]: {
    label: 'Church Member',
    description: 'Church member without worker responsibilities',
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: User
  }
};

export default function Profile() {
  const { user } = useAuthStore();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<PasswordChangeForm>();

  const newPassword = watch('newPassword');

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordChangeForm) => {
      if (!user?.email) throw new Error('User email not available');
      
      // Note: In a real implementation, you'd need a proper token from the forgot password flow
      // For now, we'll simulate the password change process
      await resetPassword({
        email: user.email,
        token: 'mock-token', // In real app, this would come from a proper flow
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });
    },
    onSuccess: () => {
      toast.success('Password changed successfully! 🎉');
      setIsChangingPassword(false);
      reset();
    },
    onError: (error) => {
      toast.error(`Failed to change password: ${error.message}`);
    },
  });

  const onSubmitPasswordChange = (data: PasswordChangeForm) => {
    changePasswordMutation.mutate(data);
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    reset();
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-harvesters-500"></div>
      </div>
    );
  }

  const config = roleConfig[user.role];

  return (
    <div className="content-spacing no-horizontal-scroll">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 lg:gap-8">
        <div className="space-y-3 lg:space-y-4 min-w-0 flex-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            My Profile
          </h1>
          <p className="text-base lg:text-lg text-harvesters-600 leading-relaxed">
            Manage your account information and security settings
          </p>
        </div>
      </div>

      {/* Profile Information Card */}
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-harvesters-100 overflow-hidden">
        <div className="card-padding border-b border-gray-100">
          <div className="flex items-center space-x-4 lg:space-x-6">
            <div className="bg-harvesters-600 p-3 lg:p-4 rounded-xl lg:rounded-2xl text-white">
              <UserCircle className="w-6 h-6 lg:w-7 lg:h-7" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                Personal Information
              </h2>
              <p className="text-sm text-harvesters-600 mt-1">
                Your account details and church information
              </p>
            </div>
          </div>
        </div>

        <div className="card-padding">
          {/* Profile Header with Avatar */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 lg:gap-8 mb-8 lg:mb-12">
            <div className="relative">
              <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-harvesters-400 to-harvesters-600 rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-lg">
                <User className="w-12 h-12 lg:w-16 lg:h-16 text-white" strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg border border-harvesters-200">
                <div className={`w-4 h-4 lg:w-5 lg:h-5 ${config.color} rounded-full`}></div>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-3 lg:space-y-4">
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {user.firstName} {user.lastName}
                </h3>
                <div className={`inline-flex items-center px-3 py-1 lg:px-4 lg:py-2 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} border`}>
                  <config.icon className="w-4 h-4 mr-2" />
                  {config.label}
                </div>
              </div>
              <p className="text-sm lg:text-base text-gray-600 leading-relaxed max-w-md">
                {config.description}
              </p>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid-responsive grid-cols-1 md:grid-cols-2">
            {/* Contact Information */}
            <div className="space-y-6 lg:space-y-8">
              <div>
                <h4 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6 flex items-center">
                  <Mail className="w-5 h-5 lg:w-6 lg:h-6 mr-3 text-harvesters-600" />
                  Contact Information
                </h4>
                
                <div className="space-y-4 lg:space-y-6">
                  <div className="bg-harvesters-50 rounded-xl lg:rounded-2xl p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">Email Address</label>
                      <Mail className="w-4 h-4 text-harvesters-600" />
                    </div>
                    <p className="text-base lg:text-lg text-gray-900 font-medium break-all">
                      {user.email}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-600 mt-2">
                      Primary contact and login email
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Church Information */}
            <div className="space-y-6 lg:space-y-8">
              <div>
                <h4 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6 flex items-center">
                  <Building2 className="w-5 h-5 lg:w-6 lg:h-6 mr-3 text-harvesters-600" />
                  Church Information
                </h4>
                
                <div className="space-y-4 lg:space-y-6">
                  <div className="bg-harvesters-50 rounded-xl lg:rounded-2xl p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">Department</label>
                      <Building2 className="w-4 h-4 text-harvesters-600" />
                    </div>
                    <p className="text-base lg:text-lg text-gray-900 font-medium">
                      {user.departmentName}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-600 mt-2">
                      Your assigned department
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings Card */}
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-harvesters-100 overflow-hidden">
        <div className="card-padding border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 lg:space-x-6">
              <div className="bg-harvesters-600 p-3 lg:p-4 rounded-xl lg:rounded-2xl text-white">
                <Settings className="w-6 h-6 lg:w-7 lg:h-7" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Security Settings
                </h2>
                <p className="text-sm text-harvesters-600 mt-1">
                  Manage your account security and password
                </p>
              </div>
            </div>

            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="flex items-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base whitespace-nowrap"
              >
                <Key className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
                <span className="truncate">Change Password</span>
              </button>
            )}
          </div>
        </div>

        <div className="card-padding">
          {!isChangingPassword ? (
            <div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmitPasswordChange)} className="form-spacing">
              <div className="bg-blue-50 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-blue-200 mb-6 lg:mb-8">
                <div className="flex items-center space-x-3 lg:space-x-4">
                  <div className="bg-blue-500 p-2 lg:p-3 rounded-lg lg:rounded-xl text-white">
                    <Key className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <div>
                    <h4 className="text-base lg:text-lg font-semibold text-blue-900 mb-1">
                      Change Your Password
                    </h4>
                    <p className="text-sm text-blue-700">
                      Enter your current password and choose a new secure password.
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Password */}
              <div className="space-y-2 lg:space-y-3">
                <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base pr-12
                      focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                      ${errors.currentPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                    placeholder="Enter your current password"
                    {...register('currentPassword', { 
                      required: 'Current password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-2">⚠</span>
                    <span className="truncate">{errors.currentPassword.message}</span>
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2 lg:space-y-3">
                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base pr-12
                      focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                      ${errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                    placeholder="Enter your new password"
                    {...register('newPassword', { 
                      required: 'New password is required',
                      minLength: { value: 6, message: 'New password must be at least 6 characters' }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-2">⚠</span>
                    <span className="truncate">{errors.newPassword.message}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2 lg:space-y-3">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base pr-12
                      focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                      ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                    placeholder="Confirm your new password"
                    {...register('confirmPassword', { 
                      required: 'Please confirm your new password',
                      validate: value => value === newPassword || 'Passwords do not match'
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-2">⚠</span>
                    <span className="truncate">{errors.confirmPassword.message}</span>
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-4 lg:pt-6">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="flex items-center justify-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 disabled:bg-harvesters-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base"
                >
                  {changePasswordMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-b-2 border-white mr-2 lg:mr-3"></div>
                      <span className="truncate">Changing Password...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
                      <span className="truncate">Change Password</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancelPasswordChange}
                  className="flex items-center justify-center button-padding border border-gray-300 text-gray-700 rounded-xl lg:rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm lg:text-base"
                >
                  <X className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
                  <span className="truncate">Cancel</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}