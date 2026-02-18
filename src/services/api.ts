// Use relative URL for Vercel deployment
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper untuk generate device fingerprint sederhana
const generateDeviceFingerprint = async (): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    const canvasData = canvas.toDataURL();
    const canvasHash = await hashString(canvasData);
    return canvasHash;
  }
  
  // Fallback fingerprint
  const fingerprint = `${navigator.userAgent}${navigator.language}${screen.colorDepth}${screen.width}x${screen.height}${new Date().getTimezoneOffset()}`;
  return await hashString(fingerprint);
};

// Simple hash function
const hashString = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Get device info
const getDeviceInfo = () => ({
  browser: navigator.userAgent,
  os: navigator.platform,
  platform: navigator.platform,
  screenResolution: `${screen.width}x${screen.height}`,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: navigator.language
});

// API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// User API
export const userAPI = {
  registerOrLogin: async (whatsapp: string, name: string) => {
    const deviceFingerprint = await generateDeviceFingerprint();
    const deviceInfo = getDeviceInfo();
    
    return apiCall('/users/register-or-login', {
      method: 'POST',
      body: JSON.stringify({ deviceFingerprint, whatsapp, name, deviceInfo }),
    });
  },
  
  getByDevice: async (deviceFingerprint: string) => {
    return apiCall(`/users/device/${deviceFingerprint}`);
  },
  
  getById: async (userId: string) => {
    return apiCall(`/users/${userId}`);
  },
  
  update: async (userId: string, data: { whatsapp?: string; name?: string; deviceInfo?: object }) => {
    return apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  generateFingerprint: generateDeviceFingerprint,
  getDeviceInfo,
};

// Product API
export const productAPI = {
  getAll: async (params?: { search?: string; category?: string; minRating?: string; sort?: string; limit?: number }) => {
    const queryString = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
    return apiCall(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (productId: string) => {
    return apiCall(`/products/${productId}`);
  },

  create: async (data: { name: string; description?: string; category?: string; price?: number; image?: string; whatsapp?: string }) => {
    console.log("productAPI.create called with:", data);
    return apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  update: async (productId: string, data: object) => {
    return apiCall(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (productId: string) => {
    return apiCall(`/products/${productId}`, {
      method: 'DELETE',
    });
  },
  
  getStats: async () => {
    return apiCall('/products/stats/general');
  },
};

// Rating API
export const ratingAPI = {
  getAll: async (params?: { product?: string; user?: string; minRating?: string; maxRating?: string; limit?: number }) => {
    const queryString = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
    return apiCall(`/ratings${queryString ? `?${queryString}` : ''}`);
  },
  
  getByProduct: async (productId: string, params?: { limit?: number; sort?: string }) => {
    const queryString = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
    return apiCall(`/ratings/product/${productId}${queryString ? `?${queryString}` : ''}`);
  },
  
  create: async (data: { userId: string; productId: string; deviceFingerprint: string; rating: number; comment?: string }) => {
    return apiCall('/ratings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  update: async (ratingId: string, data: { rating: number; comment?: string }) => {
    return apiCall(`/ratings/${ratingId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (ratingId: string) => {
    return apiCall(`/ratings/${ratingId}`, {
      method: 'DELETE',
    });
  },
  
  markHelpful: async (ratingId: string) => {
    return apiCall(`/ratings/${ratingId}/helpful`, {
      method: 'PUT',
    });
  },
  
  getStats: async (productId: string) => {
    return apiCall(`/ratings/stats/${productId}`);
  },
};

export { generateDeviceFingerprint, getDeviceInfo };
