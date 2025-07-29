"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Sidenav from '../../../components/Sidenav';
import '../page.scss';
import { useSelector, useDispatch } from 'react-redux';
import { getProfile, updateProfile, uploadAvatar, uploadCover } from '../../../store/slices/authSlice';
import { FaPencilAlt, FaBriefcase, FaGraduationCap, FaHome, FaMapMarkerAlt, FaHeart, FaRegCalendarAlt, FaRegComment } from 'react-icons/fa';
import { Select, DatePicker, Drawer, Button, message } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import { getUserPosts, likePost, addComment, deletePost, editPost } from '../../../store/slices/postSlice';
import { fetchFriends, sendFriendRequest, unfriendUser, fetchSentRequests, fetchRequests, respondToRequest, cancelFriendRequest } from '../../../store/slices/friendSlice';
import { HeartOutlined, HeartFilled, EllipsisOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Modal, Input } from 'antd';
import EditPostModal from '../../../components/EditPostModal';
import { useParams, useRouter } from 'next/navigation';

const DynamicProfilePage = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const viewedUserId = params.userId;
  const router = useRouter();

  const loggedInUser = useSelector(state => state.auth.user);
  const profile = useSelector(state => state.auth.viewedProfile);
  const loading = useSelector(state => state.auth.viewedProfileLoading);
  const friends = useSelector(state => state.friends.friends);
  const sentRequests = useSelector(state => state.friends.sentRequests);
  const incomingRequests = useSelector(state => state.friends.requests);

  const postsState = useSelector(state => state.posts || {});
  const posts = postsState.posts || [];
  const postsLoading = postsState.loading || false;

  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({ fullName: '', username: '', bio: '', avatarImg: '', coverImg: '', age: '', address: '', country: '', gender: '', study: '', dob: '' });
  const isOwnProfile = loggedInUser?.userId === viewedUserId;
  const [modalType, setModalType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const friendList = Array.isArray(profile?.friends) ? profile.friends : [];
  const friendCount = profile?.friendCount || 0;

  const isFriend = friends.some(friend => friend._id === viewedUserId);
  const sentRequest = sentRequests.find(req => req.to._id === viewedUserId);
  const isRequested = !!sentRequest;
  const receivedRequest = incomingRequests.find(req => req.from._id === viewedUserId);
  const isReceivedRequest = !!receivedRequest;

  const [commentInput, setCommentInput] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const commentsRefs = useRef({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const [addFriendLoading, setAddFriendLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetPostId, setDeleteTargetPostId] = useState(null);

  const openDeleteModal = (postId) => {
    setDeleteTargetPostId(postId);
    setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTargetPostId(null);
  };
  const handleDeleteConfirm = async () => {
    if (!deleteTargetPostId) return;
    setDeleteLoading(true);
    try {
      await dispatch(deletePost(deleteTargetPostId)).unwrap();
      messageApi.success('Post deleted successfully!');
      closeDeleteModal();
    } catch (err) {
      messageApi.error(err?.message || 'Failed to delete post');
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchFriends());
    dispatch(fetchSentRequests());
    dispatch(fetchRequests());
  }, [dispatch]);

  useEffect(() => {
    if (viewedUserId) {
      dispatch(getProfile({ id: viewedUserId }));
      dispatch(getUserPosts(viewedUserId));
    }
  }, [viewedUserId, dispatch]);

  useEffect(() => {
    if (profile) {
      setEditData({
        fullName: profile.fullName || '',
        username: profile.username || '',
        bio: profile.bio || '',
        avatarImg: profile.avatarImg || '',
        coverImg: profile.coverImg || '',
        age: profile.age || '',
        address: profile.address || '',
        country: profile.country || '',
        gender: profile.gender || '',
        study: profile.study || '',
        dob: profile.dob ? dayjs(profile.dob) : null,
      });
    }
  }, [profile]);

  const handleEditChange = (e) => {
    if (e && e.target) {
      const { name, value, files, type } = e.target;
      if (files) {
        setEditData(prev => ({
          ...prev,
          [name]: files[0],
          [`${name}Preview`]: URL.createObjectURL(files[0])
        }));
      } else {
        setEditData(prev => ({
          ...prev,
          [name]: type === 'number' ? Number(value) : value
        }));
      }
    }
  };
  const handleSelectChange = (value, name) => {
    setEditData(prev => ({ ...prev, [name]: value }));
  };
  const handleDateChange = (date) => {
    setEditData(prev => ({ ...prev, dob: date }));
  };

  const [formSubmitting, setFormSubmitting] = useState(false);

  const handleEditSave = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    let avatarUrl = profile.avatarImg;
    let coverUrl = profile.coverImg;

    try {
      if (editData.avatarImg instanceof File) {
        avatarUrl = await dispatch(uploadAvatar(editData.avatarImg)).unwrap();
      }
      if (editData.coverImg instanceof File) {
        coverUrl = await dispatch(uploadCover(editData.coverImg)).unwrap();
      }
      await dispatch(updateProfile({
        id: viewedUserId,
        fullName: editData.fullName,
        username: editData.username,
        bio: editData.bio,
        avatarImg: avatarUrl,
        coverImg: coverUrl,
        age: editData.age,
        address: editData.address,
        country: editData.country,
        gender: editData.gender,
        study: editData.study,
        dob: editData.dob ? editData.dob.toISOString() : '',
      })).unwrap();
      await dispatch(getProfile({ id: viewedUserId }));
      setShowEdit(false);
      messageApi.success('Profile updated successfully!');
    } catch (err) {
      messageApi.error(err?.message || 'Failed to update profile');
    } finally {
      setFormSubmitting(false);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setSearchTerm('');
  };
  const closeModal = () => {
    setModalType(null);
    setSearchTerm('');
  };

  const modalList = friendList;
  const filteredList = modalList.filter(u =>
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLike = (postId) => {
    if (loggedInUser?.userId) {
      dispatch(likePost(postId))
        .unwrap()
        .then(() => messageApi.success('Post action successful!'))
        .catch(err => messageApi.error(err?.message || 'Failed to perform action'));
    }
  };

  const handleAddComment = (postId, comment) => {
    if (comment && comment.trim()) {
      dispatch(addComment({ postId, comment, user: loggedInUser }))
        .unwrap()
        .then(() => messageApi.success('Comment added!'))
        .catch(err => messageApi.error(err?.message || 'Failed to add comment'));
      setCommentInput(prev => ({ ...prev, [postId]: '' }));
    }
  };

  const handleToggleComments = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  useEffect(() => {
    function handleClickOutside(event) {
      Object.keys(expandedComments).forEach(postId => {
        if (expandedComments[postId]) {
          const ref = commentsRefs.current[postId];
          if (ref && !ref.contains(event.target)) {
            setExpandedComments(prev => ({ ...prev, [postId]: false }));
          }
        }
      });
    }
    if (Object.values(expandedComments).some(Boolean)) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedComments]);

  const handleEdit = (post) => {
    setEditingPost(post);
    setEditModalOpen(true);
  };
  const handleEditSubmit = async (data) => {
    setEditLoading(true);
    setEditError(null);
    try {
      await dispatch(editPost(data)).unwrap();
      setEditModalOpen(false);
      messageApi.success('Post updated successfully!');
    } catch (err) {
      setEditError(err?.message || String(err));
      messageApi.error(err?.message || 'Failed to update post');
    } finally {
      setEditLoading(false);
    }
  };

  const menu = (post) => ({
    items: [
      {
        key: 'edit',
        label: 'Edit Post',
        onClick: () => handleEdit(post),
      },
      {
        key: 'delete',
        label: <span style={{ color: 'red' }}>Delete Post</span>,
        onClick: () => openDeleteModal(post._id),
      },
    ],
  });

  function formatCommentTime(createdAt) {
    if (!createdAt) return '';
    const now = Date.now();
    const diffMs = now - new Date(createdAt).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin <= 0 ? 1 : diffMin} min`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''}`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay} day${diffDay > 1 ? 's' : ''}`;
  }

  const handleFollowAction = () => {
    messageApi.info("Follow functionality not yet implemented.");
  };

  const handleMessage = () => {
    router.push(`/chat?user=${viewedUserId}`);
  };

  const handleRemoveFriend = async () => {
    try {
      await dispatch(unfriendUser(viewedUserId)).unwrap();
      messageApi.success('Friend removed successfully.');
      dispatch(fetchFriends());
    } catch (err) {
      messageApi.error(err?.message || 'Failed to remove friend.');
    }
  };

  const handleAddFriend = async () => {
    setAddFriendLoading(true);
    try {
      await dispatch(sendFriendRequest(viewedUserId)).unwrap();
      messageApi.success('Friend request sent.', 2.5);
      dispatch(fetchSentRequests());
    } catch (err) {
      messageApi.error(err?.message || 'Failed to send friend request.', 2.5);
    } finally {
      setAddFriendLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!receivedRequest) return;
    try {
      await dispatch(respondToRequest({ requestId: receivedRequest._id, action: 'accept' })).unwrap();
      messageApi.success('Friend request accepted.');
      dispatch(fetchFriends());
      dispatch(fetchSentRequests());
      dispatch(fetchRequests());
    } catch (err) {
      messageApi.error(err?.message || 'Failed to accept request.');
    }
  };
  const handleRejectRequest = async () => {
    if (!receivedRequest) return;
    try {
      await dispatch(respondToRequest({ requestId: receivedRequest._id, action: 'reject' })).unwrap();
      messageApi.success('Friend request rejected.');
      dispatch(fetchFriends());
      dispatch(fetchSentRequests());
      dispatch(fetchRequests());
    } catch (err) {
      messageApi.error(err?.message || 'Failed to reject request.');
    }
  };
  const handleCancelRequest = async () => {
    if (!sentRequest) return;
    try {
      await dispatch(cancelFriendRequest(sentRequest._id)).unwrap();
      messageApi.success('Friend request canceled.');
      dispatch(fetchFriends());
      dispatch(fetchSentRequests());
      dispatch(fetchRequests());
    } catch (err) {
      messageApi.error(err?.message || 'Failed to cancel request.');
    }
  };

  const notifications = useSelector(state => state.notifications.items);
  const lastNotif = notifications.find(n => n.from && n.from._id === viewedUserId && (n.type === 'request_accepted' || n.type === 'request_rejected'));
  const notifText = lastNotif ? (lastNotif.type === 'request_accepted' ? 'Accepted' : 'Rejected') : null;
  const canAddFriend = !isRequested || (lastNotif && lastNotif.type === 'request_rejected');

  return (
    <>
      {contextHolder}
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', minHeight: '100vh', background: '#fafbfc' }}>
        <div style={{ width: 220, flex: '0 0 220px' }}>
          <Sidenav />
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '32px 0 0 0', minHeight: '100vh' }}>
          <div className="profilePage">
            {loading || !profile ? (
              <div className="profileLoading">Loading...</div>
            ) : (
              <>
                <div className="profileCoverWrapper">
                  {profile.coverImg ? (
                    <Image src={profile.coverImg} alt="cover" fill className="profileCoverImg" />
                  ) : (
                    <div className="profileCoverImg" style={{ background: '#e4e6eb', width: '100%', height: '100%' }} />
                  )}
                  <div className="profileAvatarWrapper">
                    <Image 
                      src={profile.avatarImg || '/login.jpeg'} 
                      alt="avatar" 
                      width={120} 
                      height={120} 
                      className="profileAvatar" 
                      style={{ cursor: isOwnProfile ? 'pointer' : 'default' }} 
                    />
                  </div>
                </div>

                <div className="profileInfoSection">
                  <div className="profileMainInfo">
                    <div>
                      <div className="profileName">{profile.fullName || 'User'}</div>
                      <div className="profileUsername">@{profile.username || 'username'}</div>
                    </div>
                    <div>
                      {isOwnProfile ? (
                        <button className="editProfileBtn" onClick={() => setShowEdit(true)}>
                          <FaPencilAlt style={{ marginRight: 6, marginBottom: -2 }} /> Edit Profile
                        </button>
                      ) : isFriend ? (
                        <>
                          <button className="messageBtn" onClick={handleMessage}>Message</button>
                          <button className="removeFriendBtn" onClick={handleRemoveFriend} style={{marginLeft: '8px'}}>Remove Friend</button>
                        </>
                      ) : isReceivedRequest ? (
                        <>
                          <button className="acceptFriendBtn" onClick={handleAcceptRequest}>Accept</button>
                          <button className="rejectFriendBtn" onClick={handleRejectRequest} style={{marginLeft: '8px'}}>Reject</button>
                        </>
                      ) : isRequested ? (
                        <>
                          <button className="requestedBtn" disabled>Requested</button>
                          <button className="cancelRequestBtn" onClick={handleCancelRequest} style={{marginLeft: '8px'}}>Cancel Request</button>
                        </>
                      ) : (
                        <button 
                          className="addFriendBtn"
                          onClick={handleAddFriend}
                          disabled={addFriendLoading}
                        >
                          {addFriendLoading ? 'Sending...' : 'Add Friend'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="profileStatsBar">
                    <div className="profileStat"><span>{posts.length}</span> Posts</div>
                    <div className="profileStat clickable" onClick={() => openModal('friends')}>
                      <span>{friendCount}</span> Friends
                    </div>
                  </div>
                </div>

                <div className="profileMainTwoCol">
                  <div className="profileLeftCol">
                    <div className="profileInfoCard theme">
                      <div className="profileInfoTitle">Intro</div>
                      <div className="profileInfoBio">{profile.bio || 'No bio'}</div>
                      <hr />
                      <div className="profileInfoItem"> <FaMapMarkerAlt style={{color: '#040d5b'}} />: {profile.country || 'N/A'}</div>
                      <div className="profileInfoItem"><FaHome style={{color: '#040d5b'}} />: {profile.address || 'N/A'}</div>
                      <div className="profileInfoItem"><FaGraduationCap style={{color: '#040d5b'}} />: {profile.study || 'N/A'}</div>
                      <div className="profileInfoItem"><FaRegCalendarAlt style={{color: '#040d5b'}} />: {profile.dob ? dayjs(profile.dob).format('YYYY-MM-DD') : 'N/A'}</div>
                    </div>
                  </div>

                  <div className="profileRightCol">
                    <div className="profilePostsCard">
                      <div className="profilePostsGrid">
                        {postsLoading ? (
                          <div className="noPostsMsg">Loading posts...</div>
                        ) : posts && posts.length > 0 ? (
                          posts.map(post => {
                            const isLiked = post.likes && post.likes.some(like => like.user === loggedInUser?.userId || (like.user && like.user._id === loggedInUser?.userId));
                            const isOwnPost = post.user && (post.user._id === loggedInUser?.userId || post.user === loggedInUser?.userId);
                            return (
                              <div key={post._id} className="profilePostCard1">
                                <div style={{ position: 'relative' }}>
                                  <img src={post.image} alt="post" className="profilePostImg" />
                                  {isOwnPost && (
                                    <Dropdown menu={menu(post)} trigger={['click']} placement="bottomRight">
                                      <EllipsisOutlined style={{ position: 'absolute', top: 12, right: 12, fontSize: 24, color: 'var(--text)', cursor: 'pointer', background: 'var(--card)', borderRadius: '50%', padding: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }} />
                                    </Dropdown>
                                  )}
                                </div>
                                <div className="profilePostContent">
                                  <p className="profilePostCaption">{post.caption}</p>
                                  <div className="profilePostActions">
                                    <span className={`profilePostAction likeBtn${isLiked ? ' liked' : ''}`} onClick={() => handleLike(post._id)}>
                                      {isLiked ? <HeartFilled style={{ marginRight: 4, color: '#1877f2' }} /> : <HeartOutlined style={{ marginRight: 4, color: '#444' }} />}
                                      {post.likes ? post.likes.length : 0}
                                    </span>
                                    <span className="profilePostAction profilePostComment" style={{ cursor: 'pointer' }} onClick={() => handleToggleComments(post._id)}>
                                      <FaRegComment style={{ marginRight: 4 }} />
                                      {post.comments ? post.comments.length : 0}
                                    </span>
                                    <span className="profilePostDate">
                                      {dayjs(post.createdAt).fromNow()}
                                    </span>
                                  </div>
                                  {expandedComments[post._id] && (
                                    <div className="profileCommentsSection" ref={el => (commentsRefs.current[post._id] = el)}>
                                      <div style={{ fontWeight: 'bold', marginBottom: 6 }}>Comments</div>
                                      {post.comments && post.comments.length > 0 ? (
                                        post.comments.map((c, idx) => (
                                          <div key={idx} className="profileCommentRow">
                                            <img src={c.user?.avatarImg || '/login.jpeg'} alt="avatar" className="profileCommentAvatar" />
                                            <div className="profileCommentBody">
                                              <div className="profileCommentHeader">
                                                <span className="profileCommentUser">{c.user?.username || 'User'}</span>
                                                <span className="profileCommentTime">{c.createdAt ? formatCommentTime(c.createdAt) : ''}</span>
                                              </div>
                                              <div className="profileCommentText">{c.comment}</div>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <div style={{ color: '#888', marginBottom: 12 }}>No comments yet.</div>
                                      )}
                                      <form className="profileCommentForm" onSubmit={e => { e.preventDefault(); handleAddComment(post._id, commentInput[post._id] || ''); }}>
                                        <input type="text" value={commentInput[post._id] || ''} onChange={e => setCommentInput({ ...commentInput, [post._id]: e.target.value })} placeholder="Write a comment..." className="profileCommentInput" style={{ flex: 1 }} />
                                        {(commentInput[post._id] && commentInput[post._id].trim()) && (
                                          <button type="submit" className="profileCommentBtn">Post</button>
                                        )}
                                      </form>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="noPostsMsg">No posts yet</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <EditPostModal
                  open={editModalOpen}
                  onClose={() => setEditModalOpen(false)}
                  post={editingPost}
                  onSave={handleEditSubmit}
                  loading={editLoading}
                  error={editError}
                />

                {showEdit && (
                  <Drawer
                    title="Edit Profile"
                    placement="right"
                    onClose={() => setShowEdit(false)}
                    open={showEdit}
                    width={700}
                    bodyStyle={{ padding: 24 }}
                    footer={
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <Button 
                          onClick={() => setShowEdit(false)} 
                          style={{ minWidth: 90 }} 
                          className='cancel-drawer'
                          disabled={formSubmitting}
                        >
                          {formSubmitting ? 'Please wait...' : 'Cancel'}
                        </Button>
                        <Button 
                          type="primary" 
                          htmlType="submit" 
                          form="editProfileForm" 
                          style={{ minWidth: 90 }} 
                          loading={formSubmitting}
                          disabled={formSubmitting}
                        >
                          {formSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    }
                  >
                    <form id="editProfileForm" className="editProfileModal" onSubmit={handleEditSave} autoComplete="off" style={{ boxShadow: 'none', border: 'none', padding: 0, background: 'transparent' }}>
                      <div className="editProfileAvatarRow">
                        <label className="editProfileAvatarLabel">
                          <span>Cover Image</span>
                          <input type="file" name="coverImg" accept="image/*" onChange={handleEditChange} />
                          {editData.coverImgPreview && <img src={editData.coverImgPreview} alt="cover preview" className="profileEditCoverPreview" />}
                        </label>
                        <label className="editProfileAvatarLabel">
                          <span>Avatar Profile Image</span>
                          <input type="file" name="avatarImg" accept="image/*" onChange={handleEditChange} />
                          {editData.avatarImgPreview && <img src={editData.avatarImgPreview} alt="avatar preview" className="profileEditAvatarPreview" />}
                        </label>
                      </div>
                      <div className="editProfileFieldsGrid">
                        <div className="inputGroup">
                          <input type="text" name="fullName" value={editData.fullName} onChange={handleEditChange} required placeholder=" " />
                          <label>Name</label>
                        </div>
                        <div className="inputGroup">
                          <input type="text" name="username" value={editData.username} onChange={handleEditChange} required placeholder=" " />
                          <label>Username</label>
                        </div>
                        <div className="inputGroup">
                          <input type="number" name="age" value={editData.age || ''} onChange={handleEditChange} min="1" max="120" required placeholder=" " />
                          <label>Age</label>
                        </div>
                        <div className="inputGroup">
                          <input type="text" name="country" value={editData.country || ''} onChange={handleEditChange} required placeholder=" " />
                          <label>Country</label>
                        </div>
                        <div className="inputGroup">
                          <input type="text" name="address" value={editData.address || ''} onChange={handleEditChange} required placeholder=" " />
                          <label>Address</label>
                        </div>
                        <div className="inputGroup">
                          <input type="text" name="study" value={editData.study} onChange={handleEditChange} required placeholder=" " />
                          <label>Qalification</label>
                        </div>
                        <div className="inputGroup">
                        <DatePicker
                          value={editData.dob}
                          onChange={handleDateChange}
                          format="YYYY-MM-DD"
                          suffixIcon={<FaRegCalendarAlt />} // Inline style remove
                        />
                        <label>Date of Birth</label>
                      </div>
                      </div>
                      <div className="inputGroup textareaGroup">
                        <textarea name="bio" value={editData.bio} onChange={handleEditChange} rows={2} required placeholder=" " maxLength={40} />
                        <label>Bio</label>
                      </div>
                      <div className="bioCharCount">{editData.bio.length}/40</div>
                    </form>
                  </Drawer>
                )}

                {modalType && (
                  <div className="followersModalBg" onClick={closeModal}>
                    <div className="followersModal" onClick={e => e.stopPropagation()}>
                      <div className="followersModalHeader">
                        <span>Friends</span>
                        <button className="closeModalBtn" onClick={closeModal}>×</button>
                      </div>
                      <input
                        className="followersSearchInput"
                        type="text"
                        placeholder="Search friends..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                      <div className="followersList">
                        {filteredList.length === 0 ? (
                          <div className="noFollowers">No friends found.</div>
                        ) : (
                          filteredList.map(u => (
                            <div key={u._id} className="followerRow">
                              <Link href={`/profile/${u._id}`}>
                                <img src={u.avatarImg || '/login.jpeg'} alt="avatar" className="followerAvatar" />
                              </Link>
                              <div className="followerInfo">
                                <Link href={`/profile/${u._id}`} style={{ textDecoration: 'none' }}>
                                  <div className="followerName">{u.fullName}</div>
                                  <div className="followerUsername">@{u.username}</div>
                                </Link>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {deleteModalOpen && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            <h3>Are you sure you want to delete this post?</h3>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
              <Button onClick={closeDeleteModal} disabled={deleteLoading}>No</Button>
              <Button type="primary" danger onClick={handleDeleteConfirm} loading={deleteLoading}>Yes, Delete</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DynamicProfilePage;