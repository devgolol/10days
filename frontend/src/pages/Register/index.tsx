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
  Col,
  Progress,
  Divider 
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined,
  BookOutlined,
  UserAddOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  HomeOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  address: string;
}

interface PasswordStrength {
  score: number;
  suggestions: string[];
}

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, suggestions: [] });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // 비밀번호 강도 체크
  const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const suggestions: string[] = [];

    if (password.length >= 8) {
      score += 20;
    } else {
      suggestions.push('최소 8자 이상 입력하세요');
    }

    if (/[A-Z]/.test(password)) {
      score += 20;
    } else {
      suggestions.push('대문자를 포함하세요');
    }

    if (/[a-z]/.test(password)) {
      score += 20;
    } else {
      suggestions.push('소문자를 포함하세요');
    }

    if (/[0-9]/.test(password)) {
      score += 20;
    } else {
      suggestions.push('숫자를 포함하세요');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 20;
    } else {
      suggestions.push('특수문자를 포함하세요');
    }

    return { score, suggestions };
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    const strength = checkPasswordStrength(password);
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = (score: number): string => {
    if (score < 40) return '#ff4d4f';
    if (score < 80) return '#faad14';
    return '#52c41a';
  };

  const getPasswordStrengthText = (score: number): string => {
    if (score < 40) return '약함';
    if (score < 80) return '보통';
    return '강함';
  };

  const handleRegister = async (values: RegisterRequest) => {
    setLoading(true);
    
    try {
      const { confirmPassword, ...registerData } = values;
      
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setRegistrationSuccess(true);
        setUserEmail(values.email);
        message.success('회원가입이 완료되었습니다! 이메일을 확인해주세요.');
      } else {
        message.error(data.error || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('Register error:', error);
      message.error('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 성공 후 화면
  if (registrationSuccess) {
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
          <Col xs={22} sm={18} md={14} lg={10} xl={8}>
            <Card
              style={{
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                borderRadius: '12px',
                border: 'none',
                textAlign: 'center'
              }}
              bodyStyle={{ padding: '40px' }}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <CheckCircleOutlined style={{ fontSize: '72px', color: '#52c41a' }} />
                
                <div>
                  <Title level={2} style={{ margin: 0, color: '#2c3e50' }}>
                    회원가입 완료!
                  </Title>
                  <Text type="secondary" style={{ fontSize: '16px' }}>
                    Registration Successful
                  </Text>
                </div>

                <div style={{ 
                  background: '#f6ffed', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid #b7eb8f'
                }}>
                  <Text strong style={{ color: '#389e0d' }}>
                    이메일 인증이 필요합니다
                  </Text>
                  <br />
                  <Text style={{ color: '#595959' }}>
                    <strong>{userEmail}</strong>로<br />
                    인증 메일을 발송했습니다.<br />
                    메일함을 확인하여 계정을 활성화해주세요.
                  </Text>
                </div>

                <div style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => navigate(`/verify-email?email=${encodeURIComponent(userEmail)}`)}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      fontSize: '16px',
                      fontWeight: '500',
                      marginBottom: '12px'
                    }}
                  >
                    이메일 인증하기
                  </Button>
                  
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    받은 인증코드를 입력해주세요
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

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
        <Col xs={22} sm={18} md={14} lg={10} xl={8}>
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
                  회원가입
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Create Your Account
                </Text>
              </div>

              {/* 회원가입 폼 */}
              <Form
                form={form}
                name="register"
                onFinish={handleRegister}
                layout="vertical"
                style={{ width: '100%' }}
                size="large"
                validateTrigger="onBlur"
              >
                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: '사용자명을 입력해주세요!' },
                    { min: 3, message: '사용자명은 최소 3자 이상이어야 합니다.' },
                    { max: 20, message: '사용자명은 최대 20자까지 가능합니다.' },
                    { pattern: /^[a-zA-Z0-9_]+$/, message: '영문, 숫자, 밑줄(_)만 사용 가능합니다.' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="사용자명 (3-20자, 영문/숫자/밑줄)"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: '이름을 입력해주세요!' },
                    { min: 2, message: '이름은 최소 2자 이상이어야 합니다.' },
                    { max: 50, message: '이름은 최대 50자까지 가능합니다.' }
                  ]}
                >
                  <Input
                    prefix={<IdcardOutlined />}
                    placeholder="실명 (한글/영문)"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: '이메일을 입력해주세요!' },
                    { type: 'email', message: '올바른 이메일 형식이 아닙니다!' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="이메일 주소"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="phone"
                  rules={[
                    { required: true, message: '전화번호를 입력해주세요!' },
                    { pattern: /^[0-9-+\s()]+$/, message: '올바른 전화번호 형식이 아닙니다!' }
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="전화번호 (예: 010-1234-5678)"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="address"
                  rules={[
                    { required: true, message: '주소를 입력해주세요!' },
                    { max: 200, message: '주소는 최대 200자까지 가능합니다.' }
                  ]}
                >
                  <Input
                    prefix={<HomeOutlined />}
                    placeholder="주소"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: '비밀번호를 입력해주세요!' },
                    { min: 8, message: '비밀번호는 최소 8자 이상이어야 합니다.' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="비밀번호 (최소 8자)"
                    style={{ borderRadius: '8px' }}
                    onChange={handlePasswordChange}
                  />
                </Form.Item>

                {/* 비밀번호 강도 표시 */}
                {passwordStrength.score > 0 && (
                  <div style={{ marginTop: '-16px', marginBottom: '24px' }}>
                    <Progress
                      percent={passwordStrength.score}
                      strokeColor={getPasswordStrengthColor(passwordStrength.score)}
                      showInfo={false}
                      size="small"
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <Text style={{ fontSize: '12px', color: getPasswordStrengthColor(passwordStrength.score) }}>
                        보안 강도: {getPasswordStrengthText(passwordStrength.score)}
                      </Text>
                      {passwordStrength.suggestions.length > 0 && (
                        <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                          {passwordStrength.suggestions[0]}
                        </Text>
                      )}
                    </div>
                  </div>
                )}

                <Form.Item
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '비밀번호 확인을 입력해주세요!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('비밀번호가 일치하지 않습니다!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<SafetyOutlined />}
                    placeholder="비밀번호 확인"
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
                    icon={<UserAddOutlined />}
                  >
                    {loading ? '가입 중...' : '회원가입'}
                  </Button>
                </Form.Item>

                {/* 로그인 페이지로 이동 링크 */}
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Text type="secondary">이미 계정이 있으신가요? </Text>
                  <Button 
                    type="link" 
                    onClick={() => navigate('/login')}
                    style={{ padding: '0' }}
                  >
                    로그인하기
                  </Button>
                </div>
              </Form>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Register;