import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { Nivel, PlanRequest, Eje } from './types';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

apiClient.interceptors.request.use(async (config) => {
  config.headers['ngrok-skip-browser-warning'] = 'true';
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      signOut({ callbackUrl: '/auth/signin' });
    }
    return Promise.reject(error);
  }
);


export const getNiveles = async (): Promise<Nivel[]> => {
  const response = await apiClient.get('/curriculum/niveles');
  return response.data;
};

export const getOAs = async (curso: string, asignatura: string): Promise<Eje[]> => {
  const response = await apiClient.get('/curriculum/oas', {
    params: { curso, asignatura },
  });
  return response.data;
};

export const generatePlanStream = async (
  data: PlanRequest,
  onThought: (thought: string) => void,
  onAnswer: (answer: string) => void,
  onComplete: () => void
) => {
  try {
    const session = await getSession();
    if (!session?.accessToken) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/planning/generate-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(data),
    });

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        onComplete();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.substring(6);
          try {
            const parsedData = JSON.parse(jsonStr);
            if (parsedData.type === 'thought') {
              onThought(parsedData.content);
            } else if (parsedData.type === 'answer') {
              onAnswer(parsedData.content);
            }
          } catch (error) {
            console.error('Error parsing SSE data:', error);
          }
        }
      }
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // The interceptor will handle the redirect
    } else {
      console.error('Error in generatePlanStream:', error);
    }
    onComplete();
  }
};
export const updateUserStatus = async (username: string, isActive: boolean) => {
  const response = await apiClient.put(`/auth/users/${username}/status`, { is_active: isActive });
  return response.data;
};

export const updateUserRole = async (username: string, role: string) => {
  const response = await apiClient.put(`/auth/users/${username}/role`, { role });
  return response.data;
};