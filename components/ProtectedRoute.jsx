"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      // First check if we have authentication in Redux state
      if (isAuthenticated && user) {
        console.log('User authenticated via Redux state:', user);
        setChecking(false);
        return;
      }

      // If no Redux state, check server-side token
      try {
        await axios.get(`${API_URL}/api/auth/check-token`, { withCredentials: true });
        console.log('User authenticated via server token check');
        setChecking(false);
      } catch (error) {
        console.log('Server token check failed, redirecting to login');
        router.replace("/login");
      }
    };
    
    checkAuth();
  }, [router, isAuthenticated, user]);

  if (checking) return null;

  return children;
} 