import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/auth';
import { workerLogin, forgotPassword, verifyToken, resetPassword } from '../../services';
import { ArrowLeft, Mail, Key, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Logo from '../../components/ui/Logo';

interface LoginForm {
  email: string;
  password: string;
}

interface ForgotPasswordForm {
  email: string;
}

interface ResetPasswordForm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

type ResetStep = 'requestEmail' | 'enterToken' | 'resetPassword' | 'success';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState<ResetStep>('requestEmail');
  const [resetEmail, setResetEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { setToken } = useAuthStore();
  
  const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: loginErrors } } = useForm<LoginForm>();
  const { register: registerForgot, handleSubmit: handleSubmitForgot, formState: { errors: forgotErrors } } = useForm<ForgotPasswordForm>();
  const { register: registerReset, handleSubmit: handleSubmitReset, watch, formState: { errors: resetErrors } } = useForm<ResetPasswordForm>();

  const newPassword = watch('newPassword');

  const onSubmitLogin = async (data: LoginForm) => {
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

  const onSubmitForgotPassword = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setError('');

    try {
      await forgotPassword({ email: data.email });
      setResetEmail(data.email);
      setResetStep('enterToken');
    } catch (err) {
      setError('Failed to send reset email. Please check your email address and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitResetPassword = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    setError('');

    try {
      // First verify the token
      await verifyToken({
        email: resetEmail,
        token: data.token
      });

      // Then reset the password
      await resetPassword({
        email: resetEmail,
        token: data.token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });

      setResetStep('success');
    } catch (err) {
      setError('Invalid token or failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setResetStep('requestEmail');
    setResetEmail('');
    setError('');
    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleStartPasswordReset = () => {
    setShowForgotPassword(true);
    setResetStep('requestEmail');
    setError('');
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-harvesters-50 via-white to-harvesters-100 flex flex-col justify-center section-spacing no-horizontal-scroll">
        <div className="container-responsive">
          <div className="max-w-md mx-auto w-full">
            {/* Logo Section */}
            <div className="flex justify-center mb-8 lg:mb-12">
              <Logo size="xl" className="text-harvesters-700" />
            </div>

            {/* Back to Login Button */}
            <div className="mb-6 lg:mb-8">
              <button
                onClick={handleBackToLogin}
                className="flex items-center text-harvesters-600 hover:text-harvesters-700 transition-colors duration-200 font-medium text-sm lg:text-base"
              >
                <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                Back to Login
              </button>
            </div>

            {/* Reset Password Steps */}
            {resetStep === 'requestEmail' && (
              <>
                <div className="text-center space-y-3 lg:space-y-4 mb-8 lg:mb-12">
                  <div className="flex justify-center mb-4 lg:mb-6">
                    <div className="bg-harvesters-600 p-4 lg:p-6 rounded-2xl lg:rounded-3xl text-white">
                      <Mail className="w-8 h-8 lg:w-10 lg:h-10" />
                    </div>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    Reset Your Password
                  </h2>
                  <p className="text-base lg:text-lg text-harvesters-600 leading-relaxed">
                    Enter your email address and we'll send you a reset token
                  </p>
                </div>

                <div className="bg-white card-padding shadow-2xl rounded-2xl lg:rounded-3xl border border-harvesters-100">
                  <form className="form-spacing" onSubmit={handleSubmitForgot(onSubmitForgotPassword)}>
                    <div className="space-y-2 lg:space-y-3">
                      <label htmlFor="resetEmail" className="block text-sm font-semibold text-gray-700">
                        Email address
                      </label>
                      <input
                        id="resetEmail"
                        type="email"
                        autoComplete="email"
                        className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base
                          focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                          ${forgotErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                        placeholder="Enter your email address"
                        {...registerForgot('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                      />
                      {forgotErrors.email && (
                        <p className="text-sm text-red-600 flex items-center">
                          <span className="mr-2">⚠</span>
                          <span className="truncate">{forgotErrors.email.message}</span>
                        </p>
                      )}
                    </div>

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
                            <span className="truncate">Sending reset email...</span>
                          </div>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
                            Send Reset Email
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}

            {resetStep === 'enterToken' && (
              <>
                <div className="text-center space-y-3 lg:space-y-4 mb-8 lg:mb-12">
                  <div className="flex justify-center mb-4 lg:mb-6">
                    <div className="bg-harvesters-600 p-4 lg:p-6 rounded-2xl lg:rounded-3xl text-white">
                      <Key className="w-8 h-8 lg:w-10 lg:h-10" />
                    </div>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    Enter Reset Token
                  </h2>
                  <p className="text-base lg:text-lg text-harvesters-600 leading-relaxed">
                    We've sent a reset token to <strong className="text-harvesters-700">{resetEmail}</strong>
                  </p>
                </div>

                <div className="bg-white card-padding shadow-2xl rounded-2xl lg:rounded-3xl border border-harvesters-100">
                  <form className="form-spacing" onSubmit={handleSubmitReset(onSubmitResetPassword)}>
                    <div className="space-y-2 lg:space-y-3">
                      <label htmlFor="token" className="block text-sm font-semibold text-gray-700">
                        Reset Token
                      </label>
                      <input
                        id="token"
                        type="text"
                        className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base
                          focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                          ${resetErrors.token ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                        placeholder="Enter the token from your email"
                        {...registerReset('token', { 
                          required: 'Reset token is required',
                          minLength: { value: 6, message: 'Token must be at least 6 characters' }
                        })}
                      />
                      {resetErrors.token && (
                        <p className="text-sm text-red-600 flex items-center">
                          <span className="mr-2">⚠</span>
                          <span className="truncate">{resetErrors.token.message}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 lg:space-y-3">
                      <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base pr-12
                            focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                            ${resetErrors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                          placeholder="Enter your new password"
                          {...registerReset('newPassword', { 
                            required: 'New password is required',
                            minLength: { value: 8, message: 'Password must be at least 8 characters' },
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                              message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                            }
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
                      {resetErrors.newPassword && (
                        <p className="text-sm text-red-600 flex items-center">
                          <span className="mr-2">⚠</span>
                          <span className="truncate">{resetErrors.newPassword.message}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 lg:space-y-3">
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base pr-12
                            focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                            ${resetErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                          placeholder="Confirm your new password"
                          {...registerReset('confirmPassword', { 
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
                      {resetErrors.confirmPassword && (
                        <p className="text-sm text-red-600 flex items-center">
                          <span className="mr-2">⚠</span>
                          <span className="truncate">{resetErrors.confirmPassword.message}</span>
                        </p>
                      )}
                    </div>

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
                            <span className="truncate">Resetting password...</span>
                          </div>
                        ) : (
                          <>
                            <Key className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
                            Reset Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Resend Email Option */}
                  <div className="mt-6 lg:mt-8 text-center">
                    <p className="text-sm text-gray-600 mb-3 lg:mb-4">
                      Didn't receive the email?
                    </p>
                    <button
                      onClick={() => setResetStep('requestEmail')}
                      className="text-sm font-medium text-harvesters-600 hover:text-harvesters-700 transition-colors duration-200"
                    >
                      Send another reset email
                    </button>
                  </div>
                </div>
              </>
            )}

            {resetStep === 'success' && (
              <>
                <div className="text-center space-y-3 lg:space-y-4 mb-8 lg:mb-12">
                  <div className="flex justify-center mb-4 lg:mb-6">
                    <div className="bg-green-600 p-4 lg:p-6 rounded-2xl lg:rounded-3xl text-white">
                      <CheckCircle className="w-8 h-8 lg:w-10 lg:h-10" />
                    </div>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    Password Reset Successful!
                  </h2>
                  <p className="text-base lg:text-lg text-harvesters-600 leading-relaxed">
                    Your password has been successfully reset. You can now sign in with your new password.
                  </p>
                </div>

                <div className="bg-white card-padding shadow-2xl rounded-2xl lg:rounded-3xl border border-harvesters-100">
                  <div className="text-center space-y-6 lg:space-y-8">
                    <div className="bg-green-50 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-green-200">
                      <div className="flex items-center justify-center space-x-3 lg:space-x-4">
                        <CheckCircle className="w-6 h-6 lg:w-7 lg:h-7 text-green-600" />
                        <p className="text-sm lg:text-base font-medium text-green-800">
                          Password successfully updated for {resetEmail}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleBackToLogin}
                      className="w-full flex justify-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 focus:ring-2 focus:ring-offset-2 focus:ring-harvesters-500 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-sm lg:text-base"
                    >
                      Continue to Sign In
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

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
            <form className="form-spacing" onSubmit={handleSubmitLogin(onSubmitLogin)}>
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
                      ${loginErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                    placeholder="Enter your email"
                    {...registerLogin('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  {loginErrors.email && (
                    <p className="mt-2 lg:mt-3 text-sm text-red-600 flex items-center">
                      <span className="mr-2">⚠</span>
                      <span className="truncate">{loginErrors.email.message}</span>
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
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base pr-12
                      focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                      ${loginErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                    placeholder="Enter your password"
                    {...registerLogin('password', { required: 'Password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
                  </button>
                  {loginErrors.password && (
                    <p className="mt-2 lg:mt-3 text-sm text-red-600 flex items-center">
                      <span className="mr-2">⚠</span>
                      <span className="truncate">{loginErrors.password.message}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleStartPasswordReset}
                  className="text-sm font-medium text-harvesters-600 hover:text-harvesters-700 transition-colors duration-200"
                >
                  Forgot your password?
                </button>
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