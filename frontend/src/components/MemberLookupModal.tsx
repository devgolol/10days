import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Input,
  Button,
  Space,
  message,
  Typography,
  Tag,
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { memberService } from '../services';
import { getErrorMessage, formatDate } from '../utils';

const { Search } = Input;
const { Text } = Typography;

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

interface MemberLookupModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (member: Member) => void;
}

const MemberLookupModal: React.FC<MemberLookupModalProps> = ({
  visible,
  onCancel,
  onSelect,
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (visible) {
      loadMembers();
    }
  }, [visible]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await memberService.getAll();
      const activeMembers = response.data.filter((member: Member) => member.status === 'ACTIVE');
      setMembers(activeMembers);
      setFilteredMembers(activeMembers);
      setLoading(false);
    } catch (error) {
      message.error(getErrorMessage(error));
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    if (!value.trim()) {
      setFilteredMembers(members);
      return;
    }

    const searchLower = value.toLowerCase();
    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(searchLower) ||
      member.memberNumber.includes(value) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.phone.includes(value)
    );
    setFilteredMembers(filtered);
  };

  const handleSelect = (member: Member) => {
    onSelect(member);
    onCancel();
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
      title: '회원정보',
      key: 'member',
      width: 200,
      render: (_, record: Member) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 2 }}>
            <UserOutlined style={{ marginRight: 4 }} />
            {record.name}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.memberNumber}
          </div>
        </div>
      ),
    },
    {
      title: '연락처',
      key: 'contact',
      width: 180,
      render: (_, record: Member) => (
        <div>
          <div style={{ marginBottom: 2 }}>{record.email}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.phone}
          </div>
        </div>
      ),
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
      title: '가입일',
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      width: 100,
      render: (date: string) => formatDate(date),
    },
    {
      title: '작업',
      key: 'action',
      width: 80,
      align: 'center' as const,
      render: (_, record: Member) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleSelect(record)}
          disabled={record.status !== 'ACTIVE'}
        >
          선택
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title="회원 조회 및 선택"
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          취소
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="회원명, 회원번호, 이메일, 전화번호로 검색"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">
          활성 상태의 회원만 표시됩니다. 원하는 회원을 선택해주세요.
        </Text>
      </div>

      <Table
        columns={columns}
        dataSource={filteredMembers}
        rowKey="id"
        loading={loading}
        pagination={{
          total: filteredMembers.length,
          pageSize: 8,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} / 총 ${total}건`,
        }}
        scroll={{ y: 400 }}
      />
    </Modal>
  );
};

export default MemberLookupModal;