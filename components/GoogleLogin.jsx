import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { googleLogin } from '../store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';

const GoogleLogin = ({ onSuccess, onError }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    // Initialize Google OAuth
    if (typeof window !== 'undefined' && window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin
      });
    }
  }, []);

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      await dispatch(googleLogin(credentialResponse.credential)).unwrap();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('Google login error:', err);
      if (onError) {
        onError('Google login failed');
      }
    }
  };

  const triggerGoogleLogin = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt();
    } else {
      if (onError) {
        onError('Google OAuth not available');
      }
    }
  };

  return (
    <button
      onClick={triggerGoogleLogin}
      style={{
        width: '100%',
        padding: '12px',
        backgroundColor: '#fff',
        color: '#333',
        border: '1px solid #dadce0',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#f8f9fa';
        e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = '#fff';
        e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
      }}
    >
      <FcGoogle size={20} />
      Continue with Google
    </button>
  );
};

export default GoogleLogin; 