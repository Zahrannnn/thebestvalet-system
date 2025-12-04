import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  password: string;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: boolean;
  submitButtonText: string;
  submitButtonClassName?: string;
  icon: LucideIcon;
  iconColor?: string;
}

export const PasswordDialog: React.FC<PasswordDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  password,
  onPasswordChange,
  onSubmit,
  error,
  submitButtonText,
  submitButtonClassName = "bg-amber-600 hover:bg-amber-700 text-white",
  icon: Icon,
  iconColor = "text-amber-600",
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-amber-800">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="relative">
            <Icon className={cn("absolute right-3 top-3 h-5 w-5", iconColor)} />
            <Input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className={cn(
                "pr-10 border-amber-200 focus:border-amber-400 focus:ring-amber-400",
                error && "border-red-500 animate-shake"
              )}
              placeholder="أدخل كلمة المرور"
              dir="rtl"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">
              كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.
            </p>
          )}

          <DialogFooter className="sm:justify-center">
            <Button type="submit" className={submitButtonClassName}>
              {submitButtonText}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-amber-200"
            >
              إلغاء
            </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
  );
};

