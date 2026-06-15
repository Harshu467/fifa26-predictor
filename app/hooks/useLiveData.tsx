"use client";

import { useEffect, useState } from 'react';

export default function useLiveData() {
  const [payload, setPayload] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let es: EventSource | null = null;
    let poller: number | null = null;

    function startPolling() {
      // poll every 10s
      const fetchOnce = async () => {
        try {
          const res = await fetch('/api/live/schedule');
          if (!res.ok) return;
          const data = await res.json();
          setPayload(data);
        } catch (e) {}
      };
      fetchOnce();
      poller = window.setInterval(fetchOnce, 10000);
    }

    try {
      if ('EventSource' in window) {
        es = new EventSource('/api/live/stream');
        es.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            setPayload(data);
          } catch (err) {}
        };
        es.onerror = () => {
          if (es) { es.close(); es = null; }
          startPolling();
        };
      } else {
        startPolling();
      }
    } catch (e) {
      startPolling();
    }

    return () => {
      if (es) es.close();
      if (poller) clearInterval(poller);
    };
  }, []);

  return payload;
}
