import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  withCredentials: true,
});

// Interceptor to manually attach CSRF token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = decodeURIComponent(
    document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
      ?.split('=')[1] || ''
  );

  if (token) {
    config.headers['X-XSRF-TOKEN'] = token;
  }

  return config;
});

export default axiosInstance;
