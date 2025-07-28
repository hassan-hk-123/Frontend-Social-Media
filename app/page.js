"use client";
import React from 'react';

import Navbar from '../components/Navbar';
import Feed from '../components/Feed';
import Sidebar from '@/components/Sidenav';
import RightSidebar from '@/components/RightSidebar';
import ProtectedRoute from "../components/ProtectedRoute";

const rightSidebarStyle = {
  width: 250,
  flex: '0 0 250px',
  height: 'calc(100vh - 76px)', // 76px = Navbar height
  position: 'sticky',
  top: 76,
  overflowY: 'hidden', // changed from 'overflow' to 'overflowY'
};

const rightSidebarHoverStyle = {
  overflowY: 'auto',
};



export default function Page() {
  const [hover, setHover] = React.useState(false);
  
  return (
    <ProtectedRoute>
      <div>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', minHeight: '100vh', background: '#fafbfc' }}>
          
          <div style={{ width: 220, flex: '0 0 220px' }}>
            <Sidebar />
          </div>

        
          <div style={{ flex: 1, maxWidth: 600, minWidth: 320, marginLeft: 'auto', marginRight: 'auto', marginTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Feed />
          </div>

          <div
            style={hover ? { ...rightSidebarStyle, ...rightSidebarHoverStyle } : rightSidebarStyle}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <RightSidebar />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}