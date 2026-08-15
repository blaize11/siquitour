import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { apiFetch } from '../client';
import type { User } from '../../types/api';

export interface GuideInclusion {
  id: number;
  label: string;
  sort_order: number;
}

export interface TourGuideProfile {
  id: number;
  user_id: number;
  bio?: string;
  years_experience?: number;
  rate_per_pax?: number;
  is_verified: boolean;
  additional_services?: string;
  inclusions: GuideInclusion[];
  created_at: string;
  updated_at: string;
}

export interface AvatarUploadInput {
  uri: string;
  name: string;
  type: string;
}

export function useGetGuideProfile() {
  return useQuery({
    queryKey: ['guideProfile'],
    queryFn: async () => {
      return apiFetch<TourGuideProfile>('/guide/profile');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateGuideProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<TourGuideProfile>) => {
      return apiFetch<TourGuideProfile>('/guide/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guideProfile'] });
    },
  });
}

export function useAddGuideInclusion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (label: string) => {
      return apiFetch<TourGuideProfile>('/guide/inclusions', {
        method: 'POST',
        body: JSON.stringify({ label }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guideProfile'] });
    },
  });
}

export function useUpdateGuideInclusion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      inclusionId,
      label,
      sort_order,
    }: {
      inclusionId: number;
      label?: string;
      sort_order?: number;
    }) => {
      return apiFetch<TourGuideProfile>(`/guide/inclusions/${inclusionId}`, {
        method: 'PUT',
        body: JSON.stringify({ label, sort_order }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guideProfile'] });
    },
  });
}

export function useDeleteGuideInclusion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inclusionId: number) => {
      return apiFetch<TourGuideProfile>(`/guide/inclusions/${inclusionId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guideProfile'] });
    },
  });
}

export function useReorderGuideInclusions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      inclusions: Array<{ id: number; sort_order: number }>
    ) => {
      return apiFetch<TourGuideProfile>('/guide/inclusions/reorder', {
        method: 'PUT',
        body: JSON.stringify({ inclusions }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guideProfile'] });
    },
  });
}

export function useUpdateAvatar() {
  return useMutation({
    mutationFn: async (image: AvatarUploadInput) => {
      console.log('[Avatar Upload] Start:', { uri: image.uri.substring(0, 50), name: image.name, type: image.type });

      const formData = new FormData();

      if (Platform.OS === 'web') {
        // On web: fetch URI as blob, append blob to FormData
        console.log('[Avatar Upload] Web platform - URI format:', image.uri.substring(0, 50));

        let blob: Blob;

        if (image.uri.startsWith('data:')) {
          // Handle data URL
          console.log('[Avatar Upload] Detected data URL - converting to blob');
          const [header, data] = image.uri.split(',');
          const mimeMatch = header.match(/data:([^;]+)/);
          const mimeType = mimeMatch?.[1] || 'image/jpeg';

          try {
            const bstr = atob(data);
            const u8arr = new Uint8Array(bstr.length);
            for (let i = 0; i < bstr.length; i++) {
              u8arr[i] = bstr.charCodeAt(i);
            }
            blob = new Blob([u8arr], { type: mimeType });
            console.log('[Avatar Upload] Data URL converted to blob:', { size: blob.size, type: blob.type });
          } catch (err) {
            throw new Error(`Failed to decode data URL: ${err instanceof Error ? err.message : String(err)}`);
          }
        } else {
          // Fetch from URL (blob:, http:, etc.)
          console.log('[Avatar Upload] Fetching from URI');
          let response: Response;
          try {
            response = await fetch(image.uri);
          } catch (err) {
            throw new Error(`Fetch failed: ${err instanceof Error ? err.message : String(err)}`);
          }

          console.log('[Avatar Upload] Fetch response:', { ok: response.ok, status: response.status });

          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
          }

          blob = await response.blob();
          console.log('[Avatar Upload] Blob fetched:', { size: blob.size, type: blob.type });
        }

        if (blob.size === 0) {
          throw new Error('Blob is empty - image data is missing');
        }

        formData.append('avatar', blob, image.name);

        // Log FormData contents (for debugging)
        console.log('[Avatar Upload] FormData ready to send');
        for (const [key, value] of formData.entries()) {
          if (value instanceof Blob) {
            console.log(`  ${key}: Blob { size: ${value.size}, type: "${value.type}" }`);
          } else {
            console.log(`  ${key}: ${value}`);
          }
        }
      } else {
        // On native (iOS/Android): use object form with uri, name, type
        console.log('[Avatar Upload] Native platform - using URI object');
        formData.append('avatar', {
          uri: image.uri,
          name: image.name,
          type: image.type,
        } as any);
      }

      console.log('[Avatar Upload] Sending POST /profile/avatar');
      const result = await apiFetch<User>('/profile/avatar', { method: 'POST', body: formData });
      console.log('[Avatar Upload] ✓ Success');
      return result;
    },
  });
}
