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
import { memberService } from '../../services';
import { formatDate, getErrorMessage } from '../../utils';

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

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      // 실제 API 호출
      const response = await memberService.getAll();
      setMembers(response.data);
      setLoading(false);
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
      const response = await memberService.search(value);
      setMembers(response.data);
      setLoading(false);
    } catch (error) {
      message.error(getErrorMessage(error));
      setLoading(false);
    }
  };

  // 회원 추가 기능 제거됨 - handleAdd 함수 비활성화
  // const handleAdd = () => {
  //   setEditingMember(null);
  //   form.resetFields();
  //   setIsModalVisible(true);
  // };

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
      await memberService.delete(id);
      setMembers(members.filter(member => member.id !== id));
      message.success('회원이 삭제되었습니다.');
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingMember) {
        // 수정만 가능 (추가 기능 제거됨)
        const response = await memberService.update(editingMember.id, values);
        const updatedMember = response.data;
        const updatedMembers = members.map(member =>
          member.id === editingMember.id ? updatedMember : member
        );
        setMembers(updatedMembers);
        message.success('회원 정보가 수정되었습니다.');
      } else {
        // 회원 추가 기능이 제거되었으므로 이 케이스는 발생하지 않음
        message.error('회원 추가 기능은 비활성화되었습니다.');
        return;
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
      width: 150,
      render: (_, record: Member) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            수정
          </Button>
          {/* admin 계정(관리자)은 삭제 불가, admin2는 삭제 가능 */}
          {record.name !== '관리자' && record.email !== 'admin@library.com' ? (
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
          ) : (
            <Button
              type="link"
              size="small"
              disabled
              icon={<DeleteOutlined />}
              title="관리자 계정은 삭제할 수 없습니다"
            >
              삭제
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={2}>회원 관리</Title>
        {/* 회원 추가 기능 제거됨 - 수정 및 삭제만 가능 */}
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
        title={editingMember ? '회원 정보 수정' : '회원 수정'} // 추가 기능 제거됨
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
        okText={editingMember ? '수정' : '수정'} // 항상 수정만 가능
        cancelText="취소"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          {/* 회원 추가 기능이 제거되어 이 메시지는 항상 표시되지 않음 */}
          {!editingMember && (
            <div style={{ 
              background: '#fff2e8', 
              padding: '12px', 
              borderRadius: '6px', 
              marginBottom: '16px',
              color: '#d46b08',
              border: '1px solid #ffbb96'
            }}>
              ⚠️ 회원 추가 기능이 비활성화되었습니다. 수정만 가능합니다.
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