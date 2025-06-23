import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Save, X, Briefcase, Users, Building2 } from 'lucide-react';
import { getTeams, createTeam, updateTeam, deleteTeam } from '../../services';
import { Team } from '../../types/api';

interface TeamFormData {
  name: string;
  description: string;
}

export default function Teams() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TeamFormData>();

  // Fetch all teams
  const { data: teams = [], isLoading } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: getTeams,
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team created successfully! 🎉');
      setIsCreating(false);
      reset();
    },
    onError: (error) => {
      toast.error(`Failed to create team: ${error.message}`);
    },
  });

  // Update team mutation
  const updateTeamMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TeamFormData }) => 
      updateTeam(id, {
        id,
        name: data.name,
        description: data.description,
        departmentCount: editingTeam?.departmentCount || 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team updated successfully! ✨');
      setEditingTeam(null);
      reset();
    },
    onError: (error) => {
      toast.error(`Failed to update team: ${error.message}`);
    },
  });

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete team: ${error.message}`);
    },
  });

  const onSubmit = (data: TeamFormData) => {
    if (editingTeam) {
      updateTeamMutation.mutate({
        id: editingTeam.id,
        data,
      });
    } else {
      createTeamMutation.mutate({
        name: data.name,
        description: data.description,
      });
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    reset({
      name: team.name,
      description: team.description,
    });
  };

  const handleCancelEdit = () => {
    setEditingTeam(null);
    setIsCreating(false);
    reset();
  };

  const handleDelete = (teamId: string, teamName: string) => {
    if (window.confirm(`Are you sure you want to delete the team "${teamName}"? This action cannot be undone and may affect associated departments.`)) {
      deleteTeamMutation.mutate(teamId);
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
      {/* Header Section with Responsive Layout */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 lg:gap-8">
        <div className="space-y-3 lg:space-y-4 min-w-0 flex-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Teams Management
          </h1>
          <p className="text-base lg:text-lg text-harvesters-600 leading-relaxed">
            Organize and manage church teams to streamline ministry operations
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <button
            onClick={() => setIsCreating(true)}
            disabled={isCreating || editingTeam}
            className="flex items-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 disabled:bg-harvesters-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base whitespace-nowrap"
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
            <span className="truncate">Create Team</span>
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingTeam) && (
        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-harvesters-100 overflow-hidden">
          <div className="card-padding border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 lg:space-x-6">
                <div className="bg-harvesters-600 p-3 lg:p-4 rounded-xl lg:rounded-2xl text-white">
                  <Briefcase className="w-6 h-6 lg:w-7 lg:h-7" />
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                    {editingTeam ? 'Edit Team' : 'Create New Team'}
                  </h2>
                  <p className="text-sm text-harvesters-600 mt-1">
                    {editingTeam ? 'Update team information and settings' : 'Add a new team to organize church ministries'}
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
              {/* Team Name Field */}
              <div className="space-y-2 lg:space-y-3">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                  Team Name *
                </label>
                <input
                  id="name"
                  type="text"
                  className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base
                    focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                    ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                  placeholder="Enter team name (e.g., Creative Arts, Pastoral Care)"
                  {...register('name', { 
                    required: 'Team name is required',
                    minLength: { value: 2, message: 'Team name must be at least 2 characters' },
                    maxLength: { value: 50, message: 'Team name must be less than 50 characters' }
                  })}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-2">⚠</span>
                    <span className="truncate">{errors.name.message}</span>
                  </p>
                )}
              </div>

              {/* Team Description Field */}
              <div className="space-y-2 lg:space-y-3">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base
                    focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200 resize-none
                    ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                  placeholder="Describe the team's purpose, responsibilities, and ministry focus..."
                  {...register('description', { 
                    required: 'Team description is required',
                    minLength: { value: 10, message: 'Description must be at least 10 characters' },
                    maxLength: { value: 500, message: 'Description must be less than 500 characters' }
                  })}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-2">⚠</span>
                    <span className="truncate">{errors.description.message}</span>
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-4 lg:pt-6">
                <button
                  type="submit"
                  disabled={createTeamMutation.isPending || updateTeamMutation.isPending}
                  className="flex items-center justify-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 disabled:bg-harvesters-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base"
                >
                  {(createTeamMutation.isPending || updateTeamMutation.isPending) ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-b-2 border-white mr-2 lg:mr-3"></div>
                      <span className="truncate">Saving...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
                      <span className="truncate">{editingTeam ? 'Update Team' : 'Create Team'}</span>
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

      {/* Teams List */}
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-harvesters-100 overflow-hidden">
        <div className="card-padding border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 lg:space-x-6">
              <div className="bg-harvesters-500 p-3 lg:p-4 rounded-xl lg:rounded-2xl text-white">
                <Users className="w-6 h-6 lg:w-7 lg:h-7" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Church Teams ({teams.length})
                </h2>
                <p className="text-sm text-harvesters-600 mt-1">
                  Manage and organize your ministry teams
                </p>
              </div>
            </div>
          </div>
        </div>

        {teams.length === 0 ? (
          <div className="card-padding text-center py-12 lg:py-16">
            <Briefcase className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-4 lg:mb-6" />
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 lg:mb-3">
              No teams created yet
            </h3>
            <p className="text-sm lg:text-base text-gray-600 mb-6 lg:mb-8 max-w-md mx-auto">
              Create your first team to start organizing church ministries and departments effectively.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
              Create First Team
            </button>
          </div>
        ) : (
          <div className="grid-responsive grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => (
              <div key={team.id} className="bg-white border border-gray-100 hover:border-harvesters-200 hover:shadow-lg transition-all duration-300 group">
                <div className="card-padding">
                  {/* Team Header */}
                  <div className="flex items-start justify-between mb-4 lg:mb-6">
                    <div className="flex items-center space-x-3 lg:space-x-4 flex-1 min-w-0">
                      <div className="bg-harvesters-600 p-2 lg:p-3 rounded-lg lg:rounded-xl text-white group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                        <Briefcase className="w-5 h-5 lg:w-6 lg:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg lg:text-xl font-bold text-gray-900 truncate">
                          {team.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Building2 className="w-3 h-3 lg:w-4 lg:h-4 text-harvesters-600 flex-shrink-0" />
                          <span className="text-xs lg:text-sm text-harvesters-600 truncate">
                            {team.departmentCount} {team.departmentCount === 1 ? 'Department' : 'Departments'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(team)}
                        disabled={isCreating || editingTeam}
                        className="p-2 lg:p-3 text-harvesters-600 hover:text-harvesters-700 hover:bg-harvesters-50 rounded-lg lg:rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Edit team"
                      >
                        <Edit2 className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(team.id, team.name)}
                        disabled={deleteTeamMutation.isPending}
                        className="p-2 lg:p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg lg:rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete team"
                      >
                        <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Team Description */}
                  <div className="space-y-3 lg:space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                      {team.description}
                    </p>

                    {/* Team Stats */}
                    <div className="flex items-center justify-between pt-3 lg:pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-harvesters-500 rounded-full"></div>
                        <span className="text-xs lg:text-sm text-gray-600 font-medium">
                          Active Team
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs lg:text-sm text-harvesters-600 font-semibold">
                          ID: {team.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Enhancement */}
                <div className="h-1 bg-gradient-to-r from-harvesters-200 to-harvesters-400 group-hover:from-harvesters-400 group-hover:to-harvesters-600 transition-all duration-300"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}