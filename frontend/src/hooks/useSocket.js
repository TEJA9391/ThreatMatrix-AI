import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const [data, setData] = useState(null);
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const s = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
    });
    setSocket(s);

    s.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      console.log('✅ Connected to ThreatMatrix AI SOC Socket');
    });

    s.on('disconnect', (reason) => {
      setIsConnected(false);
      console.warn('⚠️ ThreatMatrix Socket disconnected:', reason);
    });

    s.on('connect_error', (err) => {
      setIsConnected(false);
      setConnectionError(err.message);
      console.error('❌ ThreatMatrix Socket connection error:', err.message);
    });

    s.on('initial_data', (initialData) => {
      setData(initialData);
      setConnectionError(null);
      if (initialData.history) {
        setEvents(initialData.history);
      }
    });

    s.on('stream_update', (update) => {
      setData(prev => ({
        ...prev,
        ...update
      }));
      
      if (update.new_event) {
        setEvents(prev => [update.new_event, ...prev].slice(0, 50));
      }
    });

    return () => s.close();
  }, []);

  return { socket, data, events, isConnected, connectionError };
}
