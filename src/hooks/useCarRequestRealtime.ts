import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { useNotificationSound } from './useNotificationSound';

interface CarRequestPayload {
  new: {
    id: string;
    ticket_id: string;
    status: string;
    request_time: string;
  };
  old: {
    id: string;
    ticket_id: string;
    status: string;
    request_time: string;
  };
  eventType: "INSERT" | "UPDATE" | "DELETE";
}

interface UseCarRequestRealtimeOptions {
  playSound?: boolean;
  showToast?: boolean;
}

export function useCarRequestRealtime(
  channelName: string,
  onUpdate?: () => void,
  options: UseCarRequestRealtimeOptions = { playSound: true, showToast: true }
) {
  const { playSound } = useNotificationSound();

  useEffect(() => {
    const carRequestsChannel = supabase
      .channel(channelName)
      // @ts-expect-error - Supabase types don't match implementation for RealtimeChannel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "car_requests",
        },
        async (payload: CarRequestPayload) => {
          console.log("Car request change received:", payload);

          if (payload.eventType === "INSERT") {
            const newData = payload.new;
            if (newData.status === "pending") {
              if (options.playSound !== false) {
                playSound();
              }
              
              if (options.showToast !== false) {
                toast({
                  title: "طلب استرجاع سيارة جديد",
                  description: "هناك طلب جديد لاسترجاع سيارة في الانتظار",
                  variant: "default",
                });
              }
            }
          }

          if (onUpdate) {
            onUpdate();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(carRequestsChannel);
    };
  }, [channelName, playSound, onUpdate, options.playSound, options.showToast]);
}

