import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Card,
  Tag,
  Typography,
  Modal,
  Form,
  message,
  Popconfirm,
  Row,
  Col,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';

// 타입 정의 (임시)
interface Member {
  id: number;
  memberNumber: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

interface MemberCreateRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
}

// Utils 함수들 (임시)
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ko-KR');
};

const getErrorMessage = (error: any) => {
  return error?.message || '오류가 발생했습니다.';
};

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const MemberList: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [form] = Form.useForm();

  // Mock 데이터
  const mockMembers: Member[] = [
    {
      id: 1,
      memberNumber: 'M2025001',
      name: '김철수',
      email: 'kim.cs@email.com',
      phone: '010-1234-5678',
      address: '서울시 강남구 역삼동 123-45',
      status: 'ACTIVE',
      registrationDate: '2025-01-15',
      createdAt: '2025-01-15T09:00:00',
      updatedAt: '2025-01-15T09:00:00',
    },
    {
      id: 2,
      memberNumber: 'M2025002',
      name: '이영희',
      email: 'lee.yh@email.com',
      phone: '010-2345-6789',
      address: '서울시 서초구 서초동 456-78',
      status: 'ACTIVE',
      registrationDate: '2025-01-20',
      createdAt: '2025-01-20T10:30:00',
      updatedAt: '2025-01-20T10:30:00',
    },
    {
      id: 3,
      memberNumber: 'M2025003',
      name: '박민수',
      email: 'park.ms@email.com',
      phone: '010-3456-7890',
      address: '서울시 종로구 종로1가 789-12',
      status: 'SUSPENDED',
      registrationDate: '2025-02-01',
      createdAt: '2025-02-01T14:15:00',
      updatedAt: '2025-02-10T16:20:00',
    },
    {
      id: 4,
      memberNumber: 'M2025004',
      name: '정수현',
      email: 'jung.sh@email.com',
      phone: '010-4567-8901',
      address: '서울시 마포구 홍대동 234-56',
      status: 'ACTIVE',
      registrationDate: '2025-02-05',
      createdAt: '2025-02-05T11:45:00',
      updatedAt: '2025-02-05T11:45:00',
    },
    {
      id: 5,
      memberNumber: 'M2025005',
      name: '황동현',
      email: 'hwang.dh@email.com',
      phone: '010-5678-9012',
      address: '서울시 용산구 이태원동 567-89',
      status: 'INACTIVE',
      registrationDate: '2024-12-10',
      createdAt: '2024-12-10T08:20:00',
      updatedAt: '2025-01-30T15:10:00',
    },
  ];

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      // 실제 API 호출
      // const response = await memberService.getAll();
      // setMembers(response.data.data);
      
      // Mock 데이터 사용
      setTimeout(() => {
        setMembers(mockMembers);
        setLoading(false);
      }, 500);
    } catch (error) {
      message.error(getErrorMessage(error));
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchText(value);
    if (!value.trim()) {
      loadMembers();
      return;
    }

    try {
      setLoading(true);
      // 실제 API 호출
      // const response = await memberService.search(value);
      // setMembers(response.data.data);
      
      // Mock 검색
      const filtered = mockMembers.filter(member =>
        member.name.toLowerCase().includes(value.toLowerCase()) ||
        member.email.toLowerCase().includes(value.toLowerCase()) ||
        member.phone.includes(value) ||
        member.memberNumber.includes(value)
      );
      setMembers(filtered);
      setLoading(false);
    } catch (error) {
      message.error(getErrorMessage(error));
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingMember(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    form.setFieldsValue({
      name: member.name,
      email: member.email,
      phone: member.phone,
      address: member.address,
      status: member.status,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      // 실제 API 호출
      // await memberService.delete(id);
      
      // Mock 삭제
      setMembers(members.filter(member => member.id !== id));
      message.success('회원이 삭제되었습니다.');
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const generateMemberNumber = () => {
    const year = new Date().getFullYear();
    const lastMember = members.reduce((max, member) => {
      const num = parseInt(member.memberNumber.slice(-3));
      return num > max ? num : max;
    }, 0);
    return `M${year}${(lastMember + 1).toString().padStart(3, '0')}`;
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingMember) {
        // 수정
        // const response = await memberService.update(editingMember.id, values);
        
        // Mock 수정
        const updatedMembers = members.map(member =>
          member.id === editingMember.id
            ? { ...member, ...values, updatedAt: new Date().toISOString() }
            : member
        );
        setMembers(updatedMembers);
        message.success('회원 정보가 수정되었습니다.');
      } else {
        // 추가
        // const response = await memberService.create(values);
        
        // Mock 추가
        const newMember: Member = {
          id: Math.max(...members.map(m => m.id)) + 1,
          memberNumber: generateMemberNumber(),
          ...values,
          status: values.status || 'ACTIVE',
          registrationDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setMembers([...members, newMember]);
        message.success('회원이 추가되었습니다.');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      if (error.errorFields) {
        // 폼 validation 에러
        return;
      }
      message.error(getErrorMessage(error));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'SUSPENDED': return 'orange';
      case 'INACTIVE': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '활성';
      case 'SUSPENDED': return '정지';
      case 'INACTIVE': return '비활성';
      default: return status;
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '회원번호',
      dataIndex: 'memberNumber',
      key: 'memberNumber',
      width: 120,
      render: (text: string) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '전화번호',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '주소',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center' as const,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '등록일',
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      width: 100,
      render: (date: string) => date ? formatDate(date) : '-',
    },
    {
      title: '액션',
      key: 'action',
      width: 120,
      render: (_, record: Member) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            수정
          </Button>
          <Popconfirm
            title="정말 삭제하시겠습니까?"
            onConfirm={() => handleDelete(record.id)}
            okText="삭제"
            cancelText="취소"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={2}>회원 관리</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          회원 추가
        </Button>
      </div>

      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="이름, 이메일, 전화번호, 회원번호로 검색"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={members}
          rowKey="id"
          loading={loading}
          pagination={{
            total: members.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / 총 ${total}건`,
          }}
        />
      </Card>

      <Modal
        title={editingMember ? '회원 정보 수정' : '회원 추가'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
        okText={editingMember ? '수정' : '추가'}
        cancelText="취소"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          {!editingMember && (
            <div style={{ 
              background: '#f0f2f5', 
              padding: '12px', 
              borderRadius: '6px', 
              marginBottom: '16px',
              color: '#666'
            }}>
              📋 회원번호는 자동으로 생성됩니다: {generateMemberNumber()}
            </div>
          )}

          <Form.Item
            name="name"
            label="이름"
            rules={[{ required: true, message: '이름을 입력해주세요' }]}
          >
            <Input placeholder="이름을 입력하세요" />
          </Form.Item>

          <Form.Item
            name="email"
            label="이메일"
            rules={[
              { required: true, message: '이메일을 입력해주세요' },
              { type: 'email', message: '올바른 이메일 형식이 아닙니다' }
            ]}
          >
            <Input placeholder="이메일을 입력하세요" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="전화번호"
            rules={[
              { required: true, message: '전화번호를 입력해주세요' },
              { pattern: /^010-\d{4}-\d{4}$/, message: '010-0000-0000 형식으로 입력해주세요' }
            ]}
          >
            <Input placeholder="010-0000-0000" />
          </Form.Item>

          <Form.Item
            name="address"
            label="주소"
            rules={[{ required: true, message: '주소를 입력해주세요' }]}
          >
            <Input.TextArea 
              placeholder="주소를 입력하세요" 
              rows={3}
            />
          </Form.Item>

          {editingMember && (
            <Form.Item
              name="status"
              label="상태"
              rules={[{ required: true, message: '상태를 선택해주세요' }]}
            >
              <Select placeholder="상태를 선택하세요">
                <Option value="ACTIVE">활성</Option>
                <Option value="SUSPENDED">정지</Option>
                <Option value="INACTIVE">비활성</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default MemberList;