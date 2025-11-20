import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useValet } from "@/context/ValetContext";
import { supabase } from "@/integrations/supabase/client";
import {
  CreditCard,
  Banknote,
  BarChart,
  Calendar,
  ChevronDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RevenueStats {
  totalRevenue: number;
  cashRevenue: number;
  visaRevenue: number;
  cashCount: number;
  visaCount: number;
  totalCount: number;
}

interface DailyRevenue {
  date: string;
  totalRevenue: number;
  cashRevenue: number;
  visaRevenue: number;
}

const RevenueAnalysis: React.FC = () => {
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    cashRevenue: 0,
    visaRevenue: 0,
    cashCount: 0,
    visaCount: 0,
    totalCount: 0,
  });

  const [dailyStats, setDailyStats] = useState<DailyRevenue[]>([]);
  const [periodFilter, setPeriodFilter] = useState<"today" | "week" | "month">(
    "today"
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRevenueStats();
  }, [periodFilter]);

  const fetchRevenueStats = async () => {
    setIsLoading(true);

    let dateFilter;
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).toISOString();

    if (periodFilter === "today") {
      dateFilter = today;
    } else if (periodFilter === "week") {
      const weekAgo = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7
      ).toISOString();
      dateFilter = weekAgo;
    } else if (periodFilter === "month") {
      const monthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      ).toISOString();
      dateFilter = monthAgo;
    }

    // Fetch all completed tickets for the selected period
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("is_paid", true)
      .gte("issue_date", dateFilter);

    if (error) {
      console.error("Error fetching revenue data:", error);
      setIsLoading(false);
      return;
    }

    if (data) {
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

      setStats({
        totalRevenue,
        cashRevenue,
        visaRevenue,
        cashCount: cashTickets.length,
        visaCount: visaTickets.length,
        totalCount: completedTickets.length,
      });

      // Group by date for daily stats
      const dailyData: { [key: string]: DailyRevenue } = {};

      completedTickets.forEach((ticket) => {
        const date = new Date(ticket.issue_date).toLocaleDateString("en-US");
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

      setDailyStats(
        Object.values(dailyData).sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        })
      );
    }

    setIsLoading(false);
  };

  const formatCurrency = (value: number) => {
    return value.toFixed(2) + " دينار كويتي";
  };

  return (
    /*  <Card dir="rtl" className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-amber-50 to-white border-amber-200 border shadow-md">
      <div className="flex flex-col items-center">
        <BarChart className="w-16 h-16 text-amber-400 mb-4 animate-bounce" />
        <CardTitle className="text-2xl font-bold text-amber-700 mb-2">قريباً</CardTitle>
        <CardDescription className="text-lg text-gray-600 mb-2 text-center max-w-xs">
          ميزة تحليل الإيرادات ستتوفر قريباً لمساعدتك في تتبع وتحليل أداء مواقف السيارات بسهولة واحترافية.
        </CardDescription>
        <span className="text-sm text-gray-400 mt-2">تابعنا للمزيد من التحديثات!</span>
      </div>
    </Card> */

    /* Finishhed Feature .. Waiting for cash */
    <Card dir="rtl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>تحليل الإيرادات</CardTitle>
            <CardDescription>
              {periodFilter === "today"
                ? "إيرادات اليوم"
                : periodFilter === "week"
                ? "إيرادات الأسبوع"
                : "إيرادات الشهر"}
            </CardDescription>
          </div>
          <Select
            value={periodFilter}
            onValueChange={(value) =>
              setPeriodFilter(value as "today" | "week" | "month")
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="week">آخر أسبوع</SelectItem>
              <SelectItem value="month">آخر شهر</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            جاري تحميل البيانات...
          </div>
        ) : (
          <Tabs defaultValue="summary">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="summary">ملخص</TabsTrigger>
              <TabsTrigger value="daily">تقرير يومي</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="text-amber-600 font-medium mb-2 flex items-center gap-2 ">
                    إجمالي الإيرادات
                    <BarChart className="h-4 w-4 ml-2" />
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {stats.totalCount} تذكرة
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-green-600 font-medium mb-2 flex items-center gap-2">
                    الدفع النقدي
                    <Banknote className="h-4 w-4 ml-2" />
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats.cashRevenue)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {stats.cashCount} تذكرة (
                    {stats.totalCount > 0
                      ? Math.round((stats.cashCount / stats.totalCount) * 100)
                      : 0}
                    ٪)
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-blue-600 font-medium mb-2 flex items-center gap-2">
                    فيزا
                    <CreditCard className="h-4 w-4 ml-2" />
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats.visaRevenue)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {stats.visaCount} تذكرة (
                    {stats.totalCount > 0
                      ? Math.round((stats.visaCount / stats.totalCount) * 100)
                      : 0}
                    ٪)
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="daily">
              {dailyStats.length > 0 ? (
                <div className="space-y-4">
                  {dailyStats.map((day) => (
                    <div key={day.date} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium flex items-center">
                          <Calendar className="h-4 w-4 ml-2 text-amber-600" />
                          {day.date}
                        </div>
                        <div className="text-lg font-bold">
                          {formatCurrency(day.totalRevenue)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-sm flex items-center">
                          <Banknote className="h-3 w-3 text-green-600 ml-1" />
                          <span className="text-gray-600">نقدي: </span>
                          <span className="font-medium mr-1">
                            {formatCurrency(day.cashRevenue)}
                          </span>
                        </div>
                        <div className="text-sm flex items-center">
                          <CreditCard className="h-3 w-3 text-blue-600 ml-1" />
                          <span className="text-gray-600">بطاقات: </span>
                          <span className="font-medium mr-1">
                            {formatCurrency(day.visaRevenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  لا توجد بيانات للفترة المحددة
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueAnalysis;
