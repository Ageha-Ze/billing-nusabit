"use client";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";

export default function UIWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setUser } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  // This is a temporary solution to get user from a mock session
  // until the real auth is implemented.
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/session');
        if(res.ok) {
          const { user } = await res.json();
          setUser(user);
        }
      } catch (error) {
        console.error("Failed to fetch session", error)
      } finally {
        setIsMounted(true);
      }
    }
    fetchUser();
  }, [setUser, pathname]);


  const isAuthPage = pathname === "/login";
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Prevents flash of authenticated layout on auth pages before redirect
  if (!isMounted && !isAuthPage) {
    return null; // or a loading spinner
  }

  return (
    <div>
      {children}
    </div>
  );
}
