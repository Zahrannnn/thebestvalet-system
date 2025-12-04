import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart } from "lucide-react";
import { fetchRevenueStats, getDateFilter, type RevenueStats, type DailyRevenue } from "@/services/revenue-service";
import { PeriodFilter } from "@/components/shared/PeriodFilter";
import { RevenueStatsCard } from "@/components/shared/RevenueStatsCard";
import { DailyRevenueItem } from "@/components/shared/DailyRevenueItem";
import { CreditCard, Banknote } from "lucide-react";

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

  const fetchRevenueData = useCallback(async () => {
    setIsLoading(true);

    try {
      const dateFilter = getDateFilter(periodFilter);
      const { stats: revenueStats, dailyStats: dailyRevenueStats } = await fetchRevenueStats(dateFilter);
      
      setStats(revenueStats);
      setDailyStats(dailyRevenueStats);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [periodFilter]);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  return (
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
          <PeriodFilter
            value={periodFilter}
            onChange={(value) => setPeriodFilter(value)}
          />
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
                <RevenueStatsCard
                  title="إجمالي الإيرادات"
                  value={stats.totalRevenue}
                  count={stats.totalCount}
                  icon={BarChart}
                  bgColor="bg-amber-50"
                  textColor="text-amber-600"
                  borderColor="border-amber-200"
                />
                <RevenueStatsCard
                  title="الدفع النقدي"
                  value={stats.cashRevenue}
                  count={stats.cashCount}
                  percentage={stats.totalCount > 0 ? Math.round((stats.cashCount / stats.totalCount) * 100) : 0}
                  icon={Banknote}
                  bgColor="bg-green-50"
                  textColor="text-green-600"
                  borderColor="border-green-200"
                />
                <RevenueStatsCard
                  title="فيزا"
                  value={stats.visaRevenue}
                  count={stats.visaCount}
                  percentage={stats.totalCount > 0 ? Math.round((stats.visaCount / stats.totalCount) * 100) : 0}
                  icon={CreditCard}
                  bgColor="bg-blue-50"
                  textColor="text-blue-600"
                  borderColor="border-blue-200"
                />
              </div>
            </TabsContent>

            <TabsContent value="daily">
              {dailyStats.length > 0 ? (
                <div className="space-y-4">
                  {dailyStats.map((day) => (
                    <DailyRevenueItem key={day.date} day={day} />
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
