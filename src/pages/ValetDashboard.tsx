import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useValet, Ticket } from "@/context/ValetContext";
import { CarFront, Home, Search } from "lucide-react";
import NotificationPanel from "@/components/NotificationPanel";
import PasswordProtection from "@/components/PasswordProtection";
import { getPasswordByKey } from "@/lib/password-service";

const ValetDashboard: React.FC = () => {
  const { state, getTicketByNumber } = useValet();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Ticket[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const pendingRequests = state.carRequests.filter(
    (req) => req.status === "pending"
  );

  // Check if user was previously authenticated in this session
  useEffect(() => {
    const authStatus = sessionStorage.getItem("valetDashboardAuth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Store authentication status in session storage
  const handleAuthentication = (success: boolean) => {
    setIsAuthenticated(success);
    if (success) {
      sessionStorage.setItem("valetDashboardAuth", "true");
    }
  };

  // Password for accessing the valet dashboard - now from database
  const dashboardPassword = getPasswordByKey("valet");

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const tickets = state.tickets.filter((ticket) =>
      ticket.ticketNumber.includes(searchQuery.trim())
    );

    if (tickets.length === 0) {
      toast({
        title: "لا توجد نتائج",
        description: "لم يتم العثور على تذاكر مطابقة لبحثك.",
      });
    }

    setSearchResults(tickets);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString("ar-SA", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (pendingRequests.length > 0) {
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3"
      );
      audio.volume = 0.5;
      audio.play().catch((e) => console.log("Audio play failed:", e));

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
  }, [pendingRequests.length]);

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
      {/* Header */}
      <header className="bg-white border-b border-amber-200 p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="/lloogo.png"
              alt="أفضل خدمة صف سيارات"
              className="h-12 ml-3"
            />
            <h1 className="text-xl font-bold text-amber-800">
              لوحة تحكم خدمة صف السيارات
            </h1>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="relative">
              {pendingRequests.length > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 animate-pulse bg-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {pendingRequests.length}
                </div>
              )}
            </div>
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center text-amber-700 hover:text-amber-900 hover:bg-amber-50"
              >
                <Home className="h-4 w-4 ml-1" /> الرئيسية
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="text-amber-700 hover:text-amber-900 border-amber-200"
              onClick={() => {
                sessionStorage.removeItem("valetDashboardAuth");
                setIsAuthenticated(false);
              }}
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

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
                      <div className="flex space-x-2 space-x-reverse">
                        <div className="flex-1">
                          <Input
                            placeholder="أدخل رقم التذكرة"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSearch();
                            }}
                            className="bg-white border-amber-300 text-amber-900 placeholder:text-amber-400/50"
                          />
                        </div>
                        <Button
                          onClick={handleSearch}
                          className="flex items-center bg-amber-600 text-white hover:bg-amber-700"
                        >
                          <Search className="h-4 w-4 ml-2" /> بحث
                        </Button>
                      </div>

                      {searchResults.length > 0 && (
                        <div className="border border-amber-200 rounded-md divide-y divide-amber-200 bg-white">
                          {searchResults.map((ticket) => (
                            <div key={ticket.id} className="p-3">
                              <div className="flex justify-between">
                                <div>
                                  <p className="font-medium text-amber-900">
                                    تذكرة رقم #{ticket.ticketNumber}
                                  </p>
                                  <p className="text-sm text-amber-700">
                                    {ticket.issueDate.toLocaleDateString(
                                      "en-US",
                                      {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                      }
                                    )}
                                  </p>
                                </div>
                                <div className="text-left">
                                  <p className="font-medium text-amber-800">
                                    ${ticket.price.toFixed(2)}
                                  </p>
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${
                                      ticket.isPaid
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {ticket.isPaid ? "مدفوع" : "غير مدفوع"}
                                  </span>
                                </div>
                              </div>
                              {ticket.instructions && (
                                <p className="mt-2 text-sm text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                                  {ticket.instructions}
                                </p>
                              )}
                            </div>
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

      {/* Footer */}
      <footer className="bg-white border-t border-amber-200 p-4 mt-auto">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="/lloogo.png"
              alt="أفضل خدمة صف سيارات"
              className="h-8 ml-3"
            />
            <span className="text-sm text-amber-800">أفضل خدمة صف سيارات</span>
          </div>
          <p className="text-sm text-amber-700">
            © {new Date().getFullYear()} عبد الرحمن سعد
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ValetDashboard;
