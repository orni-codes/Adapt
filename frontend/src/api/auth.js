import { apiRequest } from './client';

export async function signupApi({ name, email, password }) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginApi({ email, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getMeApi() {
  return apiRequest('/auth/me');
}

export function getStoredToken() {
  return localStorage.getItem('adapt_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('adapt_token', token);
  } else {
    localStorage.removeItem('adapt_token');
  }
}

export function removeStoredToken() {
  localStorage.removeItem('adapt_token');
}
