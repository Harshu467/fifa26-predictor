"use client";

import { useEffect, useState } from 'react';

interface LivePayload {
  matches?: any[];
  stats?: any[];
  news?: any[];
}

export default function useLiveData() {
  const [payload, setPayload] = useState<LivePayload | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let es: EventSource | null = null;
    let poller: number | null = null;

    function startPolling() {
      setIsConnected(false);
      const fetchOnce = async () => {
        try {
          const res = await fetch('/api/live/schedule', {
            headers: { 'pragma': 'no-cache' }
          });
          if (!res.ok) return;
          const data: LivePayload = await res.json();
          setPayload(data);
        } catch (e) {
          console.error('Poll error:', e);
        }
      };
      fetchOnce();
      poller = window.setInterval(fetchOnce, 10000);
    }

    function startSSE() {
      try {
        if (!('EventSource' in window)) {
          startPolling();
          return;
        }

        es = new EventSource('/api/live/stream');

        es.addEventListener('snapshot', (e) => {
          try {
            const data = JSON.parse(e.data);
            setPayload(data.payload);
            setIsConnected(true);
          } catch (err) {
            console.error('SSE parse error:', err);
          }
        });

        es.addEventListener('heartbeat', () => {
          // Just log heartbeat
          console.debug('Live data heartbeat');
        });

        es.onerror = () => {
          console.warn('SSE error, fallback to polling');
          if (es) { es.close(); es = null; }
          startPolling();
        };

        setIsConnected(true);
      } catch (e) {
        console.error('SSE init error:', e);
        startPolling();
      }
    }

    startSSE();

    return () => {
      if (es) es.close();
      if (poller) clearInterval(poller);
    };
  }, []);

  return payload;
}
