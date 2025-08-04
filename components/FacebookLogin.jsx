import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { facebookLogin } from '../store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { FaFacebook } from 'react-icons/fa';

const FacebookLogin = ({ onSuccess, onError }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState(null);

  useEffect(() => {
    // Check if Facebook SDK is available
    const checkFacebookSDK = () => {
      if (typeof window !== 'undefined') {
        if (window.FB) {
          console.log('Facebook SDK found, initializing...');
          
          // Check if we have the App ID
          const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
          if (!appId) {
            setSdkError('Facebook App ID not configured');
            console.error('NEXT_PUBLIC_FACEBOOK_APP_ID is not set');
            return;
          }

          window.FB.init({
            appId: appId,
            cookie: true,
            xfbml: true,
            version: 'v18.0',
            status: true
          });
          
          console.log('Facebook SDK initialized with App ID:', appId);
          setSdkLoaded(true);
        } else {
          // Wait a bit more for the SDK to load
          setTimeout(() => {
            if (window.FB) {
              checkFacebookSDK();
            } else {
              setSdkError('Facebook SDK failed to load');
              console.error('Facebook SDK not available after timeout');
            }
          }, 2000);
        }
      }
    };

    // Start checking for Facebook SDK
    checkFacebookSDK();
  }, []);

  const handleFacebookLogin = () => {
    if (!sdkLoaded) {
      if (onError) {
        onError('Facebook SDK not loaded. Please refresh the page and try again.');
      }
      return;
    }

    if (typeof window !== 'undefined' && window.FB) {
      console.log('Starting Facebook login...');
      
      window.FB.login((response) => {
        console.log('Facebook login response:', response);
        
        if (response.authResponse) {
          // User successfully logged in
          const accessToken = response.authResponse.accessToken;
          console.log('Access token received:', accessToken ? 'Yes' : 'No');
          console.log('Granted scopes:', response.authResponse.grantedScopes);
          
          // Check if we have the required permissions
          if (response.authResponse.grantedScopes && 
              response.authResponse.grantedScopes.includes('email')) {
            
            console.log('Email permission granted, proceeding with login...');
            
            dispatch(facebookLogin(accessToken))
              .unwrap()
              .then((userData) => {
                console.log('Facebook login successful:', userData);
                if (onSuccess) {
                  onSuccess(userData);
                } else {
                  router.push('/');
                }
              })
              .catch((error) => {
                console.error('Facebook login error:', error);
                if (onError) {
                  onError(error);
                }
              });
          } else {
            // User didn't grant email permission
            console.error('Email permission not granted');
            if (onError) {
              onError('Email permission is required for login. Please try again and grant email access.');
            }
          }
        } else {
          // User cancelled login or did not fully authorize
          console.log('Facebook login cancelled or permissions denied');
          if (onError) {
            onError('Facebook login was cancelled or permissions were denied');
          }
        }
      }, {
        scope: 'email,public_profile',
        return_scopes: true
      });
    } else {
      console.error('Facebook SDK not loaded');
      if (onError) {
        onError('Facebook SDK not loaded. Please refresh the page and try again.');
      }
    }
  };

  // Show error state if SDK failed to load
  if (sdkError) {
    return (
      <button
        disabled
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#ccc',
          color: '#666',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: 0.5
        }}
      >
        <FaFacebook size={20} />
        Facebook Login Unavailable
      </button>
    );
  }

  return (
    <button
      onClick={handleFacebookLogin}
      disabled={loading || !sdkLoaded}
      style={{
        width: '100%',
        padding: '12px',
        backgroundColor: sdkLoaded ? '#1877f2' : '#ccc',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: (loading || !sdkLoaded) ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        opacity: (loading || !sdkLoaded) ? 0.7 : 1,
        transition: 'background-color 0.2s ease'
      }}
      onMouseEnter={(e) => {
        if (!loading && sdkLoaded) {
          e.target.style.backgroundColor = '#166fe5';
        }
      }}
      onMouseLeave={(e) => {
        if (!loading && sdkLoaded) {
          e.target.style.backgroundColor = '#1877f2';
        }
      }}
    >
      <FaFacebook size={20} />
      {loading ? 'Logging in...' : !sdkLoaded ? 'Loading Facebook...' : 'Continue with Facebook'}
    </button>
  );
};

export default FacebookLogin; 