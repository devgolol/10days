import React, { useState, useContext } from 'react';
import { 
  Card, 
  Typography, 
  Switch, 
  Button, 
  Modal, 
  Form, 
  Input, 
  message, 
  Space, 
  Divider,
  Alert,
  Popconfirm
} from 'antd';
import { 
  MoonOutlined, 
  SunOutlined, 
  UserDeleteOutlined, 
  SettingOutlined,
  ExclamationCircleOutlined,
  LockOutlined
} from '@ant-design/icons';
import { AuthContext } from '../../App';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface WithdrawForm {
  password: string;
}

interface SettingsProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isDarkMode, toggleDarkMode }) => {
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return null;
  }

  const { username, logout } = authContext;

  const handleWithdraw = async (values: WithdrawForm) => {
    setWithdrawLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/auth/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: values.password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        message.success(data.message);
        logout();
        navigate('/login');
      } else {
        message.error(data.error || '회원탈퇴에 실패했습니다.');
      }
    } catch (error) {
      console.error('Withdraw error:', error);
      message.error('네트워크 오류가 발생했습니다.');
    } finally {
      setWithdrawLoading(false);
      setWithdrawModalVisible(false);
      form.resetFields();
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 페이지 헤더 */}
        <div>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SettingOutlined />
            설정
          </Title>
          <Text type="secondary">시스템 설정을 관리합니다</Text>
        </div>

        {/* 테마 설정 */}
        <Card title="테마 설정" size="default">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isDarkMode ? <MoonOutlined /> : <SunOutlined />}
                <span>다크 모드</span>
              </div>
              <Switch 
                checked={isDarkMode} 
                onChange={toggleDarkMode}
                checkedChildren="Dark"
                unCheckedChildren="Light"
              />
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              다크 모드를 활성화하면 어두운 테마로 변경됩니다.
            </Text>
          </Space>
        </Card>

        {/* 계정 관리 */}
        <Card title="계정 관리" size="default">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* 현재 로그인 정보 */}
            <div>
              <Text strong>현재 로그인:</Text>
              <br />
              <Text code style={{ fontSize: '16px' }}>{username}</Text>
            </div>

            <Divider />

            {/* 회원탈퇴 섹션 */}
            <div>
              <Alert
                message="주의사항"
                description="회원탈퇴 시 모든 데이터가 영구적으로 삭제되며, 복구할 수 없습니다."
                type="warning"
                showIcon
                style={{ marginBottom: '16px' }}
              />
              
              <Popconfirm
                title="회원탈퇴"
                description="정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다."
                onConfirm={() => setWithdrawModalVisible(true)}
                okText="탈퇴하기"
                cancelText="취소"
                okType="danger"
                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
              >
                <Button 
                  type="primary" 
                  danger 
                  icon={<UserDeleteOutlined />}
                  disabled={username === 'admin'}
                >
                  회원탈퇴
                </Button>
              </Popconfirm>
              
              {username === 'admin' && (
                <Text type="secondary" style={{ marginLeft: '12px', fontSize: '12px' }}>
                  관리자 계정은 탈퇴할 수 없습니다.
                </Text>
              )}
            </div>
          </Space>
        </Card>

        {/* 시스템 정보 */}
        <Card title="시스템 정보" size="default">
          <Space direction="vertical" size="small">
            <div>
              <Text strong>버전:</Text> <Text code>v1.0.0</Text>
            </div>
            <div>
              <Text strong>빌드 날짜:</Text> <Text code>2025-09-16</Text>
            </div>
            <div>
              <Text strong>환경:</Text> <Text code>Development</Text>
            </div>
          </Space>
        </Card>
      </Space>

      {/* 회원탈퇴 모달 */}
      <Modal
        title={
          <Space>
            <UserDeleteOutlined style={{ color: '#ff4d4f' }} />
            회원탈퇴
          </Space>
        }
        open={withdrawModalVisible}
        onCancel={() => {
          setWithdrawModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <div style={{ margin: '24px 0' }}>
          <Alert
            message="최종 확인"
            description={
              <div>
                <p>회원탈퇴를 진행하시겠습니까?</p>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  <li>모든 개인 정보가 영구적으로 삭제됩니다</li>
                  <li>대출 기록 및 활동 내역이 사라집니다</li>
                  <li>탈퇴 후 동일한 아이디로 재가입이 불가능합니다</li>
                </ul>
              </div>
            }
            type="error"
            showIcon
            style={{ marginBottom: '24px' }}
          />
          
          <Form
            form={form}
            onFinish={handleWithdraw}
            layout="vertical"
          >
            <Form.Item
              name="password"
              label="비밀번호 확인"
              rules={[
                { required: true, message: '비밀번호를 입력해주세요!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="현재 비밀번호를 입력하세요"
                size="large"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setWithdrawModalVisible(false);
                  form.resetFields();
                }}>
                  취소
                </Button>
                <Button
                  type="primary"
                  danger
                  htmlType="submit"
                  loading={withdrawLoading}
                  icon={<UserDeleteOutlined />}
                >
                  {withdrawLoading ? '탈퇴 처리 중...' : '탈퇴하기'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;