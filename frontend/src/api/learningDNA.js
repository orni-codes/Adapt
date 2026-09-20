import { apiRequest } from './client';

export async function getLearningProfile(userId) {
  if (userId) {
    return apiRequest(`/api/learning/profile/${userId}`);
  }
  return apiRequest('/api/learning/profile/me');
}

export async function getDiagnosticQuestions(topic = '') {
  const params = topic.trim()
    ? `?topic=${encodeURIComponent(topic.trim())}`
    : '';
  return apiRequest(`/api/diagnostic/questions${params}`);
}

export async function submitDiagnosticAnswer({
  userId,
  questionId,
  answer,
  responseTime = 5.0,
  confidence = 3,
  hintUsed = false,
}) {
  return apiRequest('/api/diagnostic/answer', {
    method: 'POST',
    body: JSON.stringify({
      user_id: Number(userId || 0),
      question_id: questionId,
      answer,
      response_time: responseTime,
      confidence: Number(confidence),
      hint_used: hintUsed,
    }),
  });
}

export async function completeDiagnostic(userId = 0, topic = '') {
  const params = topic.trim()
    ? `?topic=${encodeURIComponent(topic.trim())}`
    : '';
  return apiRequest(`/api/diagnostic/complete/${userId}${params}`, {
    method: 'POST',
  });
}
