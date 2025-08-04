import React, { useEffect, useState } from 'react';

const FacebookDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    sdkLoaded: false,
    appId: null,
    fbObject: false,
    errors: []
  });

  useEffect(() => {
    const checkFacebookSDK = () => {
      const info = {
        sdkLoaded: false,
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        fbObject: false,
        errors: []
      };

      // Check if FB object exists
      if (typeof window !== 'undefined' && window.FB) {
        info.fbObject = true;
        info.sdkLoaded = true;
      } else {
        info.errors.push('Facebook SDK not loaded');
      }

      // Check if App ID is set
      if (!info.appId) {
        info.errors.push('NEXT_PUBLIC_FACEBOOK_APP_ID not set');
      }

      setDebugInfo(info);
    };

    // Check immediately
    checkFacebookSDK();

    // Check again after a delay
    setTimeout(checkFacebookSDK, 3000);
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show debug info in production
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#f0f0f0',
      border: '1px solid #ccc',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Facebook Debug Info</h4>
      <div>
        <strong>SDK Loaded:</strong> {debugInfo.sdkLoaded ? '✅ Yes' : '❌ No'}<br/>
        <strong>FB Object:</strong> {debugInfo.fbObject ? '✅ Yes' : '❌ No'}<br/>
        <strong>App ID:</strong> {debugInfo.appId ? '✅ Set' : '❌ Not Set'}<br/>
        {debugInfo.appId && <span style={{ fontSize: '10px', color: '#666' }}>ID: {debugInfo.appId}</span>}
      </div>
      {debugInfo.errors.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <strong>Errors:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            {debugInfo.errors.map((error, index) => (
              <li key={index} style={{ color: 'red' }}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FacebookDebug; 