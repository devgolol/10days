import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Steps, Result } from 'antd';
import { UserOutlined, MailOutlined, SafetyOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const FindPassword: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({ username: '', email: '' });
  const [verificationCode, setVerificationCode] = useState('');
  
  // 1단계: 인증코드 발송
  const handleSendCode = async (values: { username: string; email: string }) => {
    setLoading(true);
    try {
      const response = await authService.sendResetPasswordCode(values.username, values.email);
      message.success(response.message);
      setUserInfo(values);
      setCurrentStep(1);
    } catch (error: any) {
      message.error(error.response?.data?.error || '인증코드 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 2단계: 인증코드 확인
  const handleVerifyCode = async (values: { code: string }) => {
    setLoading(true);
    try {
      const response = await authService.verifyResetPasswordCode(
        userInfo.username, 
        userInfo.email, 
        values.code
      );
      message.success(response.message);
      setVerificationCode(values.code);
      setCurrentStep(2);
    } catch (error: any) {
      message.error(error.response?.data?.error || '인증에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 3단계: 새 비밀번호 설정
  const handleSetNewPassword = async (values: { newPassword: string }) => {
    setLoading(true);
    try {
      const response = await authService.setNewPassword(
        userInfo.username,
        userInfo.email,
        verificationCode,
        values.newPassword
      );
      message.success(response.message);
      setCurrentStep(3);
    } catch (error: any) {
      message.error(error.response?.data?.error || '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 단계별 컨텐츠
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSendCode}
          >
            <Form.Item
              name="username"
              label="아이디"
              rules={[{ required: true, message: '아이디를 입력해주세요.' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="아이디를 입력하세요"
                size="large"
              />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="이메일"
              rules={[
                { required: true, message: '이메일을 입력해주세요.' },
                { type: 'email', message: '올바른 이메일 형식이 아닙니다.' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="가입 시 사용한 이메일을 입력하세요"
                size="large"
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                size="large"
                loading={loading}
              >
                인증코드 발송
              </Button>
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="link" 
                onClick={() => navigate('/login')}
                block
              >
                로그인으로 돌아가기
              </Button>
            </Form.Item>
          </Form>
        );
        
      case 1:
        return (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleVerifyCode}
          >
            <div style={{ marginBottom: 16 }}>
              <p>인증코드가 <strong>{userInfo.email}</strong>로 발송되었습니다.</p>
              <p style={{ color: '#666', fontSize: '12px' }}>
                인증코드는 5분간 유효합니다.
              </p>
            </div>
            
            <Form.Item
              name="code"
              label="인증코드"
              rules={[
                { required: true, message: '인증코드를 입력해주세요.' },
                { len: 6, message: '6자리 인증코드를 입력해주세요.' }
              ]}
            >
              <Input 
                prefix={<SafetyOutlined />} 
                placeholder="6자리 인증코드"
                size="large"
                maxLength={6}
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                size="large"
                loading={loading}
              >
                인증코드 확인
              </Button>
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="link" 
                onClick={() => {
                  setCurrentStep(0);
                  form.resetFields();
                }}
                block
              >
                처음부터 다시 시작하기
              </Button>
            </Form.Item>
          </Form>
        );
        
      case 2:
        return (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSetNewPassword}
          >
            <div style={{ marginBottom: 16 }}>
              <p>인증이 완료되었습니다.</p>
              <p>새로운 비밀번호를 입력해주세요.</p>
            </div>
            
            <Form.Item
              name="newPassword"
              label="새 비밀번호"
              rules={[
                { required: true, message: '새 비밀번호를 입력해주세요.' },
                { min: 6, message: '비밀번호는 최소 6자 이상이어야 합니다.' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="새 비밀번호"
                size="large"
              />
            </Form.Item>
            
            <Form.Item
              name="confirmPassword"
              label="새 비밀번호 확인"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '비밀번호를 다시 입력해주세요.' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="새 비밀번호 확인"
                size="large"
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                size="large"
                loading={loading}
              >
                비밀번호 변경
              </Button>
            </Form.Item>
          </Form>
        );
        
      case 3:
        return (
          <Result
            status="success"
            title="비밀번호가 변경되었습니다!"
            subTitle="새로운 비밀번호로 로그인해주세요."
            extra={[
              <Button 
                type="primary" 
                key="login"
                size="large"
                onClick={() => navigate('/login')}
              >
                로그인하기
              </Button>
            ]}
          />
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 480, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>
          <LockOutlined style={{ marginRight: 8 }} />
          비밀번호 찾기
        </h2>
        
        <Steps 
          current={currentStep} 
          style={{ marginBottom: 24 }}
          items={[
            { title: '정보 입력' },
            { title: '인증코드 확인' },
            { title: '새 비밀번호' },
            { title: '완료' }
          ]}
        />
        
        {renderStepContent()}
      </Card>
    </div>
  );
};

export default FindPassword;
