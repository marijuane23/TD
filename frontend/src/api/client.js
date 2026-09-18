// Centralized API client for Teacher's Day Frontend with In-Memory Caching & Media URL Normalization

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function getAuthToken() {
  return localStorage.getItem('td_admin_token') || '';
}

// ============================================================================
// Media URL Resolver: Rewrites localhost:5000 or relative paths to active API_BASE_URL
// ============================================================================
export function resolveMediaUrl(url) {
  if (!url) return null;
  if (typeof url !== 'string') return url;

  // Preserve base64 data URLs, blobs, or external links
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  // If URL points to localhost:5000 or 127.0.0.1:5000, rewrite to active API_BASE_URL
  if (url.includes('localhost:5000') || url.includes('127.0.0.1:5000')) {
    const path = url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):5000/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
  }

  // If URL is relative (e.g. "/wall/28/image" or "/media/15")
  if (url.startsWith('/')) {
    return `${API_BASE_URL}${url}`;
  }

  return url;
}

// ============================================================================
// Client-Side In-Memory Cache (Preserves state across route transitions)
// ============================================================================
const clientMemoryCache = new Map();

function getCached(key) {
  const item = clientMemoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    clientMemoryCache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data, ttlSeconds = 60) {
  clientMemoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export function clearClientCache(prefix = '') {
  if (!prefix) {
    clientMemoryCache.clear();
    return;
  }
  for (const key of clientMemoryCache.keys()) {
    if (key.startsWith(prefix)) {
      clientMemoryCache.delete(key);
    }
  }
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
  // Clear cache manually or by prefix
  clearCache: clearClientCache,
  resolveMediaUrl,

  // Colleges API (Cached in frontend for 10 minutes)
  async getColleges() {
    const cacheKey = 'colleges:all';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const res = await request('/colleges');
    setCached(cacheKey, res, 600); // 10 minutes
    return res;
  },

  // Public Teacher APIs (Cached for 2 minutes per filter set)
  async getTeachers({ q = '', college = '', sort = 'name_asc', page = 1, limit = 12 } = {}) {
    const query = { q, sort, page: String(page), limit: String(limit) };
    if (college && college !== 'all') query.college = college;
    const params = new URLSearchParams(query);
    const cacheKey = `teachers:list:${params.toString()}`;

    const cached = getCached(cacheKey);
    if (cached) return cached;

    const res = await request(`/teachers?${params.toString()}`);
    const normalized = {
      ...res,
      teachers: (res.teachers || []).map(t => ({
        ...t,
        photo_url: resolveMediaUrl(t.photo_url),
      })),
    };
    setCached(cacheKey, normalized, 120); // 2 minutes
    return normalized;
  },

  // Teacher Profile (Cached for 1 minute)
  async getTeacherBySlug(slug) {
    const cacheKey = `teachers:slug:${slug}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const res = await request(`/teachers/${encodeURIComponent(slug)}`);
    const normalized = {
      ...res,
      teacher: res.teacher
        ? { ...res.teacher, photo_url: resolveMediaUrl(res.teacher.photo_url) }
        : null,
      messages: (res.messages || []).map(m => ({
        ...m,
        media_url: resolveMediaUrl(m.media_url),
      })),
    };
    setCached(cacheKey, normalized, 60); // 1 minute
    return normalized;
  },

  async updateTeacherPhoto(slug, data) {
    const isFormData = data instanceof FormData;
    const res = await request(`/teachers/${encodeURIComponent(slug)}/photo`, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
    // Invalidate teacher caches
    clearClientCache('teachers:');
    return res;
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
            // Invalidate caches on submission
            clearClientCache('teachers:');
            clearClientCache('wall:');
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

  // Public Wall APIs (Cached for 30 seconds to allow seamless back-and-forth navigation)
  async getWallGreetings({ after_id = null, limit = 50 } = {}) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (after_id) params.append('after_id', String(after_id));
    const cacheKey = `wall:list:${params.toString()}`;

    const cached = getCached(cacheKey);
    if (cached) return cached;

    const res = await request(`/wall?${params.toString()}`);
    const normalized = {
      ...res,
      items: (res.items || []).map(item => ({
        ...item,
        image_url: resolveMediaUrl(item.image_url),
      })),
    };
    setCached(cacheKey, normalized, 30); // 30 seconds
    return normalized;
  },

  // Dropdown list for WallSubmissionPanel (Cached in frontend for 5 minutes)
  async getTeachersDropdown() {
    const cacheKey = 'teachers:dropdown';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const res = await request('/teachers/dropdown');
    const normalized = (res || []).map(t => ({
      ...t,
      photo_url: resolveMediaUrl(t.photo_url),
    }));
    setCached(cacheKey, normalized, 300); // 5 minutes
    return normalized;
  },

  async postWallGreeting(payload) {
    const isFormData = payload instanceof FormData;
    const res = await request('/wall', {
      method: 'POST',
      body: isFormData ? payload : JSON.stringify(payload),
    });
    // Invalidate caches so the new tribute appears
    clearClientCache('wall:');
    clearClientCache('teachers:');

    if (res && res.data && res.data.image_url) {
      res.data.image_url = resolveMediaUrl(res.data.image_url);
    }
    return res;
  },

  // Admin APIs
  async adminLogin(username, password) {
    return request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async getAdminTeachers({ q = '', college = '', sort = 'name_asc', page = 1, limit = 12 } = {}) {
    const query = { q, sort, page: String(page), limit: String(limit) };
    if (college && college !== 'all') query.college = college;
    const params = new URLSearchParams(query);
    const res = await request(`/admin/teachers?${params.toString()}`);
    if (res && res.teachers) {
      res.teachers = res.teachers.map(t => ({
        ...t,
        photo_url: resolveMediaUrl(t.photo_url),
      }));
    }
    return res;
  },

  async addAdminTeacher(teacherData) {
    const isFormData = teacherData instanceof FormData;
    const res = await request('/admin/teachers', {
      method: 'POST',
      body: isFormData ? teacherData : JSON.stringify(teacherData),
    });
    clearClientCache('teachers:');
    return res;
  },

  async importAdminTeachers(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await request('/admin/teachers/import', {
      method: 'POST',
      body: formData,
    });
    clearClientCache('teachers:');
    return res;
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
    const res = await request(`/admin/teachers/${encodeURIComponent(teacherId)}/messages`);
    if (res && res.messages) {
      res.messages = res.messages.map(m => ({
        ...m,
        media_url: resolveMediaUrl(m.media_url),
      }));
    }
    return res;
  },

  async deleteAdminTeacher(teacherId) {
    const res = await request(`/admin/teachers/${encodeURIComponent(teacherId)}`, {
      method: 'DELETE',
    });
    clearClientCache('teachers:');
    return res;
  },

  async bulkDeleteAdminTeachers(ids) {
    const res = await request('/admin/teachers/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
    clearClientCache('teachers:');
    return res;
  },

  async deleteAdminMessage(messageId) {
    const res = await request(`/admin/messages/${encodeURIComponent(messageId)}`, {
      method: 'DELETE',
    });
    clearClientCache('teachers:');
    clearClientCache('wall:');
    return res;
  },

  async deleteAdminMedia(mediaId) {
    const res = await request(`/admin/media/${encodeURIComponent(mediaId)}`, {
      method: 'DELETE',
    });
    clearClientCache('teachers:');
    return res;
  },

  async deleteAdminWallGreeting(wallId) {
    const res = await request(`/admin/wall/${encodeURIComponent(wallId)}`, {
      method: 'DELETE',
    });
    clearClientCache('wall:');
    return res;
  },
};

export default api;
