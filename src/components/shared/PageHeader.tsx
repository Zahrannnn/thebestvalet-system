import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Bell, UserCheck } from "lucide-react";

interface PageHeaderProps {
  title: string;
  logo?: string;
  logoAlt?: string;
  showNotifications?: boolean;
  notificationCount?: number;
  onNotificationClick?: () => void;
  showValetMode?: boolean;
  isValetMode?: boolean;
  onValetModeToggle?: () => void;
  onLogout?: () => void;
  logoutText?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  logo = "/lloogo.png",
  logoAlt = "أفضل خدمة صف سيارات",
  showNotifications = false,
  notificationCount = 0,
  onNotificationClick,
  showValetMode = false,
  isValetMode = false,
  onValetModeToggle,
  onLogout,
  logoutText = "تسجيل الخروج",
}) => {
  return (
    <header className="bg-white border-b border-amber-200 p-4 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img src={logo} alt={logoAlt} className="h-12 ml-3" />
          <h1 className="text-xl font-bold text-amber-800">{title}</h1>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          {showNotifications && (
            <div className="relative">
              {notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 animate-pulse bg-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {notificationCount}
                </div>
              )}
              {onNotificationClick && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 relative"
                  onClick={onNotificationClick}
                  title="عرض الإشعارات"
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="notification-badge">{notificationCount}</span>
                  )}
                </Button>
              )}
            </div>
          )}
          {showValetMode && onValetModeToggle && (
            <Button
              variant={isValetMode ? "default" : "ghost"}
              size="sm"
              onClick={onValetModeToggle}
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
          )}
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center text-amber-700 hover:text-amber-900 hover:bg-amber-50"
            >
              <Home className="h-4 w-4 ml-1" /> الرئيسية
            </Button>
          </Link>
          {onLogout && (
            <Button
              variant="outline"
              size="sm"
              className="text-amber-700 hover:text-amber-900 border-amber-200"
              onClick={onLogout}
            >
              {logoutText}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

