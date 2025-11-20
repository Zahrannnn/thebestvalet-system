import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CarFront, Key, PersonStanding, Ticket, ShieldCheck, Receipt, Bell, UserCheck, CheckCircle, ExternalLink, Car, Clock, Info, Users, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl" style={{fontFamily: 'Tajawal, Arial, sans-serif'}}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200 py-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <img src="/lloogo.png" alt="Logo" className="h-12 w-auto mr-4" />
            <h1 className="text-2xl font-bold text-amber-800">
              {import.meta.env.VITE_APP_NAME || "Valet Parking Pro"}
            </h1>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="border-amber-200 text-amber-800 flex items-center"
              asChild
            >
            
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto py-16 px-4">
        <h2 className="text-4xl font-bold text-center mb-4">مرحبًا بك في أفضل نظام لخدمة صف السيارات</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">حل متكامل لإدارة عمليات صف السيارات مع إشعارات فورية وتتبع التذاكر</p>
        
        <div className="grid md:grid-cols-1 gap-10 max-w-5xl mx-auto">
          {/* Request a Car Card */}
         

          {/* Entrance Dashboard Card */}
          <Card className="group transition-all duration-300 hover:shadow-xl border-t-4 border-t-primary overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                مدخل الكراج
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">للعاملين في الكراج لإدارة التذاكر</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 pb-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="bg-secondary text-secondary-foreground rounded-full w-6 h-6 flex items-center justify-center mr-3 shadow-sm group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-foreground">إنشاء تذاكر صف السيارات مع رموز QR</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-secondary text-secondary-foreground rounded-full w-6 h-6 flex items-center justify-center mr-3 shadow-sm group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-foreground">معالجة طلبات استرجاع السيارات</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-secondary text-secondary-foreground rounded-full w-6 h-6 flex items-center justify-center mr-3 shadow-sm group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-foreground">تحديث حالة الدفع</span>
                </li>
                 <li className="flex items-center">
                  <div className="bg-secondary text-secondary-foreground rounded-full w-6 h-6 flex items-center justify-center mr-3 shadow-sm group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-foreground">تحديد الطلبات كمكتملة</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-secondary text-secondary-foreground rounded-full w-6 h-6 flex items-center justify-center mr-3 shadow-sm group-hover:scale-110 transition-transform">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <span className="text-foreground">طباعة إيصالات تذاكر صف السيارات</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-2 pb-4">
              <Link to="/entrance" className="w-full">
                <Button className="w-full gap-2 font-medium shadow transition-all">
                  الدخول إلى لوحة تحكم المدخل
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Valet Dashboard Card */}
          <Card className="group w-full transition-all duration-300 hover:shadow-xl border-t-4 border-t-accent overflow-hidden  mx-auto">
            <CardHeader className="bg-accent text-accent-foreground">
              <CardTitle className="text-2xl flex items-center gap-2">
                <PersonStanding className="h-5 w-5" />
                لوحة تحكم خدمة صف السيارات
              </CardTitle>
              <CardDescription className="text-accent-foreground/80">للعاملين في خدمة صف السيارات لاسترجاع السيارات</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 pb-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="bg-secondary text-secondary-foreground rounded-full w-6 h-6 flex items-center justify-center mr-3 shadow-sm group-hover:scale-110 transition-transform">
                    <Bell className="h-4 w-4" />
                  </div>
                  <span className="text-foreground">استلام إشعارات طلبات استرجاع السيارات</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-secondary text-secondary-foreground rounded-full w-6 h-6 flex items-center justify-center mr-3 shadow-sm group-hover:scale-110 transition-transform">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <span className="text-foreground">قبول ومعالجة الطلبات</span>
                </li>
               
                <li className="flex items-center">
                  <div className="bg-secondary text-secondary-foreground rounded-full w-6 h-6 flex items-center justify-center mr-3 shadow-sm group-hover:scale-110 transition-transform">
                    <Ticket className="h-4 w-4" />
                  </div>
                  <span className="text-foreground">الوصول إلى معلومات التذاكر</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-2 pb-4">
              <Link to="/valet" className="w-full">
                <Button variant="outline" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2 font-medium shadow transition-all">
                  الدخول إلى لوحة تحكم خدمة صف السيارات
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-muted p-6 border-t mt-auto">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground">© {new Date().getFullYear()} The Best Valet</p>
          <div className="mt-3 md:mt-0 flex space-x-6">
            <p className="text-muted-foreground">المالك: عبد الرحمن سعد</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
