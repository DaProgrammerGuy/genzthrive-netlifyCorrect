import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchUserProgress, 
  updateUserProgress,
  fetchUserSkills,
  updateSkillProgress,
  fetchUserIncomeStreams,
  updateIncomeStream
} from '@/lib/api-client';
import { useUser } from './use-user.ts';

// Progress hooks
export function useUserProgress() {
  const { userId, isLoading: userLoading } = useUser();
  
  return useQuery({
    queryKey: ['progress', userId],
    queryFn: () => fetchUserProgress(userId!),
    enabled: !userLoading && !!userId
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  const { userId } = useUser();
  
  return useMutation({
    mutationFn: ({ phase, progress, completedTasks }: { phase: number; progress: number; completedTasks?: string[] }) => 
      updateUserProgress(userId!, phase, progress, completedTasks || []),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', userId] });
    }
  });
}

// Skills hooks
export function useUserSkills() {
  const { userId, isLoading: userLoading } = useUser();
  
  return useQuery({
    queryKey: ['skills', userId],
    queryFn: () => fetchUserSkills(userId!),
    enabled: !userLoading && !!userId
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();
  const { userId } = useUser();
  
  return useMutation({
    mutationFn: ({ skillCategory, skillName, level }: { skillCategory: string; skillName: string; level: number }) => 
      updateSkillProgress(userId!, skillCategory, skillName, level),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills', userId] });
    }
  });
}

// Income streams hooks
export function useUserIncomeStreams() {
  const { userId, isLoading: userLoading } = useUser();
  
  return useQuery({
    queryKey: ['income', userId],
    queryFn: () => fetchUserIncomeStreams(userId!),
    enabled: !userLoading && !!userId
  });
}

export function useUpdateIncomeStream() {
  const queryClient = useQueryClient();
  const { userId } = useUser();
  
  return useMutation({
    mutationFn: ({ streamType, isActive, monthlyRevenue }: { streamType: string; isActive: boolean; monthlyRevenue?: number }) => 
      updateIncomeStream(userId!, streamType, isActive, monthlyRevenue || 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income', userId] });
    }
  });
}
