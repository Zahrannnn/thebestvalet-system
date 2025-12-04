import { useState, useEffect, useCallback } from 'react';
import { fetchTicketNumbersByIds } from '@/services/car-request-service';
import type { CarRequest } from '@/context/ValetContext';

interface TicketCache {
  [key: string]: string;
}

interface TicketPriceCache {
  [key: string]: number;
}

export function useTicketCache(requests: CarRequest[]) {
  const [ticketCache, setTicketCache] = useState<TicketCache>({});
  const [priceCache, setPriceCache] = useState<TicketPriceCache>({});

  useEffect(() => {
    const fetchTicketNumbers = async () => {
      const ticketIdsToFetch = requests
        .filter(req => !ticketCache[req.ticketId] || !priceCache[req.ticketId])
        .map(req => req.ticketId);
      
      if (ticketIdsToFetch.length === 0) return;
      
      try {
        const ticketData = await fetchTicketNumbersByIds(ticketIdsToFetch);
        
        const newCache = { ...ticketCache };
        const newPriceCache = { ...priceCache };
        
        Object.entries(ticketData).forEach(([ticketId, data]) => {
          newCache[ticketId] = data.ticketNumber;
          newPriceCache[ticketId] = data.price;
        });
        
        setTicketCache(newCache);
        setPriceCache(newPriceCache);
      } catch (error) {
        console.error('Error fetching ticket numbers:', error);
      }
    };
    
    fetchTicketNumbers();
  }, [requests, ticketCache, priceCache]);

  const getTicketNumber = useCallback((ticketId: string, fallback: (id: string) => string | undefined) => {
    if (ticketCache[ticketId]) {
      return ticketCache[ticketId];
    }
    return fallback(ticketId) || 'Unknown';
  }, [ticketCache]);

  const getTicketPrice = useCallback((ticketId: string, fallback: (id: string) => number | undefined) => {
    if (priceCache[ticketId]) {
      return priceCache[ticketId];
    }
    return fallback(ticketId) || 0;
  }, [priceCache]);

  return {
    getTicketNumber,
    getTicketPrice,
  };
}

