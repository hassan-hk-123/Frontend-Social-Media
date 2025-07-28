'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Sidenav.scss';
import { HomeOutlined, MessageOutlined, UsergroupAddOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import CreatePostModal from './CreatePostModal';
import { fetchFriends, fetchRequests } from '../store/slices/friendSlice';

export default function Sidebar({ collapsed = false }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Fetch friends and requests when the app loads and user is logged in
    if (user?.userId) {
      dispatch(fetchFriends());
      dispatch(fetchRequests());
    }
  }, [dispatch, user?.userId]);

  return (
    <div className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <ul className="sidebar-list">
        <li>
          <Link href="/" className={pathname === '/' ? 'active' : ''}>
            <span className="sidebar-icon"><HomeOutlined /></span>
            {!collapsed && 'Home'}
          </Link>
        </li>
        <li>
          <Link href="/chat" className={pathname === '/chat' ? 'active' : ''}>
            <span className="sidebar-icon"><MessageOutlined /></span>
            {!collapsed && 'Chat'}
          </Link>
        </li>
        {/* <li>
          <Link href="/friends" className={pathname === '/friends' ? 'active' : ''}>
            <span className="sidebar-icon"><UsergroupAddOutlined /></span>
            {!collapsed && 'Friends'}
          </Link>
        </li> */}
        <li>
          <Link href="#" className={`sidebar-create-link${pathname === '#' ? ' active' : ''}`} onClick={e => { e.preventDefault(); setShowCreateModal(true); }}>
            <span className="sidebar-icon"><PlusOutlined /></span>
            {!collapsed && <span className="sidebar-text">Create</span>}
          </Link>
        </li>
        <li>
          <Link href={`/profile/${user?.userId}`} className={pathname.startsWith('/profile') ? 'active' : ''}>
            <span className="sidebar-icon">
              {user?.avatarImg
                ? <img src={user.avatarImg} alt="Profile" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                : <UserOutlined />}
            </span>
            {!collapsed && 'Profile'}
          </Link>
        </li>
       
      </ul>
      {showCreateModal && <CreatePostModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
} 