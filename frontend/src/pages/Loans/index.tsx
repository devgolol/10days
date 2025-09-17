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
  AutoComplete,
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
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { loanService, bookService, memberService } from '../../services';
import { formatDate, getErrorMessage } from '../../utils';
import { AuthContext } from '../../App';

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
  const [bookSearchOptions, setBookSearchOptions] = useState<any[]>([]);
  const [memberSearchOptions, setMemberSearchOptions] = useState<any[]>([]);

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
    form.resetFields();
    setBookSearchOptions([]);
    setMemberSearchOptions([]);
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

  // 도서 검색 함수
  const onBookSearch = (value: string) => {
    if (!value) {
      setBookSearchOptions([]);
      return;
    }
    
    const filteredBooks = books
      .filter(book => 
        book.availableCopies > 0 && (
          book.title.toLowerCase().includes(value.toLowerCase()) ||
          book.author.toLowerCase().includes(value.toLowerCase()) ||
          book.isbn.includes(value)
        )
      )
      .map(book => ({
        value: book.title, // ID 대신 책 제목을 value로 사용
        label: (
          <div>
            <div style={{ fontWeight: 'bold' }}>{book.title}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {book.author} | 재고: {book.availableCopies}권
            </div>
          </div>
        ),
        book: book
      }));
    
    setBookSearchOptions(filteredBooks);
  };

  // 회원 검색 함수
  const onMemberSearch = (value: string) => {
    if (!value) {
      setMemberSearchOptions([]);
      return;
    }
    
    const filteredMembers = members
      .filter(member => 
        member.status === 'ACTIVE' && (
          member.name.toLowerCase().includes(value.toLowerCase()) ||
          member.memberNumber.includes(value) ||
          member.email.toLowerCase().includes(value.toLowerCase())
        )
      )
      .map(member => ({
        value: member.name, // ID 대신 회원 이름을 value로 사용
        label: (
          <div>
            <div style={{ fontWeight: 'bold' }}>{member.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {member.memberNumber} | {member.email}
            </div>
          </div>
        ),
        member: member
      }));
    
    setMemberSearchOptions(filteredMembers);
  };

  const handleModalOk = async (e?: React.MouseEvent) => {
    e?.preventDefault(); // 기본 동작 방지
    e?.stopPropagation(); // 이벤트 전파 방지
    
    try {
      const values = await form.validateFields();
      await handleFormSubmit(values);
    } catch (error) {
      // validation 에러는 이미 form에서 처리됨
      console.error('Form validation error:', error);
    }
  };

  const handleFormSubmit = async (values: any) => {
    try {
      // 선택된 책 제목과 회원 이름으로 실제 객체를 찾기
      const selectedBook = books.find(book => book.title === values.bookId);
      const selectedMember = members.find(member => member.name === values.memberId);
      
      if (!selectedBook || !selectedMember) {
        message.error('도서 또는 회원 정보를 찾을 수 없습니다.');
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
      const response = await loanService.create(loanData);
      
      // 대출 목록 새로고침
      loadLoans();
      message.success('도서가 대출되었습니다.');
      
      setIsModalVisible(false);
      form.resetFields();
      setBookSearchOptions([]);
      setMemberSearchOptions([]);
    } catch (error) {
      message.error(getErrorMessage(error));
    }
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
            {record.book.title}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.book.author} | {record.book.isbn}
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
            {record.member.name}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.member.memberNumber}
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
          form.resetFields();
          setBookSearchOptions([]);
          setMemberSearchOptions([]);
        }}
        width={600}
        footer={[
          <Button key="cancel" onClick={() => {
            setIsModalVisible(false);
            form.resetFields();
            setBookSearchOptions([]);
            setMemberSearchOptions([]);
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
          <Form.Item
            name="bookId"
            label="도서"
            rules={[{ required: true, message: '도서를 선택해주세요' }]}
          >
            <AutoComplete
              placeholder="도서명, 저자명, ISBN으로 검색하세요"
              onSearch={onBookSearch}
              onChange={(value) => {
                form.setFieldsValue({ bookId: value });
              }}
              options={bookSearchOptions}
              style={{ width: '100%' }}
              filterOption={false}
              notFoundContent={books.length === 0 ? '도서 목록을 불러오는 중...' : '검색 결과가 없습니다'}
            />
          </Form.Item>

          <Form.Item
            name="memberId"
            label="회원"
            rules={[{ required: true, message: '회원을 선택해주세요' }]}
          >
            <AutoComplete
              placeholder="회원명, 회원번호, 이메일로 검색하세요"
              onSearch={onMemberSearch}
              onChange={(value) => {
                form.setFieldsValue({ memberId: value });
              }}
              options={memberSearchOptions}
              style={{ width: '100%' }}
              filterOption={false}
              notFoundContent={members.length === 0 ? '회원 목록을 불러오는 중...' : '검색 결과가 없습니다'}
            />
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
    </div>
  );
};

export default LoanList;