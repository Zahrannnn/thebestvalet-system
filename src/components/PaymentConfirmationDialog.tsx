import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useValet } from "@/context/ValetContext";
import { CreditCard, Banknote } from "lucide-react";

interface PaymentConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  ticketId: string;
  ticketNumber: string;
  price: number;
}

const PaymentConfirmationDialog: React.FC<PaymentConfirmationDialogProps> = ({
  isOpen,
  onClose,
  requestId,
  ticketId,
  ticketNumber,
  price,
}) => {
  const { updateRequestStatus, updatePaymentStatus } = useValet();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'visa'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Mark the ticket as paid and save payment method
      await updatePaymentStatus(ticketId, true, paymentMethod);
      
      // Mark the request as completed
      await updateRequestStatus(requestId, 'completed');
      
      // Close the dialog
      setIsProcessing(false);
      onClose();
    } catch (error) {
      console.error('Error processing payment:', error);
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تأكيد الدفع</DialogTitle>
          <DialogDescription>
            يرجى تأكيد الدفع واختيار طريقة الدفع للتذكرة رقم {ticketNumber}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <div className="mb-4 text-center">
            <span className="text-xl font-bold">{price} ريال</span>
          </div>
          
          <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'cash' | 'visa')} className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2 space-x-reverse border rounded-md p-3 cursor-pointer hover:bg-gray-50" onClick={() => setPaymentMethod('cash')}>
              <RadioGroupItem value="cash" id="cash" className="ml-2" />
              <Label htmlFor="cash" className="font-medium flex items-center cursor-pointer flex-1">
                <Banknote className="ml-2 h-5 w-5 text-green-600" />
                نقداً
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse border rounded-md p-3 cursor-pointer hover:bg-gray-50" onClick={() => setPaymentMethod('visa')}>
              <RadioGroupItem value="visa" id="visa" className="ml-2" />
              <Label htmlFor="visa" className="font-medium flex items-center cursor-pointer flex-1">
                <CreditCard className="ml-2 h-5 w-5 text-blue-600" />
                بطاقة مدى/فيزا
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <DialogFooter className="flex flex-row-reverse sm:justify-start gap-2">
          <Button type="button" variant="default" onClick={handleConfirmPayment} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
            {isProcessing ? 'جاري المعالجة...' : 'تأكيد الدفع وإكمال الطلب'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentConfirmationDialog; 