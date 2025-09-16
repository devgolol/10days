import axios from 'axios';

// API 기본 설정
const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (추후 인증 토큰 추가용)
apiClient.interceptors.request.use(
  (config) => {
    // 추후 JWT 토큰 추가
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 인증 실패시 로그인 페이지로 리다이렉트
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
