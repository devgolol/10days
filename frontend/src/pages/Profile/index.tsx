import React, { useState, useContext, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Typography,
  Space,
  Avatar,
  Divider,
  Row,
  Col,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { AuthContext } from '../../App';

const { Title, Text } = Typography;

interface UserProfile {
  id: number;
  username: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: string;
  memberNumber?: string;
  joinDate?: string;
}

const Profile: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // AuthContext가 없으면 렌더링하지 않음
  if (!authContext) {
    return null;
  }

  const { username, name, role } = authContext;

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // TODO: 실제 API 호출로 사용자 정보 가져오기
      // const response = await userService.getProfile();
      
      // 임시 데이터 (현재 로그인한 사용자 정보 기반)
      const mockProfile: UserProfile = {
        id: 1,
        username: username || '',
        email: username === 'yuumi5654' ? 'yuumi5654@gmail.com' : username === 'admin' ? 'admin@library.com' : `${username}@example.com`,
        name: name || username || '',  // AuthContext의 name 사용
        phone: username === 'yuumi5654' ? '010-5654-5654' : '010-0000-0000',
        address: username === 'yuumi5654' ? '서울시 강남구' : '서울시',
        role: role || 'USER',
        memberNumber: username === 'admin' ? 'A2025001' : 'M2025010',
        joinDate: '2025-09-17',
      };
      
      setUserProfile(mockProfile);
      form.setFieldsValue(mockProfile);
      setLoading(false);
    } catch (error) {
      message.error('프로필 정보를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      
      // TODO: 실제 API 호출로 사용자 정보 업데이트
      // await userService.updateProfile(values);
      
      // 임시로 로컬 상태만 업데이트
      setUserProfile({ ...userProfile, ...values });
      
      message.success('프로필이 성공적으로 업데이트되었습니다.');
      setEditing(false);
      setLoading(false);
    } catch (error) {
      message.error('프로필 업데이트에 실패했습니다.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.setFieldsValue(userProfile);
    setEditing(false);
  };

  if (!userProfile) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>프로필 정보를 불러오는 중...</Text>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <Title level={2}>내 정보</Title>
        {!editing && (
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => setEditing(true)}
          >
            편집
          </Button>
        )}
      </div>

      <Row gutter={24}>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <Avatar size={80} icon={<UserOutlined />} style={{ marginRight: '24px' }} />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  {userProfile.name}
                </Title>
                <Text type="secondary">
                  {userProfile.username} ({userProfile.role})
                </Text>
                {userProfile.memberNumber && (
                  <>
                    <br />
                    <Text type="secondary">
                      회원번호: {userProfile.memberNumber}
                    </Text>
                  </>
                )}
              </div>
            </div>

            <Divider />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={userProfile}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="사용자명"
                    name="username"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="이메일"
                    name="email"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="이름"
                    name="name"
                    rules={[
                      { required: true, message: '이름을 입력해주세요' },
                      { min: 2, message: '이름은 최소 2글자 이상이어야 합니다' },
                    ]}
                  >
                    <Input disabled={!editing} placeholder="이름을 입력하세요" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="전화번호"
                    name="phone"
                    rules={[
                      { pattern: /^010-\d{4}-\d{4}$/, message: '010-0000-0000 형식으로 입력해주세요' },
                    ]}
                  >
                    <Input disabled={!editing} placeholder="010-0000-0000" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="주소"
                name="address"
              >
                <Input disabled={!editing} placeholder="주소를 입력하세요" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="권한"
                    name="role"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="가입일"
                    name="joinDate"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>

              {editing && (
                <div style={{ textAlign: 'right', marginTop: '24px' }}>
                  <Space>
                    <Button onClick={handleCancel} icon={<CloseOutlined />}>
                      취소
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      icon={<SaveOutlined />}
                    >
                      저장
                    </Button>
                  </Space>
                </div>
              )}
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;