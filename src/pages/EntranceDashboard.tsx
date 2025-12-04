import React, { useState, useEffect } from "react";
import { useValet } from "@/context/ValetContext";
import {
  Plus,
  Car,
  List,
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
import { CarRequest } from "@/context/ValetContext";
import "@/components/NotificationStyles.css";
import { getPasswordByKey } from "@/lib/password-service";
import { config } from "@/config/app";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageFooter } from "@/components/shared/PageFooter";
import { PasswordDialog } from "@/components/shared/PasswordDialog";
import { useCarRequestRealtime } from "@/hooks/useCarRequestRealtime";
import { useNotificationSound } from "@/hooks/useNotificationSound";

const DEVELOPMENT_MODE = config.developmentMode;

const EntranceDashboard: React.FC = () => {
  const { getPendingRequests, state } = useValet();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(DEVELOPMENT_MODE);
  const [pendingRequests, setPendingRequests] = useState<CarRequest[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<CarRequest[]>([]);
  const [newNotificationCount, setNewNotificationCount] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("generate");
  const { playSound } = useNotificationSound();

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

  useCarRequestRealtime(
    "entrance-car-requests",
    () => {
      const requests = getPendingRequests();
      setPendingRequests(requests);
      setAcceptedRequests(
        state.carRequests.filter((req) => req.status === "accepted")
      );
      
      if (requests.length > 0 && activeTab !== "notifications") {
        playSound();
        setNewNotificationCount((prev) => prev + 1);
      }
    },
    { playSound: false, showToast: false }
  );

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

  return (
    <div className="min-h-screen flex flex-col bg-amber-50" dir="rtl">
      <PageHeader
        title="لوحة تحكم المدخل"
        showNotifications={true}
        notificationCount={newNotificationCount}
        onNotificationClick={() => {
          document.getElementById("notifications-tab")?.click();
          setNewNotificationCount(0);
        }}
        showValetMode={true}
        isValetMode={isValetMode}
        onValetModeToggle={toggleValetModeDialog}
        onLogout={() => {
          sessionStorage.removeItem("entranceDashboardAuth");
          sessionStorage.removeItem("revenueTabAuth");
          sessionStorage.removeItem("entranceValetMode");
          setIsAuthenticated(false);
          setIsRevenueAuthenticated(false);
          setIsValetMode(false);
        }}
      />

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

      <PasswordDialog
        open={showRevenuePasswordDialog}
        onOpenChange={setShowRevenuePasswordDialog}
        title="تأكيد كلمة المرور"
        description="يرجى إدخال كلمة المرور للوصول إلى قسم الإيرادات"
        password={revenuePassword}
        onPasswordChange={setRevenuePassword}
        onSubmit={handleRevenuePasswordSubmit}
        error={revenuePasswordError}
        submitButtonText="تأكيد"
        icon={Lock}
      />

      <PasswordDialog
        open={showValetPasswordDialog}
        onOpenChange={setShowValetPasswordDialog}
        title="تأكيد كلمة المرور"
        description="يرجى إدخال كلمة المرور لتفعيل وضع المضيف"
        password={valetPassword}
        onPasswordChange={setValetPassword}
        onSubmit={handleValetPasswordSubmit}
        error={valetPasswordError}
        submitButtonText="تفعيل وضع المضيف"
        submitButtonClassName="bg-green-600 hover:bg-green-700 text-white"
        icon={UserCheck}
        iconColor="text-green-600"
      />

      <PageFooter />
    </div>
  );
};

export default EntranceDashboard;
