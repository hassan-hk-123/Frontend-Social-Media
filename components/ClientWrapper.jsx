'use client';

import React from 'react';
import useChatSocket from '@/store/useChatSocket';

const ClientWrapper = ({ children }) => {
  useChatSocket(); 
  return <>{children}</>;
};

export default ClientWrapper;
