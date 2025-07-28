"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${API_URL}/api/auth/check-token`, { withCredentials: true });
        setChecking(false);
      } catch {
        router.replace("/login");
      }
    };
    checkAuth();
  }, [router]);

  if (checking) return null;

  return children;
} 