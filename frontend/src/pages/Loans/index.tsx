import React, { useState, useEffect, useContext } from 'react';
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
  DatePicker,
  Tooltip,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { loanService, bookService, memberService } from '../../services';
import { formatDate, getErrorMessage } from '../../utils';
import { AuthContext } from '../../App';
import BookLookupModal from '../../components/BookLookupModal';
import MemberLookupModal from '../../components/MemberLookupModal';

// 타입 정의 (임시)
interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  category?: string;
  publishedDate?: string;
  createdAt: string;
  updatedAt: string;
}

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

interface Loan {
  id: number;
  book: Book;
  member: Member;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'LOST';
  overdueFee: number;
  createdAt: string;
  updatedAt: string;
}

interface LoanCreateRequest {
  bookId: number;
  memberId: number;
}

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const LoanList: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [returningLoan, setReturningLoan] = useState<Loan | null>(null);
  const [form] = Form.useForm();
  const [returnForm] = Form.useForm();
  
  // 조회 모달 상태들
  const [isBookLookupVisible, setIsBookLookupVisible] = useState(false);
  const [isMemberLookupVisible, setIsMemberLookupVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // AuthContext가 없으면 렌더링하지 않음
  if (!authContext) {
    return null;
  }

  const { role } = authContext;

  useEffect(() => {
    // 모든 권한에서 대출 데이터 로딩 가능
    loadLoans();
    // 도서와 회원 데이터는 모든 권한에서 로딩 (대출등록 기능을 위해)
    loadBooksAndMembers();
  }, [role]);

  const loadLoans = async () => {
    try {
      setLoading(true);
      // 실제 API 호출
      const response = await loanService.getAll();
      setLoans(response.data);
      setLoading(false);
    } catch (error) {
      message.error(getErrorMessage(error));
      setLoading(false);
    }
  };

  const loadBooksAndMembers = async () => {
    try {
      // 실제 API 호출
      const [booksResponse, membersResponse] = await Promise.all([
        bookService.getAll(),
        memberService.getAll()
      ]);
      setBooks(booksResponse.data);
      setMembers(membersResponse.data);
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleSearch = async (value: string) => {
    setSearchText(value);
    if (!value.trim()) {
      loadLoans();
      return;
    }

    try {
      setLoading(true);
      // 실제 API 호출
      const response = await loanService.search(value);
      setLoans(response.data);
      setLoading(false);
    } catch (error) {
      message.error(getErrorMessage(error));
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingLoan(null);
    setSelectedBook(null);
    setSelectedMember(null);
    form.resetFields();
    
    const today = dayjs();
    form.setFieldsValue({
      loanDate: today,
      dueDate: today.add(14, 'day'), // 14일 후
    });
    setIsModalVisible(true);
  };

  const handleReturn = (loan: Loan) => {
    setReturningLoan(loan);
    returnForm.resetFields();
    returnForm.setFieldsValue({
      returnDate: dayjs(),
    });
    setIsReturnModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      // 실제 API 호출
      await loanService.delete(id);
      setLoans(loans.filter(loan => loan.id !== id));
      message.success('대출 기록이 삭제되었습니다.');
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const calculateOverdueFee = (dueDate: string, returnDate?: string) => {
    const due = dayjs(dueDate);
    const returned = returnDate ? dayjs(returnDate) : dayjs();
    
    if (returned.isAfter(due)) {
      const overdueDays = returned.diff(due, 'day');
      return overdueDays * 100; // 1일당 100원
    }
    return 0;
  };

  const handleModalOk = async (e?: React.MouseEvent) => {
    e?.preventDefault(); // 기본 동작 방지
    e?.stopPropagation(); // 이벤트 전파 방지
    
    try {
      // 도서와 회원 선택 확인
      if (!selectedBook) {
        message.error('도서를 선택해주세요.');
        return;
      }
      
      if (!selectedMember) {
        message.error('회원을 선택해주세요.');
        return;
      }
      
      const values = await form.validateFields();
      await handleFormSubmit(values);
    } catch (error) {
      // validation 에러는 이미 form에서 처리됨
      console.error('Form validation error:', error);
    }
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (!selectedBook || !selectedMember) {
        message.error('도서와 회원을 모두 선택해주세요.');
        return;
      }

      // 대출 가능 여부 확인
      if (selectedBook.availableCopies <= 0) {
        message.error('대출 가능한 도서가 없습니다.');
        return;
      }

      // 회원 상태 확인
      if (selectedMember.status !== 'ACTIVE') {
        message.error('활성 상태의 회원만 대출할 수 있습니다.');
        return;
      }

      // 실제 API 호출 (ID 사용)
      const loanData = {
        bookId: selectedBook.id,
        memberId: selectedMember.id,
        loanDate: values.loanDate.format('YYYY-MM-DD'),
        dueDate: values.dueDate.format('YYYY-MM-DD')
      };
      
      console.log('대출 데이터:', loanData); // 디버깅용
      
      const response = await loanService.create(loanData);
      
      // 대출 목록 새로고침
      loadLoans();
      message.success('도서가 대출되었습니다.');
      
      setIsModalVisible(false);
      setSelectedBook(null);
      setSelectedMember(null);
      form.resetFields();
    } catch (error: any) {
      console.error('대출 등록 에러:', error); // 디버깅용
      console.error('에러 응답:', error.response); // 디버깅용
      
      // 더 상세한 에러 메시지 처리
      let errorMessage = '알 수 없는 오류가 발생했습니다.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : '서버에서 오류가 발생했습니다.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
      console.log('표시될 에러 메시지:', errorMessage); // 디버깅용
    }
  };

  // 도서 조회 모달 핸들러
  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setIsBookLookupVisible(false);
  };

  // 회원 조회 모달 핸들러
  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
    setIsMemberLookupVisible(false);
  };

  const handleReturnOk = async () => {
    try {
      const values = await returnForm.validateFields();
      
      if (!returningLoan) return;

      const returnDate = values.returnDate.format('YYYY-MM-DD');
      const overdueFee = calculateOverdueFee(returningLoan.dueDate, returnDate);
      
      // 실제 API 호출
      const returnData = {
        returnDate: returnDate
      };
      await loanService.returnBook(returningLoan.id, returnData);
      
      // 대출 목록 새로고침
      loadLoans();
      
      if (overdueFee > 0) {
        message.success(`도서가 반납되었습니다. 연체료: ${overdueFee}원`);
      } else {
        message.success('도서가 반납되었습니다.');
      }
      
      setIsReturnModalVisible(false);
      returnForm.resetFields();
      setReturningLoan(null);
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      message.error(getErrorMessage(error));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'blue';
      case 'RETURNED': return 'green';
      case 'OVERDUE': return 'red';
      case 'LOST': return 'gray';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '대출중';
      case 'RETURNED': return '반납완료';
      case 'OVERDUE': return '연체';
      case 'LOST': return '분실';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <BookOutlined />;
      case 'RETURNED': return <CheckCircleOutlined />;
      case 'OVERDUE': return <ExclamationCircleOutlined />;
      default: return null;
    }
  };

  const isOverdue = (loan: Loan) => {
    if (loan.status === 'RETURNED') return false;
    return dayjs().isAfter(dayjs(loan.dueDate));
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '도서',
      key: 'book',
      render: (_, record: Loan) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            <BookOutlined style={{ marginRight: 4 }} />
            {record.book?.title || '정보 없음'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.book?.author || '알 수 없음'} | {record.book?.isbn || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: '회원',
      key: 'member',
      render: (_, record: Loan) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            <UserOutlined style={{ marginRight: 4 }} />
            {record.member?.name || '정보 없음'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.member?.memberNumber || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: '대출일',
      dataIndex: 'loanDate',
      key: 'loanDate',
      width: 100,
      render: (date: string) => (
        <div>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {formatDate(date)}
        </div>
      ),
    },
    {
      title: '반납예정일',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 110,
      render: (date: string, record: Loan) => (
        <div style={{ color: isOverdue(record) && record.status === 'ACTIVE' ? '#ff4d4f' : 'inherit' }}>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {formatDate(date)}
          {isOverdue(record) && record.status === 'ACTIVE' && (
            <div style={{ fontSize: '11px', color: '#ff4d4f' }}>
              ({dayjs().diff(dayjs(date), 'day')}일 연체)
            </div>
          )}
        </div>
      ),
    },
    {
      title: '반납일',
      dataIndex: 'returnDate',
      key: 'returnDate',
      width: 100,
      render: (date: string) => date ? (
        <div style={{ color: '#52c41a' }}>
          <CheckCircleOutlined style={{ marginRight: 4 }} />
          {formatDate(date)}
        </div>
      ) : '-',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center' as const,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '연체료',
      dataIndex: 'overdueFee',
      key: 'overdueFee',
      width: 80,
      align: 'center' as const,
      render: (fee: number) => fee > 0 ? (
        <div style={{ color: '#ff4d4f' }}>
          <DollarOutlined style={{ marginRight: 2 }} />
          {fee}원
        </div>
      ) : '-',
    },
    {
      title: '액션',
      key: 'action',
      width: 100,
      render: (_, record: Loan) => (
        <Space size="small">
          {record.status === 'ACTIVE' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleReturn(record)}
            >
              반납
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={2}>대출 관리</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          대출 등록
        </Button>
      </div>

      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="도서명, 회원명, 회원번호, ISBN으로 검색"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={loans}
          rowKey="id"
          loading={loading}
          pagination={{
            total: loans.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / 총 ${total}건`,
          }}
        />
      </Card>

      {/* 대출 등록 모달 */}
      <Modal
        title="대출 등록"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedBook(null);
          setSelectedMember(null);
          form.resetFields();
        }}
        width={600}
        footer={[
          <Button key="cancel" onClick={() => {
            setIsModalVisible(false);
            setSelectedBook(null);
            setSelectedMember(null);
            form.resetFields();
          }}>
            취소
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleModalOk}
            htmlType="button"
          >
            대출 등록
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
          onFinish={handleFormSubmit}
        >
          <Form.Item label="도서">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                icon={<FileSearchOutlined />}
                onClick={() => setIsBookLookupVisible(true)}
                style={{ width: '100%', height: 40 }}
              >
                도서 조회 및 선택
              </Button>
              {selectedBook && (
                <div style={{ 
                  padding: '8px 12px', 
                  background: '#f6ffed', 
                  border: '1px solid #b7eb8f',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#389e0d' }}>
                    <BookOutlined style={{ marginRight: 4 }} />
                    {selectedBook.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
                    저자: {selectedBook.author} | ISBN: {selectedBook.isbn} | 
                    대출가능: {selectedBook.availableCopies}권
                  </div>
                </div>
              )}
            </Space>
          </Form.Item>

          <Form.Item label="회원">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                icon={<FileSearchOutlined />}
                onClick={() => setIsMemberLookupVisible(true)}
                style={{ width: '100%', height: 40 }}
              >
                회원 조회 및 선택
              </Button>
              {selectedMember && (
                <div style={{ 
                  padding: '8px 12px', 
                  background: '#f6ffed', 
                  border: '1px solid #b7eb8f',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#389e0d' }}>
                    <UserOutlined style={{ marginRight: 4 }} />
                    {selectedMember.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
                    회원번호: {selectedMember.memberNumber} | 이메일: {selectedMember.email}
                  </div>
                </div>
              )}
            </Space>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="loanDate"
                label="대출일"
                rules={[{ required: true, message: '대출일을 선택해주세요' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="반납예정일"
                rules={[{ required: true, message: '반납예정일을 선택해주세요' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 반납 모달 */}
      <Modal
        title="도서 반납"
        open={isReturnModalVisible}
        onOk={handleReturnOk}
        onCancel={() => {
          setIsReturnModalVisible(false);
          returnForm.resetFields();
          setReturningLoan(null);
        }}
        width={500}
        okText="반납 처리"
        cancelText="취소"
      >
        {returningLoan && (
          <div>
            <div style={{ background: '#f0f2f5', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <div><strong>도서:</strong> {returningLoan.book.title}</div>
              <div><strong>회원:</strong> {returningLoan.member.name}</div>
              <div><strong>대출일:</strong> {formatDate(returningLoan.loanDate)}</div>
              <div><strong>반납예정일:</strong> {formatDate(returningLoan.dueDate)}</div>
              {isOverdue(returningLoan) && (
                <div style={{ color: '#ff4d4f', marginTop: '8px' }}>
                  <ExclamationCircleOutlined /> 연체 상태입니다!
                </div>
              )}
            </div>

            <Form
              form={returnForm}
              layout="vertical"
            >
              <Form.Item
                name="returnDate"
                label="반납일"
                rules={[{ required: true, message: '반납일을 선택해주세요' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Form>

            {returningLoan && (
              <div style={{ marginTop: '16px', padding: '12px', background: '#fff2e8', borderRadius: '6px' }}>
                <div><strong>예상 연체료:</strong></div>
                <div style={{ fontSize: '18px', color: '#fa8c16', fontWeight: 'bold' }}>
                  {calculateOverdueFee(returningLoan.dueDate, returnForm.getFieldValue('returnDate')?.format('YYYY-MM-DD'))}원
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  연체료는 1일당 100원입니다.
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 도서 조회 모달 */}
      <BookLookupModal
        visible={isBookLookupVisible}
        onCancel={() => setIsBookLookupVisible(false)}
        onSelect={handleBookSelect}
      />

      {/* 회원 조회 모달 */}
      <MemberLookupModal
        visible={isMemberLookupVisible}
        onCancel={() => setIsMemberLookupVisible(false)}
        onSelect={handleMemberSelect}
      />
    </div>
  );
};

export default LoanList;