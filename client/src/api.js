import axios from 'axios';

// Create an instance of axios with a base URL for our backend
const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Your backend's base URL
});

/**
 * This is the magic part. An "interceptor" that runs before every single request.
 * It automatically gets the token from localStorage and adds it to the headers.
 * Now, you never have to manually add the token to your API calls again.
 */
api.interceptors.request.use(
  (config) => {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      const { token } = JSON.parse(storedData);
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;