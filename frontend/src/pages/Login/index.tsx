import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  message, 
  Space,
  Row,
  Col 
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  LoginOutlined,
  BookOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface LoginRequest {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: LoginRequest) => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // JWT 토큰을 localStorage에 저장
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);
        
        message.success('로그인에 성공했습니다!');
        
        // 대시보드로 리다이렉트
        navigate('/dashboard');
      } else {
        message.error(data.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Row justify="center" style={{ width: '100%' }}>
        <Col xs={22} sm={16} md={12} lg={8} xl={6}>
          <Card
            style={{
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              borderRadius: '12px',
              border: 'none'
            }}
            bodyStyle={{ padding: '40px' }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
              {/* 로고 및 제목 */}
              <div>
                <BookOutlined style={{ fontSize: '48px', color: '#667eea', marginBottom: '16px' }} />
                <Title level={2} style={{ margin: 0, color: '#2c3e50' }}>
                  도서관리 시스템
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Library Management System
                </Text>
              </div>

              {/* 로그인 폼 */}
              <Form
                name="login"
                onFinish={handleLogin}
                layout="vertical"
                style={{ width: '100%' }}
                size="large"
              >
                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: '사용자명을 입력해주세요!' },
                    { min: 3, message: '사용자명은 최소 3자 이상이어야 합니다.' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="사용자명"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: '비밀번호를 입력해주세요!' },
                    { min: 4, message: '비밀번호는 최소 4자 이상이어야 합니다.' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="비밀번호"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: '8px' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}
                    icon={<LoginOutlined />}
                  >
                    {loading ? '로그인 중...' : '로그인'}
                  </Button>
                </Form.Item>
              </Form>

              {/* 테스트 계정 안내 */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px',
                textAlign: 'left'
              }}>
                <Text strong style={{ color: '#495057' }}>테스트 계정:</Text>
                <br />
                <Text code>사용자명: admin</Text>
                <br />
                <Text code>비밀번호: admin123</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
