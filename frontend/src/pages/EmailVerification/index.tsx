import React, { useState, useEffect } from 'react';
import { Card, Input, Button, message, Typography, Space } from 'antd';
import { MailOutlined, SafetyCertificateOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './style.css';

const { Title, Text } = Typography;

interface VerificationResponse {
  success: boolean;
  message: string;
}

const EmailVerification: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  // 카운트다운 타이머
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 인증코드 입력 핸들러
  const handleCodeChange = (value: string) => {
    // 숫자만 허용하고 6자리로 제한
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    setVerificationCode(numericValue);
  };

  // 이메일 인증 처리
  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      message.error('6자리 인증코드를 입력해주세요.');
      return;
    }

    if (!email) {
      message.error('이메일 정보가 없습니다. 다시 회원가입을 진행해주세요.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          token: verificationCode
        }),
      });

      if (response.ok) {
        const data: VerificationResponse = await response.json();
        setIsVerified(true);
        message.success('이메일 인증이 완료되었습니다!');
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        const errorData = await response.json();
        message.error(errorData.message || '인증코드가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      message.error('인증 처리 중 오류가 발생했습니다.');
    }

    setLoading(false);
  };

  // 인증코드 재전송
  const handleResend = async () => {
    if (!email) {
      message.error('이메일 정보가 없습니다.');
      return;
    }

    if (countdown > 0) {
      message.warning(`${countdown}초 후에 재전송 가능합니다.`);
      return;
    }

    setResendLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        message.success('인증코드가 재전송되었습니다.');
        setCountdown(60); // 60초 카운트다운
      } else {
        message.error('인증코드 재전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      message.error('재전송 중 오류가 발생했습니다.');
    }

    setResendLoading(false);
  };

  // 인증 완료 화면
  if (isVerified) {
    return (
      <div className="email-verification-container">
        <Card className="email-verification-card success-card">
          <div className="verification-header">
            <CheckCircleOutlined className="success-icon" />
            <Title level={2}>이메일 인증 완료!</Title>
            <Text type="secondary">Email Verification Successful</Text>
          </div>
          
          <div className="verification-content">
            <Text strong>계정이 성공적으로 활성화되었습니다.</Text>
            <br />
            <Text type="secondary">잠시 후 로그인 페이지로 이동합니다...</Text>
          </div>

          <div className="verification-actions">
            <Button type="primary" onClick={() => navigate('/login')}>
              지금 로그인하기
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="email-verification-container">
      <Card className="email-verification-card">
        <div className="verification-header">
          <MailOutlined className="verification-icon" />
          <Title level={2}>이메일 인증</Title>
          <Text type="secondary">Email Verification</Text>
        </div>
        
        <div className="verification-content">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text strong>인증코드를 입력해주세요</Text>
              <br />
              <Text type="secondary">
                <strong>{email}</strong>로 발송된 6자리 인증코드를 입력하세요.
              </Text>
            </div>

            <div className="code-input-section">
              <div className="input-group">
                <SafetyCertificateOutlined className="input-icon" />
                <Input
                  size="large"
                  placeholder="6자리 인증코드"
                  value={verificationCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  maxLength={6}
                  style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }}
                  onPressEnter={handleVerify}
                />
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              onClick={handleVerify}
              disabled={verificationCode.length !== 6}
            >
              <SafetyCertificateOutlined />
              인증 완료
            </Button>

            <div className="resend-section">
              <Text type="secondary">인증코드를 받지 못하셨나요?</Text>
              <br />
              <Button 
                type="link" 
                onClick={handleResend}
                loading={resendLoading}
                disabled={countdown > 0}
              >
                {countdown > 0 ? `재전송 (${countdown}초 후)` : '인증코드 재전송'}
              </Button>
            </div>

            <div className="back-section">
              <Button type="text" onClick={() => navigate('/register')}>
                ← 회원가입으로 돌아가기
              </Button>
            </div>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default EmailVerification;