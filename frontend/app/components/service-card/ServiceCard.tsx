import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Link } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ShoppingCart, Clock, Star } from "lucide-react";
import { toast } from "sonner";
import type { Service } from "~/types/dataTypes";
import { useCart } from "~/hooks/useCart";

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const { addService } = useCart();

  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

  const handleAddToCart = () => {
    if (service.requires_booking) {
      setShowBookingDialog(true);
    } else {
      addService(service, 1);
      toast.success(`${service.name} تمت إضافته إلى سلة التسوق`);
    }
  };

  const handleBookingSubmit = () => {
    if (!selectedDate || !selectedTime || !customerName.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const scheduledTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(":");
    scheduledTime.setHours(parseInt(hours), parseInt(minutes));

    addService(service, 1, {
      id: service.id,
      scheduledTime: scheduledTime.toISOString(),
      customerName,
      customerPhone,
      notes,
    });

    toast.success(`${service.name} تمت إضافته إلى سلة التسوق`);
    setShowBookingDialog(false);

    // Reset form
    setSelectedDate(undefined);
    setSelectedTime("");
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
  };

  // Generate available time slots (9 AM to 9 PM, every hour)
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 9;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  return (
    <>
      <Card className="w-full p-0 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
        <Link to={`/dashboard/services/${service.slug}`}>
          <CardHeader className="p-0">
            <div className="relative">
              <img
                src={service.image || "/placeholder-service.jpg"}
                alt={service.name}
                className="h-48 w-full object-cover rounded-t-xl"
              />
              {service.requires_booking && (
                <Badge className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  Booking Required
                </Badge>
              )}
              <div className="absolute top-2 left-2">
                <Badge
                  variant="secondary"
                  className="bg-white/90 text-gray-700"
                >
                  {service?.category?.name}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Link>

        <CardContent className="px-4 py-3">
          <Link to={`/dashboard/services/${service.slug}`}>
            <h3 className="text-lg font-bold text-black truncate block capitalize mb-1">
              {service.name}
            </h3>
            <p className="text-gray-400 text-sm mt-1 line-clamp-2 mb-3">
              {service.description}
            </p>
          </Link>

          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between items-center">
              <span className="text-xs text-gray-500">سعر الخدمة</span>
              <span className="text-xl font-bold text-primary">
                {parseFloat(service.price.toString()).toFixed(2)} L.E
              </span>
            </div>

            <Button
              size="sm"
              onClick={handleAddToCart}
              className="flex items-center gap-2"
            >
              {service.requires_booking ? (
                <>
                  <CalendarIcon className="h-4 w-4" />
                  حجز الآن
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  أضف إلى سلة التسوق
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              حجز {service.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Service Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                <img
                  src={service.image || "/placeholder-service.jpg"}
                  alt={service.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{service.name}</h4>
                    <span className="text-primary font-bold">
                      {parseFloat(service.price.toString()).toFixed(2)} L.E
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {service.description}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {service?.category?.name}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-3">
              <h4 className="font-medium">معلومات العميل</h4>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="customerName">اسم العميل *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="أدخل اسم العميل"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customerPhone">رقم الهاتف</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <Label>اختر التاريخ *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">ملاحظات خاصة</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي طلبات خاصة أو ملاحظات..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBookingDialog(false)}
            >
              إلغاء
            </Button>
            <Button onClick={handleBookingSubmit}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              أضف الحجز إلى سلة التسوق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ServiceCard;
