import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { useCart } from "~/hooks/useCart";

import { useCreateOrderMutation } from "~/redux/order/orderApi";
import { useGetAvailableTablesQuery } from "~/redux/table/tableApi";
import {
  ShoppingBag,
  CreditCard,
  User,
  Loader2,
  Users,
  Settings,
  UserPlus,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import type { CartItem } from "~/redux/cart/cartSlice";
import type {
  CartService,
  OrderData,
  OrderItemData,
  OrderServiceData,
  Service,
  Table,
} from "~/types/dataTypes";
import PaymentDialog from "~/components/paymanet-dialog/PaymentDialog";
import AssignmentDialog from "~/components/assignment-dialog/AssignmentDialog";

const Checkout: React.FC = () => {
  const { cart, emptyCart, removeCartItem, assginPerson, paymentStatus } =
    useCart();
  const navigate = useNavigate();

  // Redux state

  // API hooks
  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateOrderMutation();
  const { data: availableTables = [] } = useGetAvailableTablesQuery(undefined);
  // Local state
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");

  const [showPersonAssignmentDialog, setShowPersonAssignmentDialog] =
    useState(false);

  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedItemForAssignment, setSelectedItemForAssignment] = useState<
    string | null
  >(null);
  const [selectedItemForPayment, setSelectedItemForPayment] = useState<
    string | null
  >(null);
  const [personName, setPersonName] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    isPaid: false,
    paidAmount: 0,
  });

  const [table, setTable] = useState<Table | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
  });
  const [taxEnabled, setTaxEnabled] = useState(true);
  const services = useMemo(() => {
    return (
      cart?.items?.filter((item: CartItem) => item.type === "service") || []
    );
  }, [cart?.items]);

  const items = useMemo(() => {
    return cart?.items?.filter((item: CartItem) => item.type === "item") || [];
  }, [cart?.items]);

  // Redirect if cart is empty and no services
  useEffect(() => {
    if (cart.items.length === 0) {
      toast.warning("السلة فارغة", {
        description: "الرجاء إضافة منتجات أو خدمات إلى سلة التسوق قبل الدفع.",
      });
      navigate("/dashboard/menu");
    }
  }, [cart.items.length, services.length, navigate]);

  // Handle customer info changes
  const handleCustomerInfoChange = (
    field: keyof typeof customerInfo,
    value: string
  ) => {
    setCustomerInfo({ ...customerInfo, [field]: value });
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!customerInfo.name.trim()) {
      toast.error("خطأ في التحقق", {
        description: "اسم العميل مطلوب.",
      });
      return false;
    }

    if (!table) {
      toast.error("خطأ في التحقق", {
        description: "الرجاء تحديد مكتب لطلبات الدine-in.",
      });
      return false;
    }

    return true;
  };

  // Convert cart items to order items format
  const convertCartToOrderItems = (): OrderItemData[] => {
    return items.map((cartItem: CartItem) => {
      return {
        item: cartItem.productId,
        quantity: cartItem.quantity,
        item_variations: cartItem.selectedVariations.map((v) => v.optionId),
        notes: "",
        person_name: cartItem?.person_name || "",
        is_paid: cartItem?.itemPaymentStatus?.isPaid || false,
        paid_amount: cartItem?.itemPaymentStatus?.paidAmount || 0,
      };
    });
  };

  // Convert services to order services format
  const convertServicesToOrderServices = (): OrderServiceData[] => {
    return services.map((service: CartItem) => {
      return {
        service: service.serviceId,
        quantity: service.quantity,
        person_name: service?.person_name || "",
        is_paid: service?.itemPaymentStatus?.isPaid || false,
        paid_amount: service?.itemPaymentStatus?.paidAmount || 0,
        booking_id: service.booking?.id,
      };
    });
  };

  // Calculate totals with tax
  const calculateTotals = () => {
    const itemsSubtotal = cart.subtotal;
    const servicesSubtotal = services.reduce(
      (sum: number, service: CartService) =>
        sum + service.price * service.quantity,
      0
    );
    const subtotal = itemsSubtotal + servicesSubtotal;
    const tax = taxEnabled ? subtotal * 0.14 : 0; // 14% tax rate
    const total = subtotal + tax;

    return { subtotal, tax, total, itemsSubtotal, servicesSubtotal };
  };

  const totals = calculateTotals();

  // Handle person assignment
  const handlePersonAssignment = (itemId: string) => {
    setSelectedItemForAssignment(itemId);
    const currentAssignment = cart.items.find(
      (item: CartItem) => item.id === itemId
    );
    setPersonName(currentAssignment?.itemPersonAssignments?.name || "");
    setShowPersonAssignmentDialog(true);
  };

  // Save person assignment
  const savePersonAssignment = () => {
    if (!selectedItemForAssignment) return;

    assginPerson(selectedItemForAssignment, personName);

    setShowPersonAssignmentDialog(false);
    setSelectedItemForAssignment(null);
    setPersonName("");
  };

  const togglePaymentDailog = useCallback(() => {
    setShowPaymentDialog((prev) => !prev);
  }, []);

  const togglePersonAssignmentDialog = useCallback(() => {
    setShowPersonAssignmentDialog((prev) => !prev);
  }, []);

  const changePayForm = useCallback(
    (key: string, value: any) => {
      setPaymentForm({ ...paymentForm, [key]: value });
    },
    [paymentForm]
  );

  const changePersonForm = useCallback(
    (value: any) => {
      setPersonName(value);
    },
    [personName]
  );
  // Handle payment status

  const handlePaymentStatus = (itemId: string) => {
    setSelectedItemForPayment(itemId);
    const currentPayment = cart?.items?.find(
      (item: CartItem) => item.id === itemId
    );

    setPaymentForm({
      isPaid: currentPayment?.itemPaymentStatus?.isPaid || false,
      paidAmount: currentPayment?.itemPaymentStatus?.paidAmount || 0,
    });
    setShowPaymentDialog(true);
  };

  // Save payment status
  const savePaymentStatus = () => {
    if (!selectedItemForPayment) return;

    // const isService = selectedItemForPayment.startsWith("service-");

    paymentStatus(
      selectedItemForPayment,
      paymentForm.isPaid,
      paymentForm.paidAmount
    );
    // if (isService) {
    //   dispatch(
    //     setServicePaymentStatus({
    //       serviceId: selectedItemForPayment,
    //       isPaid: paymentForm.isPaid,
    //       paidAmount: paymentForm.paidAmount,
    //     })
    //   );
    // } else {
    //   dispatch(
    //     setItemPaymentStatus({
    //       itemId: selectedItemForPayment,
    //       isPaid: paymentForm.isPaid,
    //       paidAmount: paymentForm.paidAmount,
    //     })
    //   );
    // }

    setShowPaymentDialog(false);
    setSelectedItemForPayment(null);
    setPaymentForm({ isPaid: false, paidAmount: 0 });
  };

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    try {
      const orderData: OrderData = {
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        table_id: table?.id,
        tax_enabled: taxEnabled,
        items: convertCartToOrderItems(),
        order_services: convertServicesToOrderServices(),
      };

      const result = await createOrder(orderData).unwrap();

      toast.success("تم تقديم الطلب بنجاح!", {
        description: `تم إنشاء الطلب #${result.ref_code}.`,
      });

      // Clear cart and redirect
      emptyCart();
      navigate(`/dashboard/orders/${result.id}`);
    } catch (error: any) {
      console.error("Order submission error:", error);
      toast.error("فشل في تقديم الطلب", {
        description:
          error?.data?.message ||
          "حدث خطأ أثناء تقديم الطلب. يرجى المحاولة مرة أخرى.",
      });
    }
  };

  if (cart.items.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-8 w-8" />
          تأكيد الطلب
        </h1>
        <p className="text-gray-600 mt-2">تأكيد الطلب وانتهاء عملية الشراء</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Table Selection (only for dine-in) */}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                اختيار الطاولة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={table?.id.toString()}
                onValueChange={(value) => {
                  const table = availableTables.find(
                    (t) => t.id.toString() === value
                  );
                  setTable(table!);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختار طاولة" />
                </SelectTrigger>
                <SelectContent>
                  {availableTables.map((table) => (
                    <SelectItem key={table.id} value={table.id.toString()}>
                      {table.area.name} - طاولة {table.number} (سعة:{" "}
                      {table.capacity}) افراد
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                بيانات العميل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">الاسم الكامل *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) =>
                      handleCustomerInfoChange("name", e.target.value)
                    }
                    placeholder="الاسم الكامل"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      handleCustomerInfoChange("phone", e.target.value)
                    }
                    placeholder="رقم الهاتف"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items with Person Assignment */}
          {cart.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  تفاصيل الطلب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item: CartItem) => {
                    return (
                      <div
                        key={item.id}
                        className="flex items-start space-x-4 p-4 border rounded-lg"
                      >
                        <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-x-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            كمية: {item.quantity}
                          </p>

                          {/* Variations */}
                          {item.selectedVariations.length > 0 && (
                            <div className="mt-1 space-y-1">
                              {item.selectedVariations.map((variation) => (
                                <div
                                  key={`${variation.variationId}-${variation.optionId}`}
                                  className="text-xs text-gray-500"
                                >
                                  {variation.variationName}:{" "}
                                  {variation.optionValue}
                                  {variation.extraPrice > 0 && (
                                    <span className="ml-1">
                                      (+{variation.extraPrice.toFixed(2)} L.E)
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Person Assignment */}
                          {item.person_name && (
                            <Badge variant="outline" className="mt-2">
                              <Users className="h-3 w-3 mr-1" />
                              {item.person_name}
                            </Badge>
                          )}

                          {/* Payment Status */}
                          {item?.itemPaymentStatus?.isPaid && (
                            <Badge variant="default" className="mt-2 ml-2">
                              <DollarSign className="h-3 w-3 mr-1" />
                              دفع:{" "}
                              {item?.itemPaymentStatus?.paidAmount.toFixed(
                                2
                              )}{" "}
                              L.E
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-col space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePersonAssignment(item.id)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            تعيين
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePaymentStatus(item.id)}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            الدفع
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeCartItem(item.id)}
                          >
                            حذف
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {(item.price * item.quantity).toFixed(2)} L.E
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Services Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  الخدمات
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  لم تتم إضافة أي خدمات بعد
                </p>
              ) : (
                <div className="space-y-4">
                  {services.map((service: CartItem) => {
                    return (
                      <div
                        key={service.id}
                        className="flex items-start space-x-4 p-4 border rounded-lg"
                      >
                        <div className="flex-1 space-x-1">
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-gray-600">
                            كمية: {service.quantity}
                          </p>
                          {/* 
                          {service.notes && (
                            <p className="text-sm text-gray-500 mt-1">
                              Note: {service.notes}
                            </p>
                          )} */}

                          {/* Person Assignment */}
                          {service.person_name && (
                            <Badge variant="outline" className="mt-2">
                              <Users className="h-3 w-3 mr-1" />
                              {service.person_name}
                            </Badge>
                          )}

                          {/* Payment Status */}
                          {service?.itemPaymentStatus?.isPaid && (
                            <Badge variant="default" className="mt-2 ml-2">
                              <DollarSign className="h-3 w-3 mr-1" />
                              دفع:{" "}
                              {service?.itemPaymentStatus?.paidAmount.toFixed(
                                2
                              )}{" "}
                              L.E
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-col space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePersonAssignment(service.id)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            تعيين
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePaymentStatus(service.id)}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            الدفع
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeCartItem(service.id)}
                          >
                            حذف
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {(service.price * service.quantity).toFixed(2)} L.E
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Place Order Button */}
          <Button
            onClick={handleSubmitOrder}
            disabled={isCreatingOrder}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            {isCreatingOrder ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                إنشاء الطلب...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                إنشاء الطلب - {totals.total.toFixed(2)} L.E
              </>
            )}
          </Button>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tax Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="tax-toggle" className="text-sm font-medium">
                  تضمين الضريبة (14%)
                </Label>
                <Switch
                  id="tax-toggle"
                  checked={taxEnabled}
                  onCheckedChange={(checked) => setTaxEnabled(checked)}
                />
              </div>

              <Separator />

              {/* Order Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">المجموع</span>
                  <span>{totals.itemsSubtotal.toFixed(2)} L.E</span>
                </div>
                {totals.servicesSubtotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">المجموع</span>
                    <span>{totals.servicesSubtotal.toFixed(2)} L.E</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">المجموع</span>
                  <span>{totals.subtotal.toFixed(2)} L.E</span>
                </div>
                {taxEnabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">الضريبة (14%)</span>
                    <span>{totals.tax.toFixed(2)} L.E</span>
                  </div>
                )}

                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>المجموع</span>
                  <span>{totals.total.toFixed(2)} L.E</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                طريقة الدفع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value: "cash" | "card") =>
                  setPaymentMethod(value)
                }
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="cursor-pointer flex-1">
                    <div className="font-medium">الدفع نقدًا</div>
                    <div className="text-sm text-gray-500">ادفع نقدا</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="cursor-pointer flex-1">
                    <div className="font-medium">بطاقة الائتمان/الائتمان</div>
                    <div className="text-sm text-gray-500">الدفع بالبطاقة</div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Person Assignment Dialog */}

      <AssignmentDialog
        showPersonAssignmentDialog={showPersonAssignmentDialog}
        setShowPersonAssignmentDialog={togglePersonAssignmentDialog}
        personName={personName}
        setPersonName={setPersonName}
        onSave={savePersonAssignment}
      />

      <PaymentDialog
        showPaymentDialog={showPaymentDialog}
        setShowPaymentDialog={togglePaymentDailog}
        isPaid={paymentForm.isPaid}
        setPayForm={changePayForm}
        paidAmount={paymentForm.paidAmount}
        onSave={savePaymentStatus}
      />
    </div>
  );
};

export default Checkout;
