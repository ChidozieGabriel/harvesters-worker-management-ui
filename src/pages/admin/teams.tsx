import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Disclosure } from '@headlessui/react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Briefcase, 
  Users, 
  Building2, 
  ChevronDown, 
  ChevronUp,
  FolderOpen,
  Folder
} from 'lucide-react';
import { 
  getTeams, 
  createTeam, 
  updateTeam, 
  deleteTeam,
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../../services';
import { Team, Department } from '../../types/api';

interface TeamFormData {
  name: string;
  description: string;
}

interface DepartmentFormData {
  name: string;
  description: string;
  teamName: string;
}

type EditingType = 'team' | 'department' | null;

export default function TeamsAndDepartments() {
  const [isCreating, setIsCreating] = useState<EditingType>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { register: registerTeam, handleSubmit: handleSubmitTeam, reset: resetTeam, formState: { errors: teamErrors } } = useForm<TeamFormData>();
  const { register: registerDepartment, handleSubmit: handleSubmitDepartment, reset: resetDepartment, formState: { errors: departmentErrors } } = useForm<DepartmentFormData>();

  // Fetch all teams
  const { data: teams = [], isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: getTeams,
  });

  // Fetch all departments
  const { data: departments = [], isLoading: departmentsLoading } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: getAllDepartments,
  });

  // Team mutations
  const createTeamMutation = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team created successfully! 🎉');
      setIsCreating(null);
      resetTeam();
    },
    onError: (error) => {
      toast.error(`Failed to create team: ${error.message}`);
    },
  });

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
      resetTeam();
    },
    onError: (error) => {
      toast.error(`Failed to update team: ${error.message}`);
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Team deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete team: ${error.message}`);
    },
  });

  // Department mutations
  const createDepartmentMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Department created successfully! 🎉');
      setIsCreating(null);
      resetDepartment();
    },
    onError: (error) => {
      toast.error(`Failed to create department: ${error.message}`);
    },
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DepartmentFormData }) => 
      updateDepartment(id, {
        id,
        name: data.name,
        description: data.description,
        teamName: data.teamName,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Department updated successfully! ✨');
      setEditingDepartment(null);
      resetDepartment();
    },
    onError: (error) => {
      toast.error(`Failed to update department: ${error.message}`);
    },
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Department deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete department: ${error.message}`);
    },
  });

  // Form handlers
  const onSubmitTeam = (data: TeamFormData) => {
    if (editingTeam) {
      updateTeamMutation.mutate({ id: editingTeam.id, data });
    } else {
      createTeamMutation.mutate(data);
    }
  };

  const onSubmitDepartment = (data: DepartmentFormData) => {
    if (editingDepartment) {
      updateDepartmentMutation.mutate({ id: editingDepartment.id, data });
    } else {
      createDepartmentMutation.mutate(data);
    }
  };

  // Edit handlers
  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    resetTeam({
      name: team.name,
      description: team.description,
    });
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    resetDepartment({
      name: department.name,
      description: department.description,
      teamName: department.teamName,
    });
  };

  const handleCancelEdit = () => {
    setEditingTeam(null);
    setEditingDepartment(null);
    setIsCreating(null);
    resetTeam();
    resetDepartment();
  };

  // Delete handlers
  const handleDeleteTeam = (teamId: string, teamName: string) => {
    const teamDepartments = departments.filter(dept => dept.teamName === teamName);
    const confirmMessage = teamDepartments.length > 0 
      ? `Are you sure you want to delete the team "${teamName}"? This will also affect ${teamDepartments.length} department(s). This action cannot be undone.`
      : `Are you sure you want to delete the team "${teamName}"? This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      deleteTeamMutation.mutate(teamId);
    }
  };

  const handleDeleteDepartment = (departmentId: string, departmentName: string) => {
    if (window.confirm(`Are you sure you want to delete the department "${departmentName}"? This action cannot be undone and may affect associated workers.`)) {
      deleteDepartmentMutation.mutate(departmentId);
    }
  };

  // Group departments by team
  const departmentsByTeam = departments.reduce((acc, department) => {
    const teamName = department.teamName || 'Unassigned';
    if (!acc[teamName]) {
      acc[teamName] = [];
    }
    acc[teamName].push(department);
    return acc;
  }, {} as Record<string, Department[]>);

  // Toggle team expansion
  const toggleTeamExpansion = (teamName: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamName)) {
      newExpanded.delete(teamName);
    } else {
      newExpanded.add(teamName);
    }
    setExpandedTeams(newExpanded);
  };

  if (teamsLoading || departmentsLoading) {
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
            Teams & Departments
          </h1>
          <p className="text-base lg:text-lg text-harvesters-600 leading-relaxed">
            Organize and manage church teams and their associated departments
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 flex-shrink-0">
          <button
            onClick={() => setIsCreating('team')}
            disabled={isCreating !== null || editingTeam || editingDepartment}
            className="flex items-center justify-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 disabled:bg-harvesters-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base whitespace-nowrap"
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
            <span className="truncate">Create Team</span>
          </button>
          
          <button
            onClick={() => setIsCreating('department')}
            disabled={isCreating !== null || editingTeam || editingDepartment || teams.length === 0}
            className="flex items-center justify-center button-padding bg-harvesters-500 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-600 disabled:bg-harvesters-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base whitespace-nowrap"
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
            <span className="truncate">Create Department</span>
          </button>
        </div>
      </div>

      {/* Create/Edit Forms */}
      {(isCreating === 'team' || editingTeam) && (
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
            <form onSubmit={handleSubmitTeam(onSubmitTeam)} className="form-spacing">
              <div className="space-y-2 lg:space-y-3">
                <label htmlFor="teamName" className="block text-sm font-semibold text-gray-700">
                  Team Name *
                </label>
                <input
                  id="teamName"
                  type="text"
                  className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base
                    focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                    ${teamErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                  placeholder="Enter team name (e.g., Creative Arts, Pastoral Care)"
                  {...registerTeam('name', { 
                    required: 'Team name is required',
                    minLength: { value: 2, message: 'Team name must be at least 2 characters' },
                    maxLength: { value: 50, message: 'Team name must be less than 50 characters' }
                  })}
                />
                {teamErrors.name && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-2">⚠</span>
                    <span className="truncate">{teamErrors.name.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2 lg:space-y-3">
                <label htmlFor="teamDescription" className="block text-sm font-semibold text-gray-700">
                  Description *
                </label>
                <textarea
                  id="teamDescription"
                  rows={4}
                  className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base
                    focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200 resize-none
                    ${teamErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                  placeholder="Describe the team's purpose, responsibilities, and ministry focus..."
                  {...registerTeam('description', { 
                    required: 'Team description is required',
                    minLength: { value: 10, message: 'Description must be at least 10 characters' },
                    maxLength: { value: 500, message: 'Description must be less than 500 characters' }
                  })}
                />
                {teamErrors.description && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-2">⚠</span>
                    <span className="truncate">{teamErrors.description.message}</span>
                  </p>
                )}
              </div>

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

      {(isCreating === 'department' || editingDepartment) && (
        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-harvesters-100 overflow-hidden">
          <div className="card-padding border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 lg:space-x-6">
                <div className="bg-harvesters-500 p-3 lg:p-4 rounded-xl lg:rounded-2xl text-white">
                  <Building2 className="w-6 h-6 lg:w-7 lg:h-7" />
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                    {editingDepartment ? 'Edit Department' : 'Create New Department'}
                  </h2>
                  <p className="text-sm text-harvesters-600 mt-1">
                    {editingDepartment ? 'Update department information and team assignment' : 'Add a new department to organize church ministries'}
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
            <form onSubmit={handleSubmitDepartment(onSubmitDepartment)} className="form-spacing">
              <div className="space-y-2 lg:space-y-3">
                <label htmlFor="departmentName" className="block text-sm font-semibold text-gray-700">
                  Department Name *
                </label>
                <input
                  id="departmentName"
                  type="text"
                  className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base
                    focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                    ${departmentErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                  placeholder="Enter department name (e.g., Worship, Youth Ministry)"
                  {...registerDepartment('name', { 
                    required: 'Department name is required',
                    minLength: { value: 2, message: 'Department name must be at least 2 characters' },
                    maxLength: { value: 50, message: 'Department name must be less than 50 characters' }
                  })}
                />
                {departmentErrors.name && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-2">⚠</span>
                    <span className="truncate">{departmentErrors.name.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2 lg:space-y-3">
                <label htmlFor="departmentTeam" className="block text-sm font-semibold text-gray-700">
                  Assigned Team *
                </label>
                <select
                  id="departmentTeam"
                  className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm text-sm lg:text-base
                    focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200
                    ${departmentErrors.teamName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                  {...registerDepartment('teamName', { 
                    required: 'Team assignment is required'
                  })}
                >
                  <option value="">Select a team...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </select>
                {departmentErrors.teamName && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-2">⚠</span>
                    <span className="truncate">{departmentErrors.teamName.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2 lg:space-y-3">
                <label htmlFor="departmentDescription" className="block text-sm font-semibold text-gray-700">
                  Description *
                </label>
                <textarea
                  id="departmentDescription"
                  rows={4}
                  className={`appearance-none block w-full button-padding border rounded-xl lg:rounded-2xl shadow-sm placeholder-gray-400 text-sm lg:text-base
                    focus:outline-none focus:ring-2 focus:ring-harvesters-500 focus:border-transparent transition-all duration-200 resize-none
                    ${departmentErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-harvesters-300'}`}
                  placeholder="Describe the department's purpose, responsibilities, and ministry focus..."
                  {...registerDepartment('description', { 
                    required: 'Department description is required',
                    minLength: { value: 10, message: 'Description must be at least 10 characters' },
                    maxLength: { value: 500, message: 'Description must be less than 500 characters' }
                  })}
                />
                {departmentErrors.description && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-2">⚠</span>
                    <span className="truncate">{departmentErrors.description.message}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-4 lg:pt-6">
                <button
                  type="submit"
                  disabled={createDepartmentMutation.isPending || updateDepartmentMutation.isPending}
                  className="flex items-center justify-center button-padding bg-harvesters-500 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-600 disabled:bg-harvesters-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base"
                >
                  {(createDepartmentMutation.isPending || updateDepartmentMutation.isPending) ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-b-2 border-white mr-2 lg:mr-3"></div>
                      <span className="truncate">Saving...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
                      <span className="truncate">{editingDepartment ? 'Update Department' : 'Create Department'}</span>
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

      {/* Teams & Departments Hierarchical List */}
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-harvesters-100 overflow-hidden">
        <div className="card-padding border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 lg:space-x-6">
              <div className="bg-harvesters-600 p-3 lg:p-4 rounded-xl lg:rounded-2xl text-white">
                <Users className="w-6 h-6 lg:w-7 lg:h-7" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Organization Structure
                </h2>
                <p className="text-sm text-harvesters-600 mt-1">
                  {teams.length} teams • {departments.length} departments
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
              onClick={() => setIsCreating('team')}
              className="inline-flex items-center button-padding bg-harvesters-600 text-white rounded-xl lg:rounded-2xl hover:bg-harvesters-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
              Create First Team
            </button>
          </div>
        ) : (
          <div className="space-y-0">
            {teams.map((team) => {
              const teamDepartments = departmentsByTeam[team.name] || [];
              const isExpanded = expandedTeams.has(team.name);
              
              return (
                <Disclosure key={team.id} defaultOpen={isExpanded}>
                  {({ open }) => (
                    <>
                      <Disclosure.Button 
                        className="w-full card-padding border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50"
                        onClick={() => toggleTeamExpansion(team.name)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 lg:space-x-6 flex-1 min-w-0">
                            <div className="flex items-center space-x-3 lg:space-x-4">
                              <div className="bg-harvesters-600 p-2 lg:p-3 rounded-lg lg:rounded-xl text-white">
                                <Briefcase className="w-5 h-5 lg:w-6 lg:h-6" />
                              </div>
                              {open ? (
                                <FolderOpen className="w-5 h-5 lg:w-6 lg:h-6 text-harvesters-600" />
                              ) : (
                                <Folder className="w-5 h-5 lg:w-6 lg:h-6 text-harvesters-500" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center gap-3 lg:gap-4 mb-1">
                                <h3 className="text-lg lg:text-xl font-bold text-gray-900 truncate">
                                  {team.name}
                                </h3>
                                <span className="inline-flex items-center px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-medium bg-harvesters-100 text-harvesters-800 flex-shrink-0">
                                  {teamDepartments.length} {teamDepartments.length === 1 ? 'dept' : 'depts'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 truncate">
                                {team.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTeam(team);
                              }}
                              disabled={isCreating !== null || editingTeam || editingDepartment}
                              className="p-2 lg:p-3 text-harvesters-600 hover:text-harvesters-700 hover:bg-harvesters-50 rounded-lg lg:rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Edit team"
                            >
                              <Edit2 className="w-4 h-4 lg:w-5 lg:h-5" />
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTeam(team.id, team.name);
                              }}
                              disabled={deleteTeamMutation.isPending}
                              className="p-2 lg:p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg lg:rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Delete team"
                            >
                              <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                            </button>

                            {open ? (
                              <ChevronUp className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </Disclosure.Button>

                      <Disclosure.Panel className="bg-gray-50 border-b border-gray-100">
                        {teamDepartments.length === 0 ? (
                          <div className="card-padding text-center py-8 lg:py-12">
                            <Building2 className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400 mx-auto mb-3 lg:mb-4" />
                            <p className="text-sm text-gray-600 mb-4 lg:mb-6">
                              No departments in this team yet
                            </p>
                            <button
                              onClick={() => {
                                setIsCreating('department');
                                resetDepartment({ name: '', description: '', teamName: team.name });
                              }}
                              disabled={isCreating !== null || editingTeam || editingDepartment}
                              className="inline-flex items-center px-3 py-2 lg:px-4 lg:py-2 bg-harvesters-500 text-white rounded-lg lg:rounded-xl hover:bg-harvesters-600 disabled:bg-harvesters-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-medium text-xs lg:text-sm"
                            >
                              <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                              Add Department
                            </button>
                          </div>
                        ) : (
                          <div className="card-padding">
                            <div className="grid-responsive grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                              {teamDepartments.map((department) => (
                                <div key={department.id} className="bg-white border border-gray-200 rounded-xl lg:rounded-2xl hover:border-harvesters-200 hover:shadow-lg transition-all duration-300 group">
                                  <div className="card-padding">
                                    <div className="flex items-start justify-between mb-4 lg:mb-6">
                                      <div className="flex items-center space-x-3 lg:space-x-4 flex-1 min-w-0">
                                        <div className="bg-harvesters-500 p-2 lg:p-3 rounded-lg lg:rounded-xl text-white group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                                          <Building2 className="w-4 h-4 lg:w-5 lg:h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="text-base lg:text-lg font-bold text-gray-900 truncate">
                                            {department.name}
                                          </h4>
                                          <p className="text-xs lg:text-sm text-harvesters-600 truncate">
                                            Department
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
                                        <button
                                          onClick={() => handleEditDepartment(department)}
                                          disabled={isCreating !== null || editingTeam || editingDepartment}
                                          className="p-2 lg:p-3 text-harvesters-600 hover:text-harvesters-700 hover:bg-harvesters-50 rounded-lg lg:rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                          aria-label="Edit department"
                                        >
                                          <Edit2 className="w-3 h-3 lg:w-4 lg:h-4" />
                                        </button>
                                        
                                        <button
                                          onClick={() => handleDeleteDepartment(department.id, department.name)}
                                          disabled={deleteDepartmentMutation.isPending}
                                          className="p-2 lg:p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg lg:rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                          aria-label="Delete department"
                                        >
                                          <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                                        </button>
                                      </div>
                                    </div>

                                    <div className="space-y-3 lg:space-y-4">
                                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                                        {department.description}
                                      </p>

                                      <div className="flex items-center justify-between pt-3 lg:pt-4 border-t border-gray-200">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-harvesters-500 rounded-full"></div>
                                          <span className="text-xs lg:text-sm text-gray-600 font-medium">
                                            Active
                                          </span>
                                        </div>
                                        
                                        <div className="text-right">
                                          <p className="text-xs lg:text-sm text-harvesters-600 font-semibold">
                                            ID: {department.id.slice(-6).toUpperCase()}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="h-1 bg-gradient-to-r from-harvesters-200 to-harvesters-400 group-hover:from-harvesters-400 group-hover:to-harvesters-600 transition-all duration-300"></div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}