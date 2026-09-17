// Centralized API client for Teacher's Day Frontend

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function getAuthToken() {
  return localStorage.getItem('td_admin_token') || '';
}

// Universal fetch wrapper
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { ...options.headers };

  const token = getAuthToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is NOT FormData, set JSON Content-Type
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle unauthorized/expired token
  if (response.status === 401 && endpoint.startsWith('/admin') && endpoint !== '/admin/login') {
    localStorage.removeItem('td_admin_token');
    localStorage.removeItem('td_admin_user');
    window.location.href = '/login?expired=1';
    throw new Error('Session expired. Please log in again.');
  }

  // Check if response is JSON or blob
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    return data;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'API request failed');
  }

  return response;
}

export const api = {
  // Colleges API
  async getColleges() {
    return request('/colleges');
  },

  // Public Teacher APIs
  async getTeachers({ q = '', sort = 'name_asc', page = 1, limit = 12 } = {}) {
    const params = new URLSearchParams({ q, sort, page: String(page), limit: String(limit) });
    return request(`/teachers?${params.toString()}`);
  },

  async getTeacherBySlug(slug) {
    return request(`/teachers/${encodeURIComponent(slug)}`);
  },

  async updateTeacherPhoto(slug, data) {
    const isFormData = data instanceof FormData;
    return request(`/teachers/${encodeURIComponent(slug)}/photo`, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  async resolvePhotoPreview(url) {
    return request('/teachers/resolve-preview', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },

  // Submit message with optional media via XMLHttpRequest to support upload progress
  async submitMessage(slug, formData, onProgress = () => {}) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/teachers/${encodeURIComponent(slug)}/messages`);

      if (xhr.upload) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(res);
          } else {
            reject(new Error(res.error || 'Submission failed'));
          }
        } catch {
          reject(new Error('Invalid response from server'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(formData);
    });
  },

  // Public Wall APIs
  async getWallGreetings({ after_id = null, limit = 50 } = {}) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (after_id) params.append('after_id', String(after_id));
    return request(`/wall?${params.toString()}`);
  },

  async postWallGreeting({ sender_name, message_text, website = '' }) {
    return request('/wall', {
      method: 'POST',
      body: JSON.stringify({ sender_name, message_text, website }),
    });
  },

  // Admin APIs
  async adminLogin(username, password) {
    return request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async getAdminTeachers({ q = '', sort = 'name_asc', page = 1, limit = 12 } = {}) {
    const params = new URLSearchParams({ q, sort, page: String(page), limit: String(limit) });
    return request(`/admin/teachers?${params.toString()}`);
  },

  async addAdminTeacher(teacherData) {
    const isFormData = teacherData instanceof FormData;
    return request('/admin/teachers', {
      method: 'POST',
      body: isFormData ? teacherData : JSON.stringify(teacherData),
    });
  },

  async importAdminTeachers(file) {
    const formData = new FormData();
    formData.append('file', file);
    return request('/admin/teachers/import', {
      method: 'POST',
      body: formData,
    });
  },

  async exportTeachers({ q = '', sort = 'name_asc' } = {}) {
    const params = new URLSearchParams({ q, sort });
    const token = getAuthToken();
    if (token) params.append('token', token);
    const res = await request(`/admin/teachers/export?${params.toString()}`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bisu-teachers-${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  getExportTeachersUrl({ q = '', sort = 'name_asc' } = {}) {
    const params = new URLSearchParams({ q, sort });
    const token = getAuthToken();
    if (token) params.append('token', token);
    return `${API_BASE_URL}/admin/teachers/export?${params.toString()}`;
  },

  async downloadTemplate() {
    const token = getAuthToken();
    const query = token ? `?token=${encodeURIComponent(token)}` : '';
    const res = await request(`/admin/teachers/template${query}`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teacher-import-template.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  getTemplateDownloadUrl() {
    const token = getAuthToken();
    return `${API_BASE_URL}/admin/teachers/template${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  async getAdminTeacherMessages(teacherId) {
    return request(`/admin/teachers/${encodeURIComponent(teacherId)}/messages`);
  },

  async deleteAdminTeacher(teacherId) {
    return request(`/admin/teachers/${encodeURIComponent(teacherId)}`, {
      method: 'DELETE',
    });
  },

  async bulkDeleteAdminTeachers(ids) {
    return request('/admin/teachers/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },

  async deleteAdminMessage(messageId) {
    return request(`/admin/messages/${encodeURIComponent(messageId)}`, {
      method: 'DELETE',
    });
  },

  async deleteAdminMedia(mediaId) {
    return request(`/admin/media/${encodeURIComponent(mediaId)}`, {
      method: 'DELETE',
    });
  },

  async deleteAdminWallGreeting(wallId) {
    return request(`/admin/wall/${encodeURIComponent(wallId)}`, {
      method: 'DELETE',
    });
  },
};

export default api;
