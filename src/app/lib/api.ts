import axios from 'axios';
import { getSession } from 'next-auth/react';
import { Nivel, PlanRequest, Eje } from './types';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});


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
    const response = await apiClient.post('/planning/generate-plan', data, {
      responseType: 'stream',
    });

    const reader = response.data.getReader();
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
      buffer = lines.pop() || ''; // Keep the last partial line in the buffer

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
    console.error('Error in generatePlanStream:', error);
    onComplete(); // Ensure completion is called on error
  }
};