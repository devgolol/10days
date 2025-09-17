import React, { useState, useContext } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  message, 
  Space,
  Row,
  Col,
  Modal,
  Divider,
  Alert 
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  LoginOutlined,
  BookOutlined,
  MailOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';

const { Title, Text } = Typography;

interface LoginRequest {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [findEmailModal, setFindEmailModal] = useState(false);
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [findEmailLoading, setFindEmailLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  
  const [findEmailForm] = Form.useForm();
  const [resetPasswordForm] = Form.useForm();

  if (!authContext) {
    return null; // AuthContext가 없으면 렌더링하지 않음
  }

  const { login } = authContext;

  const handleLogin = async (values: LoginRequest) => {
    setLoading(true);
    setErrorMessage(''); // 이전 오류 메시지 초기화
    
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
        // AuthContext의 login 함수를 사용하여 상태 업데이트
        login(data.token, data.username, data.role, data.name || data.username);
        
        // 대시보드로 리다이렉트
        navigate('/dashboard');
      } else {
        setErrorMessage(data.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 아이디 찾기
  const handleFindEmail = async (values: { username: string }) => {
    setFindEmailLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/find-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        message.success(data.message);
        setFindEmailModal(false);
        findEmailForm.resetFields();
      } else {
        message.error(data.error || '아이디 찾기에 실패했습니다.');
      }
    } catch (error) {
      console.error('Find email error:', error);
      message.error('네트워크 오류가 발생했습니다.');
    } finally {
      setFindEmailLoading(false);
    }
  };

  // 비밀번호 찾기
  const handleResetPassword = async (values: { email: string }) => {
    setResetPasswordLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        message.success(data.message);
        setResetPasswordModal(false);
        resetPasswordForm.resetFields();
      } else {
        message.error(data.error || '비밀번호 초기화에 실패했습니다.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      message.error('네트워크 오류가 발생했습니다.');
    } finally {
      setResetPasswordLoading(false);
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
            styles={{ body: { padding: '40px' } }}
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

                {/* 오류 메시지 표시 */}
                {errorMessage && (
                  <Form.Item style={{ marginBottom: '16px' }}>
                    <Alert
                      message={errorMessage}
                      type="error"
                      showIcon
                      style={{ borderRadius: '8px' }}
                      closable
                      onClose={() => setErrorMessage('')}
                    />
                  </Form.Item>
                )}

                {/* 아이디/비밀번호 찾기 및 회원가입 링크 */}
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Button 
                    type="link" 
                    size="small"
                    onClick={() => navigate('/find-id')}
                    style={{ padding: '0 8px' }}
                  >
                    아이디 찾기
                  </Button>
                  <Divider type="vertical" />
                  <Button 
                    type="link" 
                    size="small"
                    onClick={() => navigate('/find-password')}
                    style={{ padding: '0 8px' }}
                  >
                    비밀번호 찾기
                  </Button>
                  <Divider type="vertical" />
                  <Button 
                    type="link" 
                    size="small"
                    onClick={() => navigate('/register')}
                    style={{ padding: '0 8px' }}
                  >
                    회원가입
                  </Button>
                </div>
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

      {/* 아이디 찾기 모달 */}
      <Modal
        title="아이디 찾기"
        open={findEmailModal}
        onCancel={() => {
          setFindEmailModal(false);
          findEmailForm.resetFields();
        }}
        footer={null}
        centered
      >
        <Form
          form={findEmailForm}
          onFinish={handleFindEmail}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="사용자명"
            rules={[
              { required: true, message: '사용자명을 입력해주세요!' },
              { min: 3, message: '사용자명은 최소 3자 이상이어야 합니다.' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="등록한 사용자명을 입력하세요"
            />
          </Form.Item>
          
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={findEmailLoading}
              style={{ width: '100%' }}
              icon={<MailOutlined />}
            >
              {findEmailLoading ? '찾는 중...' : '아이디 찾기'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 비밀번호 찾기 모달 */}
      <Modal
        title="비밀번호 찾기"
        open={resetPasswordModal}
        onCancel={() => {
          setResetPasswordModal(false);
          resetPasswordForm.resetFields();
        }}
        footer={null}
        centered
      >
        <Form
          form={resetPasswordForm}
          onFinish={handleResetPassword}
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="이메일"
            rules={[
              { required: true, message: '이메일을 입력해주세요!' },
              { type: 'email', message: '올바른 이메일 형식이 아닙니다!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="등록한 이메일을 입력하세요"
            />
          </Form.Item>
          
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={resetPasswordLoading}
              style={{ width: '100%' }}
              icon={<QuestionCircleOutlined />}
            >
              {resetPasswordLoading ? '발송 중...' : '임시 비밀번호 발송'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Login;
