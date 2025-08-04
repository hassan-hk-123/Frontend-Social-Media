'use client';

import React from 'react';
import useChatSocket from '@/store/useChatSocket';
import { GoogleOAuthProvider } from '@react-oauth/google';


const ClientWrapper = ({ children }) => {
  useChatSocket(); 
  return <>
  <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  </>;
};

export default ClientWrapper;
