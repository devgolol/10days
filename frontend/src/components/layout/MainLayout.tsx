import React, { useState } from 'react';
import { Layout, Menu, theme, Avatar, Dropdown, Space } from 'antd';
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

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 메뉴 아이템 정의
  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '대시보드',
    },
    {
      key: '/books',
      icon: <BookOutlined />,
      label: '도서 관리',
    },
    {
      key: '/members',
      icon: <UserOutlined />,
      label: '회원 관리',
    },
    {
      key: '/loans',
      icon: <FileTextOutlined />,
      label: '대출 관리',
    },
  ];

  // 사용자 드롭다운 메뉴
  const userMenuItems = [
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
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'logout':
        // 로그아웃 로직 (추후 구현)
        console.log('로그아웃');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
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
                <span>관리자</span>
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
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
