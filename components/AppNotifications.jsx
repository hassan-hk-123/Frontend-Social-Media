"use client";

import { notification } from 'antd';
import { useEffect } from 'react';

// Exportable notification API
let notificationApi;

const AppNotifications = () => {
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    notificationApi = api;
  }, [api]);

  return <>{contextHolder}</>;
};

// Utility to call notifications from anywhere
export const notify = {
  success: (config) => notificationApi?.success(config),
  error: (config) => notificationApi?.error(config),
  info: (config) => notificationApi?.info(config),
  warning: (config) => notificationApi?.warning(config),
  open: (config) => notificationApi?.open(config),
};

export default AppNotifications; 