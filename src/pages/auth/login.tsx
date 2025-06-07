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
    <div className="min-h-screen bg-gradient-to-br from-harvesters-50 via-white to-harvesters-100 flex flex-col justify-center section-spacing no-horizontal-scroll">
      <div className="container-responsive">
        <div className="max-w-md mx-auto w-full">
          {/* Logo Section with Professional Spacing */}
          <div className="flex justify-center mb-8 lg:mb-12">
            <Logo size="xl" className="text-harvesters-700" />
          </div>
          
          {/* Header Section with Proper Alignment */}
          <div className="text-center space-y-3 lg:space-y-4 mb-8 lg:mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              Welcome Back
            </h2>
            <p className="text-base lg:text-lg text-harvesters-600 leading-relaxed">
              Sign in to access your church management portal
            </p>
          </div>

          {/* Form Container with Enhanced Spacing */}
          <div className="bg-white card-padding shadow-2xl rounded-2xl lg:rounded-3xl border border-harvesters-100">
            <form className="form-spacing" onSubmit={handleSubmit(onSubmit)}>
              {/* Email Field with Professional Layout */}
              <div className="space-y-2 lg:space-y-3">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base
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
                    <p className="mt-2 lg:mt-3 text-sm text-red-600 flex items-center">
                      <span className="mr-2">⚠</span>
                      <span className="truncate">{errors.email.message}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Password Field with Professional Layout */}
              <div className="space-y-2 lg:space-y-3">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base
                      focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                      ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                    placeholder="Enter your password"
                    {...register('password', { required: 'Password is required' })}
                  />
                  {errors.password && (
                    <p className="mt-2 lg:mt-3 text-sm text-red-600 flex items-center">
                      <span className="mr-2">⚠</span>
                      <span className="truncate">{errors.password.message}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Error Message with Professional Styling */}
              {error && (
                <div className="rounded-xl lg:rounded-2xl bg-red-50 border border-red-200 p-4 lg:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-red-400 text-lg lg:text-xl">⚠</span>
                    </div>
                    <div className="ml-3 lg:ml-4 min-w-0">
                      <h3 className="text-sm font-medium text-red-800 truncate">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button with Enhanced Design */}
              <div className="pt-2 lg:pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full flex justify-center button-padding border border-transparent rounded-xl lg:rounded-2xl text-sm lg:text-base font-semibold text-white 
                    ${isLoading 
                      ? 'bg-harvesters-400 cursor-not-allowed' 
                      : 'bg-harvesters-600 hover:bg-harvesters-700 focus:ring-2 focus:ring-offset-2 focus:ring-harvesters-500 transform hover:scale-[1.02] active:scale-[0.98]'
                    }
                    transition-all duration-200 shadow-lg hover:shadow-xl`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-b-2 border-white mr-2 lg:mr-3"></div>
                      <span className="truncate">Signing in...</span>
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            {/* Demo Credentials Section with Professional Layout */}
            <div className="mt-8 lg:mt-10">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-harvesters-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 lg:px-4 bg-white text-harvesters-600 font-medium">Demo Credentials</span>
                </div>
              </div>
              <div className="mt-6 lg:mt-8 text-center">
                <div className="bg-harvesters-50 rounded-xl lg:rounded-2xl p-4 lg:p-6 space-y-2">
                  <p className="text-sm text-harvesters-700">
                    <strong className="font-semibold">Admin:</strong> <span className="break-all">admin@example.com</span> / password123
                  </p>
                  <p className="text-sm text-harvesters-700">
                    <strong className="font-semibold">Worker:</strong> <span className="break-all">john.doe@example.com</span> / password123
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}