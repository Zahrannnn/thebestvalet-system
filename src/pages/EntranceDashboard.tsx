import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useValet } from "@/context/ValetContext";
import {
  Bell,
  Home,
  Ticket,
  List,
  Plus,
  Car,
  BellRing,
  BarChart3,
  Lock,
  UserCheck,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TicketGenerator from "@/components/TicketGenerator";
import RequestCar from "@/components/RequestCar";
import TicketDetails from "@/components/TicketDetails";
import TicketList from "@/components/TicketList";
import EntranceNotificationPanel from "@/components/EntranceNotificationPanel";
import RevenueAnalysis from "@/components/RevenueAnalysis";
import PasswordProtection from "@/components/PasswordProtection";
import { supabase } from "@/integrations/supabase/client";
import { CarRequest } from "@/context/ValetContext";
import "@/components/NotificationStyles.css";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getPasswordByKey } from "@/lib/password-service";

// DEVELOPMENT MODE - Set to true to bypass all passwords
const DEVELOPMENT_MODE = true;

// Define interface for the RealTime payload
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

const EntranceDashboard: React.FC = () => {
  const { getPendingRequests, state } = useValet();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(DEVELOPMENT_MODE);
  const [pendingRequests, setPendingRequests] = useState<CarRequest[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<CarRequest[]>([]);
  const [newNotificationCount, setNewNotificationCount] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("generate");
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  // Revenue tab password protection
  const [isRevenueAuthenticated, setIsRevenueAuthenticated] =
    useState<boolean>(DEVELOPMENT_MODE);
  const [showRevenuePasswordDialog, setShowRevenuePasswordDialog] =
    useState<boolean>(false);
  const [revenuePassword, setRevenuePassword] = useState<string>("");
  const [revenuePasswordError, setRevenuePasswordError] =
    useState<boolean>(false);

  // Valet mode password protection
  const [isValetMode, setIsValetMode] = useState<boolean>(false);
  const [showValetPasswordDialog, setShowValetPasswordDialog] =
    useState<boolean>(false);
  const [valetPassword, setValetPassword] = useState<string>("");
  const [valetPasswordError, setValetPasswordError] = useState<boolean>(false);

  // Updated password approach - load from database
  const dashboardPassword = getPasswordByKey("entrance");
  const revenueTabPassword = getPasswordByKey("revenue");
  const valetModePassword = getPasswordByKey("valet_mode");

  // Initialize requests
  useEffect(() => {
    const requests = getPendingRequests();
    setPendingRequests(requests);
    setAcceptedRequests(
      state.carRequests.filter((req) => req.status === "accepted")
    );

    // If there are pending requests, set them as new notifications
    if (requests.length > 0) {
      setNewNotificationCount(requests.length);
    }
  }, [getPendingRequests, state.carRequests]);

  // Subscribe to real-time updates
  useEffect(() => {
    const carRequestsChannel = supabase
      .channel("entrance-car-requests")
      // @ts-expect-error - Supabase types don't match implementation
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "car_requests",
        },
        async (payload: CarRequestPayload) => {
          console.log(
            "Car request change received in Entrance Dashboard:",
            payload
          );

          // Handle new car requests
          if (payload.eventType === "INSERT") {
            const newData = payload.new;
            if (newData.status === "pending") {
           
              if (activeTab !== "notifications") {
                playNotificationSound();
              }
              
           
              if (activeTab !== "notifications") {
                setNewNotificationCount((prev) => prev + 1);
              }
            }
          }

          // Update local state to reflect changes
          setPendingRequests(getPendingRequests());
          setAcceptedRequests(
            state.carRequests.filter((req) => req.status === "accepted")
          );
        }
      )
      .subscribe();

   
    return () => {
      supabase.removeChannel(carRequestsChannel);
    };
  }, [getPendingRequests, state.carRequests, activeTab]);

  useEffect(() => {
    if (DEVELOPMENT_MODE) {
      // Skip all authentication in development mode
      setIsAuthenticated(true);
      setIsRevenueAuthenticated(true);
      return;
    }

    const authStatus = sessionStorage.getItem("entranceDashboardAuth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }

    const revenueAuthStatus = sessionStorage.getItem("revenueTabAuth");
    if (revenueAuthStatus === "true") {
      setIsRevenueAuthenticated(true);
    }

    const valetModeStatus = sessionStorage.getItem("entranceValetMode");
    if (valetModeStatus === "true") {
      setIsValetMode(true);
    }
  }, []);

  // Handle authentication
  const handleAuthentication = async (success: boolean) => {
    if (success || DEVELOPMENT_MODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem("entranceDashboardAuth", "true");
 
      const savedValetMode = sessionStorage.getItem("entranceValetMode");
      if (savedValetMode === "true") {
        setIsValetMode(true);
      }
      
      const savedRevenueAuth = sessionStorage.getItem("revenueTabAuth");
      if (savedRevenueAuth === "true") {
        setIsRevenueAuthenticated(true);
      }
    }
  };

  const handleTabChange = (value: string) => {
    // Skip password check for revenue tab in development mode
    if (value === "revenue" && !isRevenueAuthenticated && !DEVELOPMENT_MODE) {
      setShowRevenuePasswordDialog(true);
      return; // Don't change tabs yet
    }

    setActiveTab(value);

    if (value === "notifications") {
      setNewNotificationCount(0);
    }
  };

  // Handle revenue tab password submission
  const handleRevenuePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (DEVELOPMENT_MODE) {
      setIsRevenueAuthenticated(true);
      setShowRevenuePasswordDialog(false);
      setActiveTab("revenue");
      setRevenuePassword("");
      return;
    }

    const currentRevenuePassword = await revenueTabPassword;
    if (revenuePassword === currentRevenuePassword) {
      setIsRevenueAuthenticated(true);
      sessionStorage.setItem("revenueTabAuth", "true");
      setShowRevenuePasswordDialog(false);
      setActiveTab("revenue"); 
      setRevenuePassword(""); 
    } else {
      setRevenuePasswordError(true);
      setTimeout(() => setRevenuePasswordError(false), 2000);
    }
  };

  const toggleValetModeDialog = () => {
    if (isValetMode) {
      setIsValetMode(false);
      sessionStorage.removeItem("entranceValetMode");
    } else {
      if (DEVELOPMENT_MODE) {
        setIsValetMode(true);
        sessionStorage.setItem("entranceValetMode", "true");
      } else {
        setShowValetPasswordDialog(true);
      }
    }
  };

  const handleValetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (DEVELOPMENT_MODE) {
      setIsValetMode(true);
      setShowValetPasswordDialog(false);
      setValetPassword("");
      return;
    }

    const currentValetPassword = await valetModePassword;
    if (valetPassword === currentValetPassword) {
      setIsValetMode(true);
      sessionStorage.setItem("entranceValetMode", "true");
      setShowValetPasswordDialog(false);
      setValetPassword(""); 
    } else {
      setValetPasswordError(true);
      setTimeout(() => setValetPasswordError(false), 2000);
    }
  };

  if (!isAuthenticated && !DEVELOPMENT_MODE) {
    return (
      <PasswordProtection
        onAuthenticate={handleAuthentication}
        correctPassword={dashboardPassword}
        title="لوحة تحكم المدخل"
      />
    );
  }

  const playNotificationSound = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3");
    audio.volume = 0.5;
    audio.play().catch((e) => console.error("Audio play failed:", e));
  };

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
              لوحة تحكم المدخل
            </h1>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 relative"
                onClick={() => {
                  document.getElementById("notifications-tab")?.click();
                  setNewNotificationCount(0);
                }}
                title="عرض الإشعارات"
              >
                <Bell className="h-5 w-5" />
                {newNotificationCount > 0 && (
                  <span className="notification-badge">
                    {newNotificationCount}
                  </span>
                )}
              </Button>
            </div>
            <Button
              variant={isValetMode ? "default" : "ghost"}
              size="sm"
              onClick={toggleValetModeDialog}
              className={`flex items-center ${
                isValetMode
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "text-amber-700 hover:text-amber-900 hover:bg-amber-50"
              }`}
              title={isValetMode ? "إيقاف وضع المضيف" : "تفعيل وضع المضيف"}
            >
              <UserCheck className="h-4 w-4 ml-1" />
              {isValetMode ? "وضع المضيف مفعل" : "وضع المضيف"}
            </Button>
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
                sessionStorage.removeItem("entranceDashboardAuth");
                sessionStorage.removeItem("revenueTabAuth");
                sessionStorage.removeItem("entranceValetMode");
                setIsAuthenticated(false);
                setIsRevenueAuthenticated(false);
                setIsValetMode(false);
              }}
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto py-8 px-4">
        {selectedTicket ? (
          <div className="max-w-lg mx-auto bg-white border border-amber-200 rounded-lg p-6 shadow-md">
            <TicketDetails
              ticketNumber={selectedTicket}
              onClose={() => setSelectedTicket(null)}
            />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-amber-800">
                خدمة صف السيارات المميزة
              </h2>
              {/* <p className="text-amber-700">عبد الرحمن سعد</p> */}
            </div>

            <Tabs
              defaultValue={
                pendingRequests.length > 0 ? "notifications" : "generate"
              }
              className="space-y-6"
              onValueChange={handleTabChange}
              value={activeTab}
            >
              <TabsList className="grid w-full grid-cols-5 mb-4 bg-white border border-amber-200 p-1 shadow-sm">
                <TabsTrigger
                  value="generate"
                  className="flex items-center justify-center data-[state=active]:bg-amber-600 data-[state=active]:text-white"
                >
                  <Plus className="ml-2 h-4 w-4" />
                  إنشاء تذكرة
                </TabsTrigger>
                <TabsTrigger
                  value="request"
                  className="flex items-center justify-center data-[state=active]:bg-amber-600 data-[state=active]:text-white"
                >
                  <Car className="ml-2 h-4 w-4" />
                  طلب سيارة
                </TabsTrigger>
                <TabsTrigger
                  value="tickets"
                  className="flex items-center justify-center data-[state=active]:bg-amber-600 data-[state=active]:text-white"
                >
                  <List className="ml-2 h-4 w-4" />
                  جميع التذاكر
                </TabsTrigger>
                <TabsTrigger
                  id="notifications-tab"
                  value="notifications"
                  className="flex items-center justify-center data-[state=active]:bg-amber-600 data-[state=active]:text-white relative"
                >
                  <BellRing className="ml-2 h-4 w-4" />
                  الإشعارات
                  {pendingRequests.length > 0 && (
                    <span className="mr-2 bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {pendingRequests.length}
                    </span>
                  )}
                  {newNotificationCount > 0 &&
                    activeTab !== "notifications" && (
                      <span className="notification-badge">
                        {newNotificationCount}
                      </span>
                    )}
                </TabsTrigger>
                <TabsTrigger
                  value="revenue"
                  className="flex items-center justify-center data-[state=active]:bg-amber-600 data-[state=active]:text-white"
                >
                  {!isRevenueAuthenticated && <Lock className="ml-1 h-3 w-3" />}
                  <BarChart3 className="ml-2 h-4 w-4" />
                  الإيرادات
                </TabsTrigger>
              </TabsList>

              <div className="bg-white rounded-lg shadow-md p-6 border border-amber-200">
                <TabsContent value="generate" className="mt-2">
                  <TicketGenerator />
                </TabsContent>

                <TabsContent value="request">
                  <RequestCar />
                </TabsContent>

                <TabsContent value="tickets">
                  <TicketList onSelectTicket={setSelectedTicket} />
                </TabsContent>

                <TabsContent value="notifications">
                  <EntranceNotificationPanel />
                </TabsContent>

                <TabsContent value="revenue">
                  <RevenueAnalysis />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </main>

      {/* Revenue password dialog */}
      <Dialog
        open={showRevenuePasswordDialog}
        onOpenChange={setShowRevenuePasswordDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-amber-800">
              تأكيد كلمة المرور
            </DialogTitle>
            <DialogDescription className="text-center">
              يرجى إدخال كلمة المرور للوصول إلى قسم الإيرادات
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRevenuePasswordSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute right-3 top-3 h-5 w-5 text-amber-600" />
              <Input
                type="password"
                value={revenuePassword}
                onChange={(e) => setRevenuePassword(e.target.value)}
                className={`pr-10 border-amber-200 focus:border-amber-400 focus:ring-amber-400 ${
                  revenuePasswordError ? "border-red-500 animate-shake" : ""
                }`}
                placeholder="أدخل كلمة المرور"
                dir="rtl"
              />
            </div>

            {revenuePasswordError && (
              <p className="text-red-500 text-sm text-center">
                كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.
              </p>
            )}

            <DialogFooter className="sm:justify-center">
              <Button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                تأكيد
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRevenuePasswordDialog(false)}
                className="border-amber-200"
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Valet mode password dialog */}
      <Dialog
        open={showValetPasswordDialog}
        onOpenChange={setShowValetPasswordDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-amber-800">
              تأكيد كلمة المرور
            </DialogTitle>
            <DialogDescription className="text-center">
              يرجى إدخال كلمة المرور لتفعيل وضع المضيف
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleValetPasswordSubmit} className="space-y-4">
            <div className="relative">
              <UserCheck className="absolute right-3 top-3 h-5 w-5 text-green-600" />
              <Input
                type="password"
                value={valetPassword}
                onChange={(e) => setValetPassword(e.target.value)}
                className={`pr-10 border-amber-200 focus:border-amber-400 focus:ring-amber-400 ${
                  valetPasswordError ? "border-red-500 animate-shake" : ""
                }`}
                placeholder="أدخل كلمة المرور"
                dir="rtl"
              />
            </div>

            {valetPasswordError && (
              <p className="text-red-500 text-sm text-center">
                كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.
              </p>
            )}

            <DialogFooter className="sm:justify-center">
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                تفعيل وضع المضيف
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowValetPasswordDialog(false)}
                className="border-amber-200"
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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

export default EntranceDashboard;
