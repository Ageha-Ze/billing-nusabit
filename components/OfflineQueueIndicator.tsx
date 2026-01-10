"use client";
import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function OfflineQueueIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.navigator.onLine !== 'undefined') {
        setIsOnline(window.navigator.onLine);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // For now, just a simple online/offline indicator
  // The full queue implementation will be done in Phase 5
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOnline ? (
        <div className="flex items-center gap-2 p-2 bg-green-100 text-green-800 rounded-lg shadow-md">
          <Wifi className="h-5 w-5" />
          <span className="text-sm font-medium">Online</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2 bg-red-100 text-red-800 rounded-lg shadow-md">
          <WifiOff className="h-5 w-5" />
          <span className="text-sm font-medium">Offline</span>
        </div>
      )}
    </div>
  );
}