import { apiRequest } from './client';

export async function startSession(topic) {
  const query = new URLSearchParams({
    topic: topic.trim(),
  });
  return apiRequest(`/api/sessions/start?${query.toString()}`, {
    method: 'POST',
  });
}

export async function respondToSession(sessionId, { answer, confidence = 3 }) {
  return apiRequest(`/api/sessions/${sessionId}/respond`, {
    method: 'POST',
    body: JSON.stringify({
      answer: answer.trim(),
      confidence: Number(confidence),
    }),
  });
}

export async function getSession(sessionId) {
  return apiRequest(`/api/sessions/${sessionId}`);
}

export async function getSessionsList() {
  return apiRequest('/api/sessions/');
}
