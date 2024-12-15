import axios from 'axios';

export let API_URL: string;

if (window.location.hostname === 'localhost') {
  // API_URL = "http://127.0.0.1:8000/api";
  API_URL = 'http://localhost:8080/api';
} else {
  API_URL = window.location.protocol + '//' + window.location.host + '/api';
}
console.log('API_URL', API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
