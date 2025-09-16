import apiClient from './api';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

interface FindIdSendCodeRequest {
  email: string;
}

interface FindIdVerifyCodeRequest {
  email: string;
  code: string;
}

interface FindIdResponse {
  username: string;
  message: string;
}

interface ResetPasswordSendCodeRequest {
  username: string;
  email: string;
}

interface ResetPasswordVerifyCodeRequest {
  username: string;
  email: string;
  code: string;
}

interface SetNewPasswordRequest {
  username: string;
  email: string;
  code: string;
  newPassword: string;
}

class AuthService {
  // 로그인
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    const { token, username, role } = response.data;
    
    // 로컬 스토리지에 저장
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
    
    return response.data;
  }
  
  // 로그아웃
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  }
  
  // 회원가입
  async register(data: RegisterRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/register', data);
    return response.data;
  }
  
  // 아이디 찾기 - 인증코드 발송
  async sendFindIdCode(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      '/auth/find-id/send-code', 
      { email }
    );
    return response.data;
  }
  
  // 아이디 찾기 - 인증코드 확인
  async verifyFindIdCode(email: string, code: string): Promise<FindIdResponse> {
    const response = await apiClient.post<FindIdResponse>(
      '/auth/find-id/verify-code',
      { email, code }
    );
    return response.data;
  }
  
  // 비밀번호 찾기 - 인증코드 발송
  async sendResetPasswordCode(username: string, email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      '/auth/reset-password/send-code',
      { username, email }
    );
    return response.data;
  }
  
  // 비밀번호 찾기 - 인증코드 확인
  async verifyResetPasswordCode(username: string, email: string, code: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      '/auth/reset-password/verify-code',
      { username, email, code }
    );
    return response.data;
  }
  
  // 비밀번호 찾기 - 새 비밀번호 설정
  async setNewPassword(username: string, email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      '/auth/reset-password/set-new',
      { username, email, code, newPassword }
    );
    return response.data;
  }
  
  // 현재 사용자 정보
  getCurrentUser(): { username: string | null; role: string | null; isAuthenticated: boolean } {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    
    return {
      username,
      role,
      isAuthenticated: !!token
    };
  }
}

export default new AuthService();
