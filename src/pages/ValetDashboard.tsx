import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useValet } from "@/context/ValetContext";
import NotificationPanel from "@/components/NotificationPanel";
import PasswordProtection from "@/components/PasswordProtection";
import { getPasswordByKey } from "@/lib/password-service";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageFooter } from "@/components/shared/PageFooter";
import { TicketSearchInput } from "@/components/shared/TicketSearchInput";
import { TicketSearchResult } from "@/components/shared/TicketSearchResult";
import { useTicketSearch } from "@/hooks/useTicketSearch";
import { useNotificationSound } from "@/hooks/useNotificationSound";

const ValetDashboard: React.FC = () => {
  const { state, getTicketByNumber } = useValet();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { playSound } = useNotificationSound();
  const pendingRequests = state.carRequests.filter(
    (req) => req.status === "pending"
  );

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    handleSearch,
  } = useTicketSearch(state.tickets);

  useEffect(() => {
    const authStatus = sessionStorage.getItem("valetDashboardAuth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthentication = (success: boolean) => {
    setIsAuthenticated(success);
    if (success) {
      sessionStorage.setItem("valetDashboardAuth", "true");
    }
  };

  const dashboardPassword = getPasswordByKey("valet");

  useEffect(() => {
    if (pendingRequests.length > 0) {
      playSound();

      if (Notification.permission === "granted") {
        const latestRequest = pendingRequests[0];
        const ticket = getTicketByNumber(
          state.tickets.find((t) => t.id === latestRequest.ticketId)
            ?.ticketNumber || ""
        );

        if (ticket) {
          new Notification("طلب سيارة جديد", {
            body: `تم طلب السيارة ذات التذكرة رقم ${ticket.ticketNumber}.`,
          });
        }
      }
    }
  }, [pendingRequests.length, playSound, getTicketByNumber, state.tickets]);

  if (!isAuthenticated) {
    return (
      <PasswordProtection
        onAuthenticate={handleAuthentication}
        correctPassword={dashboardPassword}
        title="لوحة تحكم خدمة صف السيارات"
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50" dir="rtl">
      <PageHeader
        title="لوحة تحكم خدمة صف السيارات"
        showNotifications={true}
        notificationCount={pendingRequests.length}
        onLogout={() => {
          sessionStorage.removeItem("valetDashboardAuth");
          setIsAuthenticated(false);
        }}
      />

      {/* Main content */}
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <img
              src="/lloogo.png"
              alt="أفضل خدمة صف سيارات"
              className="h-24 mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-amber-800">
              خدمة صف السيارات المميزة
            </h2>
            <p className="text-amber-700">عبد الرحمن سعد</p>
          </div>

          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-white border border-amber-200 p-1 shadow-sm">
              <TabsTrigger
                value="notifications"
                className="flex items-center justify-center data-[state=active]:bg-amber-600 data-[state=active]:text-white"
              >
                الإشعارات
                {pendingRequests.length > 0 && (
                  <span className="mr-2 bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {pendingRequests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="search"
                className="flex items-center justify-center data-[state=active]:bg-amber-600 data-[state=active]:text-white"
              >
                بحث التذاكر
              </TabsTrigger>
            </TabsList>

            <div className="bg-white rounded-lg shadow-md p-6 border border-amber-200">
              <TabsContent value="notifications" className="space-y-6">
                <NotificationPanel />
              </TabsContent>

              <TabsContent value="search" className="space-y-6">
                <Card className="bg-amber-50/50 border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-amber-800">
                      بحث التذاكر
                    </CardTitle>
                    <CardDescription className="text-amber-700">
                      ابحث عن معلومات التذكرة برقم التذكرة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <TicketSearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onSearch={handleSearch}
                      />

                      {searchResults.length > 0 && (
                        <div className="border border-amber-200 rounded-md divide-y divide-amber-200 bg-white">
                          {searchResults.map((ticket) => (
                            <TicketSearchResult key={ticket.id} ticket={ticket} />
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      <PageFooter />
    </div>
  );
};

export default ValetDashboard;
