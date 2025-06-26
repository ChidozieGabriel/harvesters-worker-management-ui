import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  Plus, 
  Upload, 
  Download, 
  Trash2, 
  X, 
  BookOpen, 
  File, 
  Calendar,
  Search,
  Filter,
  FileText,
  Heart,
  Star,
  Eye
} from 'lucide-react';
import { 
  getAllDevotionals, 
  uploadDevotional, 
  downloadDevotional, 
  deleteDevotional 
} from '../services';
import { Devotional } from '../types/api';
import { useAuthStore } from '../store/auth';

interface DevotionalFormData {
  file: FileList;
}

export default function Devotionals() {
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const { isAdmin } = useAuthStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DevotionalFormData>();

  // Fetch all devotionals
  const { data: devotionals = [], isLoading } = useQuery<Devotional[]>({
    queryKey: ['devotionals'],
    queryFn: getAllDevotionals,
  });

  // Upload devotional mutation
  const uploadDevotionalMutation = useMutation({
    mutationFn: uploadDevotional,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devotionals'] });
      toast.success('Devotional uploaded successfully! 🎉');
      setIsUploading(false);
      setSelectedFile(null);
      reset();
    },
    onError: (error) => {
      toast.error(`Failed to upload devotional: ${error.message}`);
    },
  });

  // Delete devotional mutation
  const deleteDevotionalMutation = useMutation({
    mutationFn: deleteDevotional,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devotionals'] });
      toast.success('Devotional deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete devotional: ${error.message}`);
    },
  });

  // Form handlers
  const onSubmit = () => {
    if (selectedFile) {
      uploadDevotionalMutation.mutate(selectedFile);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleCancelUpload = () => {
    setIsUploading(false);
    setSelectedFile(null);
    reset();
  };

  const handleDownload = async (devotional: Devotional) => {
    try {
      const blob = await downloadDevotional(devotional.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${devotional.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started! 📥');
    } catch (error) {
      toast.error('Failed to download devotional');
    }
  };

  const handleDelete = (devotionalId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      deleteDevotionalMutation.mutate(devotionalId);
    }
  };

  // Filter devotionals based on search
  const filteredDevotionals = devotionals.filter(devotional =>
    searchTerm === '' || 
    devotional.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get file extension and type
  const getFileInfo = (title: string) => {
    const extension = title.split('.').pop()?.toLowerCase() || 'pdf';
    const fileTypes = {
      pdf: { icon: FileText, color: 'bg-red-500', name: 'PDF' },
      doc: { icon: File, color: 'bg-blue-500', name: 'DOC' },
      docx: { icon: File, color: 'bg-blue-500', name: 'DOCX' },
      txt: { icon: File, color: 'bg-gray-500', name: 'TXT' },
    };
    return fileTypes[extension as keyof typeof fileTypes] || fileTypes.pdf;
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
            Devotionals Library
          </h1>
          <p className="text-base lg:text-lg text-harvesters-600 leading-relaxed">
            Access daily devotionals and spiritual reading materials for personal growth
          </p>
        </div>
        
        {isAdmin() && (
          <div className="flex-shrink-0">
            <button
              onClick={() => setIsUploading(true)}
              disabled={isUploading}
              className="flex items-center justify-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 disabled:bg-harvesters-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base whitespace-nowrap"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
              <span className="truncate">Upload Devotional</span>
            </button>
          </div>
        )}
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-harvesters-100 overflow-hidden">
        <div className="card-padding border-b border-gray-100">
          <div className="flex items-center space-x-4 lg:space-x-6">
            <div className="bg-harvesters-600 p-3 lg:p-4 rounded-xl lg:rounded-2xl text-white">
              <Search className="w-6 h-6 lg:w-7 lg:h-7" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                Search Devotionals
              </h2>
              <p className="text-sm text-harvesters-600 mt-1">
                Find devotionals by title or content
              </p>
            </div>
          </div>
        </div>

        <div className="card-padding">
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="appearance-none block w-full pl-10 lg:pl-12 pr-4 py-2 lg:py-3 border border-gray-300 rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent hover:border-harvesters-300 transition-all duration-200"
                  placeholder="Search devotionals by title..."
                />
              </div>
            </div>
            
            <div className="flex items-center justify-center px-4 py-2 lg:px-6 lg:py-3 bg-harvesters-50 border border-harvesters-200 rounded-xl lg:rounded-2xl">
              <span className="text-sm lg:text-base font-semibold text-harvesters-700">
                {filteredDevotionals.length} of {devotionals.length} devotionals
              </span>
            </div>
          </div>

          {searchTerm && (
            <div className="mt-4 lg:mt-6 flex justify-center">
              <button
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base font-medium text-harvesters-600 hover:text-harvesters-700 hover:bg-harvesters-50 rounded-lg lg:rounded-xl transition-colors duration-200"
              >
                <X className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Form */}
      {isUploading && (
        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-harvesters-100 overflow-hidden">
          <div className="card-padding border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 lg:space-x-6">
                <div className="bg-harvesters-600 p-3 lg:p-4 rounded-xl lg:rounded-2xl text-white">
                  <Upload className="w-6 h-6 lg:w-7 lg:h-7" />
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                    Upload New Devotional
                  </h2>
                  <p className="text-sm text-harvesters-600 mt-1">
                    Share spiritual content with the church community
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelUpload}
                className="p-2 lg:p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg lg:rounded-xl transition-colors duration-200"
                aria-label="Cancel upload"
              >
                <X className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            </div>
          </div>
          
          <div className="card-padding">
            <form onSubmit={handleSubmit(onSubmit)} className="form-spacing">
              <div className="space-y-2 lg:space-y-3">
                <label htmlFor="file" className="block text-sm font-semibold text-gray-700">
                  Select Devotional File *
                </label>
                <div className="relative">
                  <input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    {...register('file', { 
                      required: 'Please select a file to upload',
                      validate: {
                        fileSize: (files) => {
                          if (files && files.length > 0) {
                            const file = files[0];
                            const maxSize = 10 * 1024 * 1024; // 10MB
                            return file.size <= maxSize || 'File size must be less than 10MB';
                          }
                          return true;
                        },
                        fileType: (files) => {
                          if (files && files.length > 0) {
                            const file = files[0];
                            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
                            return allowedTypes.includes(file.type) || 'Only PDF, DOC, DOCX, and TXT files are allowed';
                          }
                          return true;
                        }
                      }
                    })}
                    onChange={handleFileSelect}
                  />
                  <label
                    htmlFor="file"
                    className={`flex flex-col items-center justify-center w-full h-32 lg:h-40 border-2 border-dashed rounded-xl lg:rounded-2xl cursor-pointer transition-all duration-200
                      ${selectedFile 
                        ? 'border-harvesters-400 bg-harvesters-50' 
                        : 'border-gray-300 hover:border-harvesters-400 hover:bg-harvesters-50'
                      }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {selectedFile ? (
                        <>
                          <File className="w-8 h-8 lg:w-10 lg:h-10 text-harvesters-600 mb-2 lg:mb-3" />
                          <p className="text-sm lg:text-base font-semibold text-harvesters-700 mb-1">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs lg:text-sm text-harvesters-600">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400 mb-2 lg:mb-3" />
                          <p className="text-sm lg:text-base font-semibold text-gray-700 mb-1">
                            Click to upload devotional file
                          </p>
                          <p className="text-xs lg:text-sm text-gray-500">
                            PDF, DOC, DOCX, or TXT (Max 10MB)
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
                {errors.file && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-2">⚠</span>
                    <span className="truncate">{errors.file.message}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-4 lg:pt-6">
                <button
                  type="submit"
                  disabled={uploadDevotionalMutation.isPending || !selectedFile}
                  className="flex items-center justify-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 disabled:bg-harvesters-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base"
                >
                  {uploadDevotionalMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-b-2 border-white mr-2 lg:mr-3"></div>
                      <span className="truncate">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
                      <span className="truncate">Upload Devotional</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancelUpload}
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

      {/* Devotionals Grid */}
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-harvesters-100 overflow-hidden">
        <div className="card-padding border-b border-gray-100">
          <div className="flex items-center space-x-4 lg:space-x-6">
            <div className="bg-harvesters-600 p-3 lg:p-4 rounded-xl lg:rounded-2xl text-white">
              <BookOpen className="w-6 h-6 lg:w-7 lg:h-7" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                Available Devotionals ({filteredDevotionals.length})
              </h2>
              <p className="text-sm text-harvesters-600 mt-1">
                Spiritual reading materials for daily growth and reflection
              </p>
            </div>
          </div>
        </div>

        {devotionals.length === 0 ? (
          <div className="card-padding text-center py-12 lg:py-16">
            <BookOpen className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-4 lg:mb-6" />
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 lg:mb-3">
              No devotionals available yet
            </h3>
            <p className="text-sm lg:text-base text-gray-600 mb-6 lg:mb-8 max-w-md mx-auto">
              {isAdmin() 
                ? 'Upload your first devotional to start building the spiritual library for your church community.'
                : 'Devotionals will appear here once they are uploaded by church administrators.'
              }
            </p>
            {isAdmin() && (
              <button
                onClick={() => setIsUploading(true)}
                className="inline-flex items-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base"
              >
                <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
                Upload First Devotional
              </button>
            )}
          </div>
        ) : filteredDevotionals.length === 0 ? (
          <div className="card-padding text-center py-12 lg:py-16">
            <Search className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-4 lg:mb-6" />
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 lg:mb-3">
              No devotionals match your search
            </h3>
            <p className="text-sm lg:text-base text-gray-600 mb-6 lg:mb-8">
              Try adjusting your search terms to find the devotionals you're looking for.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base font-medium text-harvesters-600 hover:text-harvesters-700 hover:bg-harvesters-50 rounded-lg lg:rounded-xl transition-colors duration-200"
            >
              <X className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
              Clear Search
            </button>
          </div>
        ) : (
          <div className="card-padding">
            <div className="grid-responsive grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {filteredDevotionals.map((devotional) => {
                const fileInfo = getFileInfo(devotional.title);
                const uploadDate = new Date(devotional.uploadedAt);
                
                return (
                  <div
                    key={devotional.id}
                    className="bg-white border-2 border-gray-200 rounded-2xl lg:rounded-3xl hover:border-harvesters-200 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    {/* Header with file type indicator */}
                    <div className="relative bg-gradient-to-br from-harvesters-50 to-harvesters-100 p-6 lg:p-8">
                      <div className="flex items-center justify-between mb-4 lg:mb-6">
                        <div className={`${fileInfo.color} p-3 lg:p-4 rounded-xl lg:rounded-2xl text-white group-hover:scale-105 transition-transform duration-200`}>
                          <fileInfo.icon className="w-6 h-6 lg:w-7 lg:h-7" />
                        </div>
                        <span className="inline-flex items-center px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-medium bg-white text-harvesters-700 border border-harvesters-200">
                          {fileInfo.name}
                        </span>
                      </div>

                      <div className="space-y-2 lg:space-y-3">
                        <h3 className="text-lg lg:text-xl font-bold text-gray-900 leading-tight line-clamp-2">
                          {devotional.title}
                        </h3>
                        
                        <div className="flex items-center space-x-2 text-sm text-harvesters-600">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>
                            Uploaded {format(uploadDate, 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content area */}
                    <div className="p-6 lg:p-8">
                      <div className="space-y-4 lg:space-y-6">
                        {/* Devotional preview/description */}
                        <div className="bg-harvesters-50 rounded-xl lg:rounded-2xl p-4 lg:p-6">
                          <div className="flex items-center space-x-3 lg:space-x-4 mb-3 lg:mb-4">
                            <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-harvesters-600" />
                            <span className="text-sm lg:text-base font-semibold text-harvesters-700">
                              Daily Spiritual Reading
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            A carefully curated devotional to guide your spiritual journey and deepen your relationship with God.
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-3 lg:gap-4">
                          <button
                            onClick={() => handleDownload(devotional)}
                            className="flex items-center justify-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base group/btn"
                          >
                            <Download className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0 group-hover/btn:scale-110 transition-transform duration-200" />
                            <span className="truncate">Download & Read</span>
                          </button>

                          {isAdmin() && (
                            <button
                              onClick={() => handleDelete(devotional.id, devotional.title)}
                              disabled={deleteDevotionalMutation.isPending}
                              className="flex items-center justify-center px-4 py-2 lg:px-6 lg:py-3 border border-red-300 text-red-600 rounded-xl lg:rounded-2xl hover:bg-red-50 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm lg:text-base"
                            >
                              <Trash2 className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
                              <span className="truncate">Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom accent */}
                    <div className="h-1 lg:h-2 bg-gradient-to-r from-harvesters-400 to-harvesters-600 group-hover:from-harvesters-500 group-hover:to-harvesters-700 transition-all duration-300"></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Spiritual Growth Tips */}
      <div className="bg-gradient-to-br from-harvesters-50 via-white to-harvesters-100 rounded-2xl lg:rounded-3xl shadow-lg border border-harvesters-200 overflow-hidden">
        <div className="card-padding">
          <div className="flex items-center space-x-4 lg:space-x-6 mb-6 lg:mb-8">
            <div className="bg-harvesters-600 p-3 lg:p-4 rounded-xl lg:rounded-2xl text-white">
              <Star className="w-6 h-6 lg:w-7 lg:h-7" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                Spiritual Growth Tips
              </h2>
              <p className="text-sm text-harvesters-600 mt-1">
                Make the most of your devotional time
              </p>
            </div>
          </div>

          <div className="grid-responsive grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-harvesters-100">
              <div className="flex items-center space-x-3 lg:space-x-4 mb-3 lg:mb-4">
                <div className="bg-blue-100 p-2 lg:p-3 rounded-lg lg:rounded-xl">
                  <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
                <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                  Daily Consistency
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Set aside a specific time each day for devotional reading to build a consistent spiritual habit.
              </p>
            </div>

            <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-harvesters-100">
              <div className="flex items-center space-x-3 lg:space-x-4 mb-3 lg:mb-4">
                <div className="bg-green-100 p-2 lg:p-3 rounded-lg lg:rounded-xl">
                  <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
                <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                  Reflective Reading
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Take time to reflect on the message and how it applies to your life and spiritual journey.
              </p>
            </div>

            <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-harvesters-100">
              <div className="flex items-center space-x-3 lg:space-x-4 mb-3 lg:mb-4">
                <div className="bg-purple-100 p-2 lg:p-3 rounded-lg lg:rounded-xl">
                  <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                </div>
                <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                  Journal Insights
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Keep a spiritual journal to record insights, prayers, and personal reflections from your reading.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}