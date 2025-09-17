import React, { useState, useContext } from 'react';
import { Layout, Menu, theme, Avatar, Dropdown, Space, message } from 'antd';
import {
  DashboardOutlined,
  BookOutlined,
  UserOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../App';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const authContext = useContext(AuthContext);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  if (!authContext) {
    return null; // AuthContext가 없으면 렌더링하지 않음
  }

  const { username, role, logout } = authContext;

  // 메뉴 아이템 정의 - 역할별 권한 제어
  const allMenuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '대시보드',
      roles: ['ADMIN', 'USER'], // 모든 사용자 접근 가능
    },
    {
      key: '/books',
      icon: <BookOutlined />,
      label: '도서 관리',
      roles: ['ADMIN'], // 관리자만 접근 가능
    },
    {
      key: '/members',
      icon: <UserOutlined />,
      label: '회원 관리',
      roles: ['ADMIN'], // 관리자만 접근 가능
    },
    {
      key: '/loans',
      icon: <FileTextOutlined />,
      label: '대출 관리',
      roles: ['ADMIN'], // 관리자만 접근 가능
    },
  ];

  // 현재 사용자 역할에 따른 메뉴 필터링
  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  // 사용자 드롭다운 메뉴 - 역할별 메뉴 구성
  const getUserMenuItems = () => {
    const baseItems = [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '내 정보',
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: '설정',
      },
    ];

    // USER 역할인 경우 회원탈퇴 메뉴 추가
    if (role === 'USER') {
      baseItems.push({
        key: 'withdraw',
        icon: <UserOutlined />,
        label: '회원탈퇴',
      });
    }

    baseItems.push(
      {
        type: 'divider' as const,
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '로그아웃',
        danger: true,
      }
    );

    return baseItems;
  };

  const userMenuItems = getUserMenuItems();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'logout':
        logout();
        message.success('로그아웃되었습니다.');
        navigate('/login');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'withdraw':
        // 회원탈퇴 확인 모달 표시
        // TODO: 회원탈퇴 기능 구현
        message.info('회원탈퇴 기능은 추후 구현 예정입니다.');
        break;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{
          height: 32,
          margin: 16,
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
        }}>
          {collapsed ? 'LMS' : '도서관리 시스템'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: '0 16px', 
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {React.createElement(
              collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
              {
                className: 'trigger',
                onClick: () => setCollapsed(!collapsed),
                style: { fontSize: '18px', cursor: 'pointer' },
              }
            )}
          </div>
          
          <div>
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <span>{username} ({role})</span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
