import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/auth';
import { workerLogin } from '../../services';
import Logo from '../../components/ui/Logo';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setToken } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await workerLogin({
        email: data.email,
        password: data.password
      });
      setToken(response.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-harvesters-50 via-white to-harvesters-100 flex flex-col justify-center py-16 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Logo Section with Professional Spacing */}
        <div className="flex justify-center mb-12">
          <Logo size="xl" className="text-harvesters-700" />
        </div>
        
        {/* Header Section with Proper Alignment */}
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold text-gray-900 leading-tight">
            Welcome Back
          </h2>
          <p className="text-lg text-harvesters-600 leading-relaxed">
            Sign in to access your church management portal
          </p>
        </div>
      </div>

      {/* Form Container with Enhanced Spacing */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-12 px-8 shadow-2xl sm:rounded-3xl sm:px-12 border border-harvesters-100">
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field with Professional Layout */}
            <div className="space-y-3">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`appearance-none block w-full px-6 py-4 border rounded-2xl shadow-sm placeholder-gray-400 text-base
                    focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                    ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                  placeholder="Enter your email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && (
                  <p className="mt-3 text-sm text-red-600 flex items-center">
                    <span className="mr-2">⚠</span>
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password Field with Professional Layout */}
            <div className="space-y-3">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={`appearance-none block w-full px-6 py-4 border rounded-2xl shadow-sm placeholder-gray-400 text-base
                    focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                    ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                  placeholder="Enter your password"
                  {...register('password', { required: 'Password is required' })}
                />
                {errors.password && (
                  <p className="mt-3 text-sm text-red-600 flex items-center">
                    <span className="mr-2">⚠</span>
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Error Message with Professional Styling */}
            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-red-400 text-xl">⚠</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button with Enhanced Design */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-4 px-6 border border-transparent rounded-2xl text-base font-semibold text-white 
                  ${isLoading 
                    ? 'bg-harvesters-400 cursor-not-allowed' 
                    : 'bg-harvesters-600 hover:bg-harvesters-700 focus:ring-2 focus:ring-offset-2 focus:ring-harvesters-500 transform hover:scale-[1.02] active:scale-[0.98]'
                  }
                  transition-all duration-200 shadow-lg hover:shadow-xl`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* Demo Credentials Section with Professional Layout */}
          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-harvesters-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-harvesters-600 font-medium">Demo Credentials</span>
              </div>
            </div>
            <div className="mt-8 text-center space-y-3">
              <div className="bg-harvesters-50 rounded-2xl p-6 space-y-2">
                <p className="text-sm text-harvesters-700">
                  <strong className="font-semibold">Admin:</strong> admin@example.com / password123
                </p>
                <p className="text-sm text-harvesters-700">
                  <strong className="font-semibold">Worker:</strong> john.doe@example.com / password123
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}