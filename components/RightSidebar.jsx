"use client";

import "./RightSidebar.scss";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchRequests,
  respondToRequest,
  fetchAllUsers,
  sendFriendRequest,
  fetchFriends,
  fetchSentRequests,
  removeRequest,
} from "../store/slices/friendSlice";
import { message as antdMessage } from "antd";

export default function RightSidebar() {
  const dispatch = useDispatch();
  const { requests, users, friends, sentRequests, loading: generalLoading } = useSelector(
    (state) => state.friends
  );
  const loggedInUser = useSelector((state) => state.auth.user);
  const notifications = useSelector((state) => state.notifications.items);
  const [loadingStates, setLoadingStates] = useState({});
  const [messageApi, contextHolder] = antdMessage.useMessage();

  useEffect(() => {
    dispatch(fetchRequests());
    dispatch(fetchAllUsers());
    dispatch(fetchFriends());
    dispatch(fetchSentRequests());
  }, [dispatch]);

  const handleRespondRequest = async (requestId, action) => {
    setLoadingStates((prev) => ({ ...prev, [requestId]: true }));
    dispatch(removeRequest(requestId));
    try {
      await dispatch(respondToRequest({ requestId, action })).unwrap();
      let statusMsg = "";
      if (action === "accept" || action === "accepted") {
        statusMsg = "Friend request accepted!";
      } else if (action === "reject" || action === "rejected") {
        statusMsg = "Friend request declined!";
      } else {
        statusMsg = "Request updated!";
      }
      messageApi.success(statusMsg, 2.5);
      if (action === "accept") {
        dispatch(fetchFriends());
        dispatch(fetchAllUsers());
        dispatch(fetchSentRequests());
        dispatch(fetchRequests());
      }
    } catch (err) {
      console.error("Respond to request error:", err);
      messageApi.error(err?.message || "Failed to respond to request", 2.5);
      dispatch(fetchRequests());
    } finally {
      setLoadingStates((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleAddFriend = async (userId) => {
    setLoadingStates((prev) => ({ ...prev, [userId]: true }));
    try {
      await dispatch(sendFriendRequest(userId)).unwrap();
      messageApi.success("Friend request sent!", 2.5);
      dispatch(fetchSentRequests());
    } catch (err) {
      messageApi.error(err?.message || "Failed to send request", 2.5);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Create a set of friend IDs and request IDs for quick lookup (as strings)
  const friendIds = new Set(friends.map((f) => String(f._id)));
  const sentRequestIds = new Set(sentRequests.map((req) => String(req.to._id)));
  const pendingRequestIds = new Set(requests.map((req) => String(req.from._id)));

  // Filter out the logged-in user, existing friends, and users with pending/accepted requests from suggestions
  const suggestions = users.filter((user) =>
    String(user._id) !== String(loggedInUser?.userId) &&
    !friendIds.has(String(user._id)) &&
    !sentRequestIds.has(String(user._id)) &&
    !pendingRequestIds.has(String(user._id))
  );

  return (
    <>
      {contextHolder}
      <div className="right-sidebar">
        <h3 className="section-title">Friend Requests</h3>
        {generalLoading && requests.length === 0 && <p>Loading requests...</p>}
        {!generalLoading && requests.length === 0 && (
          <p className="no-data-msg">No new requests</p>
        )}
        {requests.map((req) => (
          <div key={req._id} className="friend-request">
            <Link href={`/profile/${req.from?._id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <Image
                src={req.from?.avatarImg || "/login.jpeg"}
                alt={req.from?.fullName || "User"}
                width={40}
                height={40}
                className="avatar"
              />
            </Link>
            <div className="friend-info">
              <Link
                href={`/profile/${req.from?._id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="friend-name">{req.from?.username || "User"}</span>
              </Link>
              <div className="friend-actions">
                <button
                  className="confirm"
                  onClick={() => handleRespondRequest(req._id, "accept")}
                >
                  Confirm
                </button>
                <button
                  className="delete"
                  onClick={() => handleRespondRequest(req._id, "reject")}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        <h3 className="section-title">Suggestions</h3>
        {generalLoading && suggestions.length === 0 && <p>Loading suggestions...</p>}
        {!generalLoading && suggestions.length === 0 && (
          <p className="no-data-msg">No new suggestions</p>
        )}
        {suggestions.slice(0, 5).map((user) => {
          const isRequested = sentRequestIds.has(String(user._id));
          const isLoading = loadingStates[String(user._id)];
          // Find the last notification for this user
          const lastNotif = notifications.find(
            (n) =>
              n.from && n.from._id === user._id && (n.type === "request_accepted" || n.type === "request_rejected")
          );
          const notifText = lastNotif
            ? lastNotif.type === "request_accepted"
              ? "Accepted"
              : "Rejected"
            : null;
          // Allow re-sending if last notification was 'request_rejected'
          const canAddFriend = !isRequested || (lastNotif && lastNotif.type === "request_rejected");
          return (
            <div key={user._id} className="add-friend">
              <Link href={`/profile/${user._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <Image
                  src={user.avatarImg || "/login.jpeg"}
                  alt={user.fullName || user.username || "User"}
                  width={40}
                  height={40}
                  className="avatar"
                />
              </Link>
              <div className="friend-info">
                <Link
                  href={`/profile/${user._id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span className="friend-name">{user.username || "User"}</span>
                </Link>
                <div className="friend-actions">
                  <button
                    className="confirm"
                    onClick={() => canAddFriend && handleAddFriend(user._id)}
                    disabled={isLoading || !canAddFriend}
                  >
                    {isLoading
                      ? "Sending..."
                      : canAddFriend
                      ? "Add Friend"
                      : notifText
                      ? notifText
                      : "Requested"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}