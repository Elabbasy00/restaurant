import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface AssignmentDialogProps {
  showPersonAssignmentDialog: boolean;
  setShowPersonAssignmentDialog: () => void;
  personName: string;
  setPersonName: (value: string) => void;
  onSave: () => void;
}
function AssignmentDialog({
  showPersonAssignmentDialog,
  setShowPersonAssignmentDialog,
  personName,
  setPersonName,
  onSave,
}: AssignmentDialogProps) {
  return (
    <Dialog
      open={showPersonAssignmentDialog}
      onOpenChange={setShowPersonAssignmentDialog}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة شخص</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3">
            <Label htmlFor="person-name">الاسم الكامل *</Label>
            <Input
              id="person-name"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="الاسم الكامل"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowPersonAssignmentDialog()}
            >
              إلغاء
            </Button>
            <Button onClick={onSave} disabled={!personName.trim()}>
              حفظ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AssignmentDialog;
