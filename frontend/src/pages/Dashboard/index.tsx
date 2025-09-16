import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography, Space, Alert } from 'antd';
import {
  BookOutlined,
  UserOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { dashboardService } from '../../services';
import { formatDate, formatCurrency, getErrorMessage } from '../../utils';

const { Title } = Typography;

interface DashboardData {
  totalBooks: number;
  totalMembers: number;
  activeLoans: number;
  overdueLoans: number;
  recentLoans: any[];
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    totalBooks: 0,
    totalMembers: 0,
    activeLoans: 0,
    overdueLoans: 0,
    recentLoans: [],
  });
  const [error, setError] = useState<string | null>(null);

  // Mock 데이터 (백엔드 연동 전까지 사용)
  const mockData: DashboardData = {
    totalBooks: 1250,
    totalMembers: 350,
    activeLoans: 89,
    overdueLoans: 12,
    recentLoans: [
      {
        id: 1,
        bookTitle: '클린 코드',
        memberName: '김철수',
        loanDate: '2025-09-10',
        dueDate: '2025-09-24',
        status: 'ACTIVE',
      },
      {
        id: 2,
        bookTitle: '이펙티브 자바',
        memberName: '이영희',
        loanDate: '2025-09-12',
        dueDate: '2025-09-26',
        status: 'ACTIVE',
      },
      {
        id: 3,
        bookTitle: 'Spring Boot 실전 가이드',
        memberName: '박민수',
        loanDate: '2025-09-05',
        dueDate: '2025-09-19',
        status: 'OVERDUE',
      },
      {
        id: 4,
        bookTitle: 'React 완벽 가이드',
        memberName: '최수진',
        loanDate: '2025-09-14',
        dueDate: '2025-09-28',
        status: 'ACTIVE',
      },
      {
        id: 5,
        bookTitle: 'TypeScript 핸드북',
        memberName: '정대현',
        loanDate: '2025-09-08',
        dueDate: '2025-09-22',
        status: 'ACTIVE',
      },
    ],
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 실제 API 호출 (현재는 mock 데이터 사용)
      // const response = await dashboardService.getStats();
      // setData(response.data.data);
      
      // Mock 데이터 사용
      setTimeout(() => {
        setData(mockData);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  // 최근 대출 테이블 컬럼
  const recentLoansColumns = [
    {
      title: '도서명',
      dataIndex: 'bookTitle',
      key: 'bookTitle',
    },
    {
      title: '회원명',
      dataIndex: 'memberName',
      key: 'memberName',
    },
    {
      title: '대출일',
      dataIndex: 'loanDate',
      key: 'loanDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: '반납예정일',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          ACTIVE: { color: 'green', text: '대출중' },
          OVERDUE: { color: 'red', text: '연체' },
          RETURNED: { color: 'blue', text: '반납완료' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  if (error) {
    return (
      <Alert
        message="데이터 로딩 오류"
        description={error}
        type="error"
        showIcon
        action={
          <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={loadDashboardData}>
            다시 시도
          </span>
        }
      />
    );
  }

  return (
    <div>
      <Title level={2}>대시보드</Title>
      
      {/* 통계 카드 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="전체 도서"
              value={data.totalBooks}
              prefix={<BookOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="전체 회원"
              value={data.totalMembers}
              prefix={<UserOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="대출중인 도서"
              value={data.activeLoans}
              prefix={<FileTextOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="연체 도서"
              value={data.overdueLoans}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* 연체 알림 */}
      {data.overdueLoans > 0 && (
        <Alert
          message={`현재 ${data.overdueLoans}건의 연체가 있습니다.`}
          description="연체된 도서를 확인하고 회원에게 알림을 보내주세요."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
          action={
            <Space>
              <span style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                연체 목록 보기
              </span>
            </Space>
          }
        />
      )}

      {/* 최근 대출 목록 */}
      <Card title="최근 대출 목록" style={{ marginBottom: 24 }}>
        <Table
          columns={recentLoansColumns}
          dataSource={data.recentLoans}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default Dashboard;
