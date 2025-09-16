import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import BookList from './pages/Books';
import 'antd/dist/reset.css';
import './App.css';

// dayjs 한국어 설정
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale('ko');
dayjs.extend(relativeTime);

const App: React.FC = () => {
  return (
    <ConfigProvider locale={koKR}>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Navigate to="/" replace />} />
            <Route path="books" element={<BookList />} />
            <Route path="members" element={<div>회원 관리 페이지 (준비중)</div>} />
            <Route path="loans" element={<div>대출 관리 페이지 (준비중)</div>} />
            <Route path="*" element={<div>페이지를 찾을 수 없습니다.</div>} />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
