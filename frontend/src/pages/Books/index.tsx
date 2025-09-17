import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  InputNumber,
  Card,
  Tag,
  Typography,
  Modal,
  Form,
  message,
  Popconfirm,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { bookService } from '../../services/bookService';
import { formatDate, getErrorMessage } from '../../utils';

// 로컬 타입 정의
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

interface BookCreateRequest {
  title: string;
  author: string;
  isbn: string;
  totalCopies: number;
  category?: string;
  publishedDate?: string;
}

const { Title } = Typography;
const { Search } = Input;

const BookList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      // 실제 API 호출
      const response = await bookService.getAll();
      setBooks(response.data);
      setLoading(false);
    } catch (error) {
      message.error(getErrorMessage(error));
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchText(value);
    if (!value.trim()) {
      loadBooks();
      return;
    }

    try {
      setLoading(true);
      // 실제 API 호출
      const response = await bookService.search(value);
      setBooks(response.data);
      setLoading(false);
    } catch (error) {
      message.error(getErrorMessage(error));
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingBook(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    form.setFieldsValue({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      totalCopies: book.totalCopies,
      category: book.category,
      publishedDate: book.publishedDate,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      // 실제 API 호출
      await bookService.delete(id);
      setBooks(books.filter(book => book.id !== id));
      message.success('도서가 삭제되었습니다.');
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingBook) {
        // 수정
        const response = await bookService.update(editingBook.id, values);
        const updatedBook = response.data;
        const updatedBooks = books.map(book =>
          book.id === editingBook.id ? updatedBook : book
        );
        setBooks(updatedBooks);
        message.success('도서가 수정되었습니다.');
      } else {
        // 추가
        const response = await bookService.create(values);
        const newBook = response.data;
        setBooks([...books, newBook]);
        message.success('도서가 추가되었습니다.');
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

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '도서명',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <Space>
          <BookOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: '저자',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: '총 권수',
      dataIndex: 'totalCopies',
      key: 'totalCopies',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '대출 가능',
      dataIndex: 'availableCopies',
      key: 'availableCopies',
      width: 90,
      align: 'center' as const,
      render: (available: number, record: Book) => (
        <Tag color={available > 0 ? 'green' : 'red'}>
          {available}/{record.totalCopies}
        </Tag>
      ),
    },
    {
      title: '출간일',
      dataIndex: 'publishedDate',
      key: 'publishedDate',
      render: (date: string) => date ? formatDate(date) : '-',
    },
    {
      title: '액션',
      key: 'action',
      width: 120,
      render: (_, record: Book) => (
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
        <Title level={2}>도서 관리</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          도서 추가
        </Button>
      </div>

      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="도서명, 저자, ISBN으로 검색"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={books}
          rowKey="id"
          loading={loading}
          pagination={{
            total: books.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / 총 ${total}건`,
          }}
        />
      </Card>

      <Modal
        title={editingBook ? '도서 수정' : '도서 추가'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
        okText={editingBook ? '수정' : '추가'}
        cancelText="취소"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="title"
            label="도서명"
            rules={[{ required: true, message: '도서명을 입력해주세요' }]}
          >
            <Input placeholder="도서명을 입력하세요" />
          </Form.Item>

          <Form.Item
            name="author"
            label="저자"
            rules={[{ required: true, message: '저자를 입력해주세요' }]}
          >
            <Input placeholder="저자를 입력하세요" />
          </Form.Item>

          <Form.Item
            name="isbn"
            label="ISBN"
            rules={[
              { required: true, message: 'ISBN을 입력해주세요' },
              { pattern: /^[\d-]+$/, message: '올바른 ISBN 형식이 아닙니다' }
            ]}
          >
            <Input placeholder="ISBN을 입력하세요" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="totalCopies"
                label="총 권수"
                rules={[
                  { required: true, message: '총 권수를 입력해주세요' },
                  { type: 'number', min: 1, message: '1 이상의 수를 입력해주세요' }
                ]}
              >
                <InputNumber 
                  placeholder="총 권수" 
                  min={1} 
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="카테고리"
              >
                <Input placeholder="카테고리 (선택사항)" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="publishedDate"
            label="출간일"
          >
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookList;
