import { apiRequest } from './api.js';

export async function getDesaList() {
  return apiRequest('/desa');
}

export async function createDesa(data) {
  return apiRequest('/desa', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDesa(id, data) {
  return apiRequest(`/desa/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
