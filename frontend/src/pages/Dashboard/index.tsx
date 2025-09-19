import React, { useEffect, useState, useContext } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography, Space, Alert } from 'antd';
import {
  BookOutlined,
  UserOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { dashboardService } from '../../services';
import { formatDate, formatCurrency, getErrorMessage } from '../../utils';
import { AuthContext } from '../../App';

const { Title } = Typography;

interface DashboardData {
  totalBooks?: number;
  totalMembers?: number;
  activeLoans: number;
  overdueLoans: number;
  recentLoans: any[];
  myActiveLoans?: number;
  myOverdueLoans?: number;
  myTotalLoans?: number;
}

const Dashboard: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    activeLoans: 0,
    overdueLoans: 0,
    recentLoans: [],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [authContext]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 모든 사용자가 개인 통계를 보도록 변경 (관리자도 개인 대출 목록 표시)
      if (authContext?.role === 'ADMIN') {
        // 관리자: 전체 통계 + 개인 대출 목록
        const [statsResponse, myStatsResponse] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getMyStats()
        ]);
        
        // 전체 통계는 유지하되, 대출 목록은 개인 것으로 교체
        const statsData = statsResponse.data.data;
        const myStatsData = myStatsResponse.data.data;
        
        setData({
          ...statsData,
          recentLoans: myStatsData.recentLoans || [] // 개인 대출 목록으로 교체
        });
      } else {
        // 일반 사용자: 개인 통계
        const response = await dashboardService.getMyStats();
        setData(response.data.data);
      }
      
      setLoading(false);
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  // 최근 대출 테이블 컬럼
  const recentLoansColumns = [
    {
      title: '도서명',
      dataIndex: 'book',
      key: 'bookTitle',
      render: (book: any) => book?.title || '삭제된 도서',
    },
    {
      title: '회원명',
      dataIndex: 'member',
      key: 'memberName',
      render: (member: any) => member?.name || '삭제된 회원',
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
          LOST: { color: 'orange', text: '분실' },
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
        {authContext?.role === 'ADMIN' ? (
          // 관리자용 통계
          <>
            <Col span={6}>
              <Card>
                <Statistic
                  title="전체 도서"
                  value={data.totalBooks || 0}
                  prefix={<BookOutlined />}
                  loading={loading}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="전체 회원"
                  value={data.totalMembers || 0}
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
          </>
        ) : (
          // 일반 사용자용 통계
          <>
            <Col span={8}>
              <Card>
                <Statistic
                  title="나의 대출중인 도서"
                  value={data.myActiveLoans || 0}
                  prefix={<FileTextOutlined />}
                  loading={loading}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="나의 연체 도서"
                  value={data.myOverdueLoans || 0}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                  loading={loading}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="나의 총 대출 이력"
                  value={data.myTotalLoans || 0}
                  prefix={<BookOutlined />}
                  loading={loading}
                />
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* 연체 알림 */}
      {((authContext?.role === 'ADMIN' && data.overdueLoans > 0) || 
        (authContext?.role === 'USER' && (data.myOverdueLoans || 0) > 0)) && (
        <Alert
          message={authContext?.role === 'ADMIN' 
            ? `현재 ${data.overdueLoans}건의 연체가 있습니다.`
            : `${data.myOverdueLoans}건의 연체 도서가 있습니다.`
          }
          description={authContext?.role === 'ADMIN'
            ? "연체된 도서를 확인하고 회원에게 알림을 보내주세요."
            : "연체된 도서를 반납해주세요."
          }
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
      <Card title="나의 최근 대출 목록" style={{ marginBottom: 24 }}>
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
