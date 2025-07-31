"use client";

import Link from "next/link";
import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from "next/navigation";
import { UserOutlined, MessageOutlined, BellOutlined, HomeOutlined, SearchOutlined } from '@ant-design/icons';
import { Input, Badge, notification, Modal, List, Avatar, Spin } from "antd";
import "./Navbar.scss";
import { useSelector, useDispatch } from 'react-redux';
import socket from '../store/socket';
import { useTheme } from '../app/providers';
import { FaMoon, FaSun } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import {
  fetchFriends,
  fetchRequests,
  fetchSentRequests,
  addIncomingRequest
} from '../store/slices/friendSlice';
import { fetchUnreadCounts } from '../store/slices/chatSlice';
import {
  addNotification,
  fetchNotifications,
  markNotificationsRead
} from '../store/slices/notificationsSlice';
import { logoutUser } from '../store/slices/authSlice';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector((state) => state.auth.user);
  const { unread } = useSelector((state) => state.chat);
  const unreadCount = Object.values(unread).reduce((sum, val) => sum + (val || 0), 0);
  const notifications = useSelector((state) => state.notifications.items);
  const notifCount = notifications.filter((n) => !n.read).length;
  const [isNotifModalOpen, setNotifModalOpen] = useState(false);
  const [isCustomModalOpen, setCustomModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const searchTimeout = useRef(null);
  const navbarRef = useRef(null);
  const modalWrapperRef = useRef(null);

  useEffect(() => {
    if (!user?.userId) return;

    dispatch(fetchFriends());
    dispatch(fetchRequests());
    dispatch(fetchUnreadCounts());
    dispatch(fetchNotifications());

    socket.on("notification", (data) => {
      console.log('Notification received:', data);
      if (data) {
        dispatch(addNotification(data));
        if (data.type === 'friend_request') {
          dispatch(addIncomingRequest(data.request));
        }
        if (data.type === 'request_accepted' || data.type === 'request_rejected') {
          dispatch(fetchSentRequests());
        }
        let message = data.message;
        if (data.type === 'post_like' || data.type === 'post_comment') {
          message = (
            <span>
              {data.message} <Link href={`/post/${data.postId}`}>View Post</Link>
            </span>
          );
        }
        notification.open({
          message: "Notification",
          description: message,
        });
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    return () => {
      socket.off("notification");
      socket.off('connect_error');
    };
  }, [dispatch, user?.userId]);

  const handleNotifModalOpen = () => {
    setNotifModalOpen(true);
    const unreadNotificationIds = notifications.filter((n) => !n.read).map((n) => n._id);
    if (unreadNotificationIds.length > 0) {
      dispatch(markNotificationsRead(unreadNotificationIds));
    }
  };

  const handleCustomModalOpen = () => {
    setCustomModalOpen(true);
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    setProfileDropdownOpen((prev) => !prev);
  };

  const dispatchLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.push('/login');
    } catch (error) {
      notification.error({ message: 'Logout failed', description: error.message || 'Please try again' });
    } finally {
      setProfileDropdownOpen(false);
    }
  };

  const handleSearch = (value) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value.trim()) {
      setSearchResults([]);
      setSearchVisible(false);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/api/relationships/all-users`, { credentials: 'include' });
        const allUsers = await response.json();
        const val = value.toLowerCase();
        const data = allUsers.filter((u) =>
          (u.username?.toLowerCase() || '').includes(val) ||
          (u.fullName?.toLowerCase() || '').includes(val)
        );
        setSearchResults(data);
        setSearchVisible(true);
      } catch (error) {
        setSearchResults([]);
        setSearchVisible(true);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  const handleResultClick = (userId) => {
    setSearchVisible(false);
    setSearchResults([]);
    router.push(`/profile/${userId}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isCustomModalOpen &&
        modalWrapperRef.current &&
        !modalWrapperRef.current.contains(event.target) &&
        navbarRef.current &&
        !navbarRef.current.contains(event.target)
      ) {
        setCustomModalOpen(false);
      }
      if (
        isProfileDropdownOpen &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        navbarRef.current &&
        !navbarRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCustomModalOpen, isProfileDropdownOpen]);

  // Debugging logs for unread counts
  console.log('Unread message counts:', unread);
  console.log('Total unread message count:', unreadCount);
  console.log('Unread notification count:', notifCount);
  console.log('Notifications:', notifications);

  return (
    <nav className="navbar" ref={navbarRef}>
      <div className="navbar-left">
        <div className="navbar-logo">
          <Link href="/">
            <span className="logo-text">TalkHub</span>
          </Link>
        </div>
        <div className="navbar-search" ref={searchRef}>
          <Input
            className="search-input"
            placeholder="Search TalkHub"
            prefix={<SearchOutlined style={{ fontSize: 18 }} />}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setSearchVisible(true)}
          />
          {searchVisible && (
            <div className="search-results-dropdown">
              {searchLoading ? (
                <div style={{ textAlign: 'center', padding: 16 }}><Spin size="small" /></div>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleResultClick(user._id)}
                    className="search-result-item"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="user-avatar">
                      {user.avatarImg ? <img src={user.avatarImg} alt={user.username} /> : <UserOutlined />}
                    </div>
                    <span>{user.username}</span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#888', padding: 16 }}>No users found</div>
              )}
            </div>
          )}
        </div>
      </div>
      <ul className="navbar-links">
        <li>
          <Link href="/" className={pathname === "/" ? "active" : ""}>
            <HomeOutlined />
          </Link>
        </li>
        <li>
          <Link href="/chat" className={pathname === "/chat" ? "active" : ""}>
            <Badge count={unreadCount} size="small" offset={[4, -10]}>
              <MessageOutlined style={{ fontSize: 22 }} />
            </Badge>
          </Link>
        </li>
        <li>
          <Badge count={notifCount} size="small" offset={[4, -10]}>
            <span className="notification-bell" onClick={handleNotifModalOpen}>
              <BellOutlined style={{ fontSize: 22 }} />
            </span>
          </Badge>
        </li>
        <li style={{ position: 'relative' }}>
          <span onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
            {user?.avatarImg
              ? <img src={user.avatarImg} alt="Profile" style={{ width: 36, height: 36, borderRadius: '50%' }} />
              : <UserOutlined />}
          </span>
          {isProfileDropdownOpen && (
            <div ref={profileDropdownRef} className="profile-dropdown-menu">
              <div className="profile-dropdown-row profile-info">
                <Link href={`/profile/${user?.userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {user?.avatarImg ? (
                    <img src={user.avatarImg} alt="Profile" style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 0 }} />
                  ) : (
                    <UserOutlined style={{ fontSize: 32, marginRight: 10 }} />
                  )}
                </Link>
                <span className="modal-username" style={{ fontWeight: 500 }}>{user?.username || 'User'}</span>
              </div>
              <div className="profile-dropdown-row theme-toggle-row">
                <button
                  className={`themeToggleBtn modern-toggle ${theme}`}
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? <FaMoon style={{ marginRight: 10 }} /> : <FaSun style={{ marginRight: 10 }} />}
                  <span style={{ fontWeight: 600, letterSpacing: 0.5 }}>
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </button>
              </div>
              <div className="profile-dropdown-row logout-row">
                <button className="logoutBtn" onClick={dispatchLogout}>
                  <FiLogOut style={{ marginRight: 8 }} /> Logout
                </button>
              </div>
            </div>
          )}
        </li>
      </ul>

      <Modal
        open={isNotifModalOpen}
        onCancel={() => setNotifModalOpen(false)}
        footer={null}
        title="Notifications"
        width={380}
      >
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '32px 0', fontSize: 16 }}>
            Nothing updated yet
          </div>
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item style={{ background: item.read ? "#f7f7f7" : "#e6f7ff", borderRadius: 6, marginBottom: 4 }}>
                <List.Item.Meta
                  avatar={<Avatar src={item.from?.avatarImg || "/login.jpeg"} />}
                  title={item.from?.username || "User"}
                  description={
                    item.type === 'post_like' || item.type === 'post_comment' ? (
                      <span>
                        {item.message} <Link href={`/profile/${item.from._id}`}>View Post</Link>
                      </span>
                    ) : (
                      item.message
                    )
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Modal>

      <div ref={modalWrapperRef}>
        <Modal
          open={isCustomModalOpen}
          onCancel={() => setCustomModalOpen(false)}
          footer={null}
          title="Info"
          width={300}
          style={{ top: 60 }}
        >
          <p>Welcome to TalkHub! Click anywhere to close this modal.</p>
        </Modal>
      </div>
    </nav>
  );
}