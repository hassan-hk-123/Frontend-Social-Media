import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Tag, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SocialLoginTest = () => {
  const [testResults, setTestResults] = useState({
    googleClientId: false,
    facebookAppId: false,
    googleSDK: false,
    facebookSDK: false,
    reduxStore: false,
    authSlice: false
  });

  useEffect(() => {
    const runTests = () => {
      const results = { ...testResults };

      // Test Google Client ID
      results.googleClientId = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      // Test Facebook App ID
      results.facebookAppId = !!process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
      
      // Test Google SDK
      results.googleSDK = typeof window !== 'undefined' && window.google && window.google.accounts;
      
      // Test Facebook SDK
      results.facebookSDK = typeof window !== 'undefined' && window.FB;
      
      // Test Redux Store
      try {
        const { store } = require('../store/index');
        results.reduxStore = !!store;
      } catch (e) {
        results.reduxStore = false;
      }
      
      // Test Auth Slice
      try {
        const { googleLogin, facebookLogin, signin, signup } = require('../store/slices/authSlice');
        results.authSlice = !!(googleLogin && facebookLogin && signin && signup);
      } catch (e) {
        results.authSlice = false;
      }

      setTestResults(results);
    };

    // Run tests after a delay to allow SDKs to load
    setTimeout(runTests, 2000);
  }, []);

  const allTestsPassed = Object.values(testResults).every(result => result);
  const someTestsPassed = Object.values(testResults).some(result => result);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card 
      title="Social Login Test Results" 
      style={{ 
        position: 'fixed', 
        bottom: '10px', 
        left: '10px', 
        width: '350px', 
        zIndex: 9999,
        maxHeight: '400px',
        overflow: 'auto'
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message={allTestsPassed ? "All Tests Passed!" : someTestsPassed ? "Some Issues Found" : "Critical Issues"}
          type={allTestsPassed ? "success" : someTestsPassed ? "warning" : "error"}
          showIcon
        />
        
        <div>
          <Text strong>Environment Variables:</Text>
          <div style={{ marginLeft: '10px' }}>
            <div>
              {testResults.googleClientId ? 
                <CheckCircleOutlined style={{ color: 'green' }} /> : 
                <CloseCircleOutlined style={{ color: 'red' }} />
              } Google Client ID
            </div>
            <div>
              {testResults.facebookAppId ? 
                <CheckCircleOutlined style={{ color: 'green' }} /> : 
                <CloseCircleOutlined style={{ color: 'red' }} />
              } Facebook App ID
            </div>
          </div>
        </div>

        <div>
          <Text strong>SDK Loading:</Text>
          <div style={{ marginLeft: '10px' }}>
            <div>
              {testResults.googleSDK ? 
                <CheckCircleOutlined style={{ color: 'green' }} /> : 
                <CloseCircleOutlined style={{ color: 'red' }} />
              } Google SDK
            </div>
            <div>
              {testResults.facebookSDK ? 
                <CheckCircleOutlined style={{ color: 'green' }} /> : 
                <CloseCircleOutlined style={{ color: 'red' }} />
              } Facebook SDK
            </div>
          </div>
        </div>

        <div>
          <Text strong>Redux Store:</Text>
          <div style={{ marginLeft: '10px' }}>
            <div>
              {testResults.reduxStore ? 
                <CheckCircleOutlined style={{ color: 'green' }} /> : 
                <CloseCircleOutlined style={{ color: 'red' }} />
              } Store Available
            </div>
            <div>
              {testResults.authSlice ? 
                <CheckCircleOutlined style={{ color: 'green' }} /> : 
                <CloseCircleOutlined style={{ color: 'red' }} />
              } Auth Slice Functions
            </div>
          </div>
        </div>

        {!testResults.googleClientId && (
          <Alert
            message="Missing Google Client ID"
            description="Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your .env.local file"
            type="error"
            showIcon
          />
        )}

        {!testResults.facebookAppId && (
          <Alert
            message="Missing Facebook App ID"
            description="Add NEXT_PUBLIC_FACEBOOK_APP_ID to your .env.local file"
            type="error"
            showIcon
          />
        )}
      </Space>
    </Card>
  );
};

export default SocialLoginTest; 