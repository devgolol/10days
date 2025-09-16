import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';

// 페이지 컴포넌트들
import Login from './pages/Login';
import Register from './pages/Register';
import FindId from './pages/FindId';
import FindPassword from './pages/FindPassword';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Members from './pages/Members';
import Loans from './pages/Loans';

// 인증 컨텍스트
interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  role: string | null;
  login: (token: string, username: string, role: string) => void;
  logout: () => void;
}

export const AuthContext = React.createContext<AuthContextType | null>(null);

// 보호된 라우트 컴포넌트
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// 로그인 리다이렉트 컴포넌트  
const LoginRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// 메인 앱 컴포넌트
const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // 앱 시작 시 토큰 확인
    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    const savedRole = localStorage.getItem('role');
    
    if (token && savedUsername && savedRole) {
      setIsAuthenticated(true);
      setUsername(savedUsername);
      setRole(savedRole);
    }
  }, []);

  const login = (token: string, username: string, role: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
    setIsAuthenticated(true);
    setUsername(username);
    setRole(role);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUsername(null);
    setRole(null);
  };

  const authValue: AuthContextType = {
    isAuthenticated,
    username,
    role,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={authValue}>
      <Routes>
        {/* 로그인 페이지 */}
        <Route 
          path="/login" 
          element={
            <LoginRedirect>
              <Login />
            </LoginRedirect>
          } 
        />
        
        {/* 회원가입 페이지 */}
        <Route 
          path="/register" 
          element={
            <LoginRedirect>
              <Register />
            </LoginRedirect>
          } 
        />
        
        {/* 아이디 찾기 페이지 */}
        <Route 
          path="/find-id" 
          element={
            <LoginRedirect>
              <FindId />
            </LoginRedirect>
          } 
        />
        
        {/* 비밀번호 찾기 페이지 */}
        <Route 
          path="/find-password" 
          element={
            <LoginRedirect>
              <FindPassword />
            </LoginRedirect>
          } 
        />
        
        {/* 보호된 페이지들 */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/books" element={<Books />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/loans" element={<Loans />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AuthContext.Provider>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider locale={koKR}>
      <Router>
        <AppContent />
      </Router>
    </ConfigProvider>
  );
};

export default App;
