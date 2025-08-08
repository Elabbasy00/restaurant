import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface PaymentDialogProps {
  showPaymentDialog: boolean;
  setShowPaymentDialog: () => void;
  isPaid: boolean;
  paidAmount: number;
  setPayForm: (key: string, value: any) => void;
  onSave: () => void;
}

function PaymentDialog({
  showPaymentDialog,
  setShowPaymentDialog,
  isPaid,
  paidAmount,
  onSave,
  setPayForm,
}: PaymentDialogProps) {
  return (
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تم الدفع؟</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-paid"
              checked={isPaid}
              onCheckedChange={(checked) => setPayForm("isPaid", !!checked)}
            />
            <Label htmlFor="is-paid">تم الدفع</Label>
          </div>
          {isPaid && (
            <div className="grid gap-3">
              <Label htmlFor="paid-amount">المبلغ المدفوع (L.E)</Label>
              <Input
                id="paid-amount"
                type="number"
                value={paidAmount}
                onChange={(e) =>
                  setPayForm("paidAmount", parseFloat(e.target.value) || 0)
                }
                placeholder="المبلغ المدفوع (L.E)"
              />
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={setShowPaymentDialog}>
              إلغاء
            </Button>
            <Button onClick={onSave}>حفظ</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentDialog;
