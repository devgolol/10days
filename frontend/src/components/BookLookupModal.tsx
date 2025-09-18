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
  BookOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { bookService } from '../services';
import { getErrorMessage } from '../utils';

const { Search } = Input;
const { Text } = Typography;

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

interface BookLookupModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (book: Book) => void;
}

const BookLookupModal: React.FC<BookLookupModalProps> = ({
  visible,
  onCancel,
  onSelect,
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (visible) {
      loadBooks();
    }
  }, [visible]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getAll();
      const availableBooks = response.data.filter((book: Book) => book.availableCopies > 0);
      setBooks(availableBooks);
      setFilteredBooks(availableBooks);
      setLoading(false);
    } catch (error) {
      message.error(getErrorMessage(error));
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    if (!value.trim()) {
      setFilteredBooks(books);
      return;
    }

    const searchLower = value.toLowerCase();
    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower) ||
      book.isbn.includes(value) ||
      (book.category && book.category.toLowerCase().includes(searchLower))
    );
    setFilteredBooks(filtered);
  };

  const handleSelect = (book: Book) => {
    onSelect(book);
    onCancel();
  };

  const columns = [
    {
      title: '도서명',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (title: string, record: Book) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 2 }}>
            <BookOutlined style={{ marginRight: 4 }} />
            {title}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.author}
          </div>
        </div>
      ),
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
      width: 120,
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => category ? (
        <Tag color="blue">{category}</Tag>
      ) : '-',
    },
    {
      title: '대출 가능',
      key: 'available',
      width: 100,
      align: 'center' as const,
      render: (_, record: Book) => (
        <div>
          <Tag color={record.availableCopies > 0 ? 'green' : 'red'}>
            {record.availableCopies}/{record.totalCopies}권
          </Tag>
        </div>
      ),
    },
    {
      title: '작업',
      key: 'action',
      width: 80,
      align: 'center' as const,
      render: (_, record: Book) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleSelect(record)}
          disabled={record.availableCopies <= 0}
        >
          선택
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title="도서 조회 및 선택"
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
          placeholder="도서명, 저자명, ISBN, 카테고리로 검색"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">
          대출 가능한 도서만 표시됩니다. 원하는 도서를 선택해주세요.
        </Text>
      </div>

      <Table
        columns={columns}
        dataSource={filteredBooks}
        rowKey="id"
        loading={loading}
        pagination={{
          total: filteredBooks.length,
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

export default BookLookupModal;