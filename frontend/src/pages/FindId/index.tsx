import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Steps, Result, Space } from 'antd';
import { MailOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const FindId: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [foundUsername, setFoundUsername] = useState('');
  
  // 인증코드 발송
  const handleSendCode = async (values: { email: string }) => {
    setLoading(true);
    try {
      const response = await authService.sendFindIdCode(values.email);
      message.success(response.message);
      setEmail(values.email);
      setCurrentStep(1);
    } catch (error: any) {
      message.error(error.response?.data?.error || '인증코드 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 인증코드 확인
  const handleVerifyCode = async (values: { code: string }) => {
    setLoading(true);
    try {
      const response = await authService.verifyFindIdCode(email, values.code);
      message.success('인증이 완료되었습니다.');
      setFoundUsername(response.username);
      setCurrentStep(2);
    } catch (error: any) {
      message.error(error.response?.data?.error || '인증에 실패했습니다.');
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
              <p>인증코드가 <strong>{email}</strong>로 발송되었습니다.</p>
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
                이메일 다시 입력하기
              </Button>
            </Form.Item>
          </Form>
        );
        
      case 2:
        return (
          <Result
            status="success"
            title="아이디를 찾았습니다!"
            subTitle={
              <div>
                <p>회원님의 아이디는</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {foundUsername}
                </p>
                <p>입니다.</p>
              </div>
            }
            extra={[
              <Button 
                type="primary" 
                key="login"
                size="large"
                onClick={() => navigate('/login')}
              >
                로그인하기
              </Button>,
              <Button 
                key="reset"
                size="large"
                onClick={() => navigate('/find-password')}
              >
                비밀번호 찾기
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
          <UserOutlined style={{ marginRight: 8 }} />
          아이디 찾기
        </h2>
        
        <Steps 
          current={currentStep} 
          style={{ marginBottom: 24 }}
          items={[
            { title: '이메일 입력' },
            { title: '인증코드 확인' },
            { title: '아이디 확인' }
          ]}
        />
        
        {renderStepContent()}
      </Card>
    </div>
  );
};

export default FindId;
