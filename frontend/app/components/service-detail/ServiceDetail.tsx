import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  Clock,
  Users,
  ShoppingCart,
  Star,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import type { Service } from "~/types/dataTypes";
import { useCart } from "~/hooks/useCart";

interface ServiceDetailProps {
  service: Service;
}

export const ServiceDetail: React.FC<ServiceDetailProps> = ({ service }) => {
  const { addService } = useCart();

  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 9;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  const handleAddToCart = () => {
    if (service.requires_booking) {
      setShowBookingDialog(true);
    } else {
      addService(service, quantity);
      toast.success(`${service.name} added to cart`);
    }
  };

  const handleBookingSubmit = () => {
    if (!selectedDate || !selectedTime || !customerName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const scheduledTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(":");
    scheduledTime.setHours(parseInt(hours), parseInt(minutes));

    addService(service, quantity, {
      id: service.id,
      scheduledTime: scheduledTime.toISOString(),
      customerName,
      customerPhone,
      notes,
    });

    toast.success(`${service.name} booking added to cart`);
    setShowBookingDialog(false);

    // Reset form
    setSelectedDate(undefined);
    setSelectedTime("");
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link to="/dashboard/services">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            الرجوع
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Service Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src={service.image || "/placeholder-service.jpg"}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        {/* Right side - Service Info */}
        <div className="space-y-6">
          {/* Service Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{service.category.name}</Badge>
              {service.requires_booking && (
                <Badge className="bg-blue-500">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  الحجز مطلوب
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-2">{service.name}</h1>
          </div>

          {/* Price */}
          <div className="text-3xl font-bold text-primary">
            {parseFloat(service.price.toString()).toFixed(2)} L.E
            <span className="text-sm font-normal text-gray-500 ml-2">
              لكل خدمة
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">الوصف</h3>
            <p className="text-gray-600 leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Quantity Selector (for non-booking services) */}
          {!service.requires_booking && (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">الكمية:</span>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-10 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full h-12 text-lg" onClick={handleAddToCart}>
              {service.requires_booking ? (
                <>
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  حجز الآن - {parseFloat(service.price.toString()).toFixed(
                    2
                  )}{" "}
                  L.E
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  اضف الى السلة -{" "}
                  {(parseFloat(service.price.toString()) * quantity).toFixed(
                    2
                  )}{" "}
                  L.E
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              حجز {service.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Service Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-4">
                <img
                  src={service.image || "/placeholder-service.jpg"}
                  alt={service.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-lg">{service.name}</h4>
                    <span className="text-primary font-bold text-xl">
                      {parseFloat(service.price.toString()).toFixed(2)} L.E
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      30-45 min
                    </span>
                    <Badge variant="outline">{service.category.name}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <h4 className="font-semibold">Customer Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="space-y-4">
              <h4 className="font-semibold">Booking Details</h4>

              {/* Date Selection */}
              <div>
                <Label>Select Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate
                        ? format(selectedDate, "PPP")
                        : "Pick a date"}
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

              {/* Time Selection */}
              <div>
                <Label htmlFor="time">Select Time *</Label>
                <select
                  id="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity for booking services */}
              <div className="flex items-center space-x-4">
                <Label>Number of People:</Label>
                <div className="flex items-center border rounded-md">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {/* Special Notes */}
            <div>
              <Label htmlFor="notes">Special Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests, preferences, or notes..."
                rows={4}
              />
            </div>

            {/* Booking Summary */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h5 className="font-semibold mb-2">Booking Summary</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span>{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>
                    {selectedDate
                      ? format(selectedDate, "PPP")
                      : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span>{selectedTime || "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span>People:</span>
                  <span>{quantity}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>
                    {(parseFloat(service.price.toString()) * quantity).toFixed(
                      2
                    )}{" "}
                    L.E
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBookingDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleBookingSubmit}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Confirm Booking -{" "}
              {(parseFloat(service.price.toString()) * quantity).toFixed(2)} L.E
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceDetail;
