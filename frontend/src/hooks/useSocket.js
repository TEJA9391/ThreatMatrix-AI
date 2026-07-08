import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const [data, setData] = useState(null);
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const s = io(SOCKET_URL);
    setSocket(s);

    s.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to CyberSentinel SOC Socket');
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    s.on('initial_data', (initialData) => {
      setData(initialData);
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

  return { socket, data, events, isConnected };
}
