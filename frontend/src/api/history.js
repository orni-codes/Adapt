import { apiRequest } from './client';

export async function getUserHistory(userId) {
  if (userId) {
    return apiRequest(`/api/users/${userId}/history`);
  }
  return apiRequest('/api/users/me/history');
}
