"use client";

import './Feed.scss';
import { useState, useRef, useEffect } from 'react';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { message } from 'antd';  // Add this import
import "./Feed.scss";
import { useSelector, useDispatch } from 'react-redux';
import { getPosts, likePost, addComment } from '../store/slices/postSlice';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import { FaRegComment } from 'react-icons/fa';
import Link from 'next/link';

const Feed = () => {
  const dispatch = useDispatch();
  const postsState = useSelector(state => state.posts || {});
  const posts = postsState.posts || [];
  const loading = postsState.loading;
  console.log('Feed posts:', posts);
  const [commentInput, setCommentInput] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const commentsRefs = useRef({});
  const [userId, setUserId] = useState(null);
  const [sortBy, setSortBy] = useState('trending'); // Add this state
  const user = useSelector(state => state.auth.user); // <-- Add this line
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    dispatch(getPosts());
    if (typeof window !== 'undefined') {
      const localUser = JSON.parse(localStorage.getItem('user'));
      setUserId(localUser?.userId);
    }
  }, [dispatch]);

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

  const handleLike = (postId) => {
    if (userId) {
      dispatch(likePost(postId))
        .unwrap()
        .then(() => {
          messageApi.success('Post liked successfully!');
        })
        .catch((err) => {
          messageApi.error(err?.message || 'Failed to like post');
        });
    }
  };

  const handleAddComment = (postId, comment) => {
    if (comment && comment.trim()) {
      dispatch(addComment({ postId, comment, user }))
        .unwrap()
        .then(() => {
          messageApi.success('Comment added successfully!');
          setCommentInput(prev => ({ ...prev, [postId]: '' }));
        })
        .catch((err) => {
          messageApi.error(err?.message || 'Failed to add comment');
        });
    }
  };

  const handleToggleComments = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Add this function to sort posts
  const getSortedPosts = () => {
    if (!posts) return [];
    
    if (sortBy === 'trending') {
      return [...posts].sort((a, b) => {
        const aEngagement = (a.likes?.length || 0) + (a.comments?.length || 0);
        const bEngagement = (b.likes?.length || 0) + (b.comments?.length || 0);
        return bEngagement - aEngagement;
      });
    }
    // Default: return by date (recent)
    return [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

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
  return (
    <>
      {contextHolder}
      <div className="feedContainer">
        <div className="feedControls">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="feedSortSelect"
          >
            <option value="recent">Most Recent</option>
            <option value="trending">Trending</option>
          </select>
        </div>

        {loading ? (
          <div className="noPostsMsg">Loading posts...</div>
        ) : posts && posts.length > 0 ? (
          getSortedPosts().map(post => {
            const isLiked = post.likes && post.likes.some(like => like.user === userId || (like.user && like.user._id === userId));
            return (
              <div className="feedPostCard" key={post._id}>
                <div className="feedPostHeader">
                  <Link href={`/profile/${post.user?._id || ''}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                  <img src={post.user?.avatarImg || '/login.jpeg'} alt="avatar" className="feedPostAvatar" />
                    <span className="feedPostUser" style={{ color: 'var(--primary)', marginLeft: 8 }}>{post.user?.username || 'User'}</span>
                  </Link>
                  <span className="feedPostDate">{dayjs(post.createdAt).fromNow()}</span>
                  </div>
                <img src={post.image} alt="post" className="feedPostImg" />
                <div className="feedPostContent">
                  <p className="feedPostCaption">{post.caption}</p>
                  <div className="feedPostActions">
                    <span
                      className={`feedPostAction feedLikeBtn${isLiked ? ' liked' : ''}`}
                      onClick={() => handleLike(post._id)}
                      role="button"
                      aria-label={isLiked ? 'Unlike' : 'Like'}
                      tabIndex={0}
                      onKeyPress={e => { if (e.key === 'Enter') handleLike(post._id); }}
                    >
                      {isLiked ? (
                        <HeartFilled style={{ marginRight: 4, color: 'var(--primary)' }} />
                      ) : (
                        <HeartOutlined style={{ marginRight: 4, color: '#444' }} />
                      )}
                      {post.likes ? post.likes.length : 0}
                    </span>
                    <span
                      className="feedPostAction feedPostComment"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleToggleComments(post._id)}
                    >
                      <FaRegComment style={{ marginRight: 4 }} />
                      {post.comments ? post.comments.length : 0}
                    </span>
                  </div>
                  {/* Comments Section Expand/Collapse */}
                  {expandedComments[post._id] && (
                    <div className="feedCommentsSection" ref={el => (commentsRefs.current[post._id] = el)}>
                      <div className="feedCommentsTitle">Comments</div>
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map((c, idx) => (
                          <div key={idx} className="feedCommentRow">
                            <img
                              src={c.user?.avatarImg ? c.user.avatarImg : '/login.jpeg'}
                              alt="avatar"
                              className="feedCommentAvatar"
                            />
                            <div className="feedCommentBody">
                              <div className="feedCommentHeader">
                                <span className="feedCommentUser">
                                  {c.user?.username ? c.user.username : 'User'}
                                </span>
                            
                                <span className="feedCommentTime">{c.createdAt ? formatCommentTime(c.createdAt) : ''}</span>
                              </div>
                              <div className="feedCommentText">{c.comment}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="feedNoComments">No comments yet.</div>
                      )}
                      {/* Comment Input */}
                      <form
                        className="feedCommentForm"
                        onSubmit={e => {
                          e.preventDefault();
                          handleAddComment(post._id, commentInput[post._id] || '');
                        }}
                      >
                        <input
                          type="text"
                          value={commentInput[post._id] || ''}
                          onChange={e => setCommentInput({ ...commentInput, [post._id]: e.target.value })}
                          placeholder="Write a comment..."
                          className="feedCommentInput"
                        />
                        {(commentInput[post._id] && commentInput[post._id].trim()) && (
                          <button type="submit" className="feedCommentBtn">Post</button>
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
    </>
  );
};

export default Feed;