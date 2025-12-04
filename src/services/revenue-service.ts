import { supabase } from "@/integrations/supabase/client";


export interface RevenueStats {
  totalRevenue: number;
  cashRevenue: number;
  visaRevenue: number;
  cashCount: number;
  visaCount: number;
  totalCount: number;
}


export interface DailyRevenue {
  date: string;
  totalRevenue: number;
  cashRevenue: number;
  visaRevenue: number;
}


export async function fetchRevenueStats(
  startDate: string
): Promise<{ stats: RevenueStats; dailyStats: DailyRevenue[] }> {
  // Fetch all completed tickets for the selected period
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("is_paid", true)
    .gte("issue_date", startDate);

  if (error) {
    console.error("Error fetching revenue data:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    return {
      stats: {
        totalRevenue: 0,
        cashRevenue: 0,
        visaRevenue: 0,
        cashCount: 0,
        visaCount: 0,
        totalCount: 0,
      },
      dailyStats: [],
    };
  }

  // Calculate totals
  const completedTickets = data;
  const totalRevenue = completedTickets.reduce(
    (sum, ticket) => sum + Number(ticket.price),
    0
  );

  const cashTickets = completedTickets.filter(
    (ticket) => ticket.payment_method === "cash"
  );
  const visaTickets = completedTickets.filter(
    (ticket) => ticket.payment_method === "visa"
  );

  const cashRevenue = cashTickets.reduce(
    (sum, ticket) => sum + Number(ticket.price),
    0
  );
  const visaRevenue = visaTickets.reduce(
    (sum, ticket) => sum + Number(ticket.price),
    0
  );

  const stats: RevenueStats = {
    totalRevenue,
    cashRevenue,
    visaRevenue,
    cashCount: cashTickets.length,
    visaCount: visaTickets.length,
    totalCount: completedTickets.length,
  };

  
  const dailyData: { [key: string]: DailyRevenue } = {};

  completedTickets.forEach((ticket) => {
    const date = new Date(ticket.issue_date || Date.now()).toLocaleDateString("en-US");
    const price = Number(ticket.price);

    if (!dailyData[date]) {
      dailyData[date] = {
        date,
        totalRevenue: 0,
        cashRevenue: 0,
        visaRevenue: 0,
      };
    }

    dailyData[date].totalRevenue += price;

    if (ticket.payment_method === "cash") {
      dailyData[date].cashRevenue += price;
    } else if (ticket.payment_method === "visa") {
      dailyData[date].visaRevenue += price;
    }
  });

  const dailyStats = Object.values(dailyData).sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return { stats, dailyStats };
}


export function getDateFilter(period: "today" | "week" | "month"): string {
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).toISOString();

  if (period === "today") {
    return today;
  } else if (period === "week") {
    const weekAgo = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 7
    ).toISOString();
    return weekAgo;
  } else {
    // month
    const monthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    ).toISOString();
    return monthAgo;
  }
}

