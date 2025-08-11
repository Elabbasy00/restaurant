import React, { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  useCancelOrderMutation,
  useGetOrderByIdQuery,
  useUpdateOrderItemMutation,
  // useUpdateOrderPaymentMutation,
  // useCancelOrderMutation,
  // useSendReceiptEmailMutation,
} from "~/redux/order/orderApi";
import { format } from "date-fns";
import {
  Receipt,
  User,
  MapPin,
  Clock,
  CreditCard,
  Users,
  ShoppingBag,
  Settings,
  Printer,
  Mail,
  CheckCircle,
  XCircle,
  Edit,
  DollarSign,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import PageLoading from "~/components/loading/PageLoading";
import ErrorAlert from "~/components/error-alert/ErrorAlert";
import { ar } from "date-fns/locale";
import type { Order, OrderItem } from "~/types/dataTypes";
import AssignmentDialog from "~/components/assignment-dialog/AssignmentDialog";
import type { CartItem } from "~/redux/cart/cartSlice";
import PaymentDialog from "~/components/paymanet-dialog/PaymentDialog";

const OrderPaymentStatus = {
  pending: {
    name: "قيد الانتظار",
    color: "bg-yellow-500",
  },
  paid: {
    name: "مدفوع",
    color: "bg-green-500",
  },
  partial: {
    name: "جزئي",
    color: "bg-blue-500",
  },
  refunded: {
    name: "مسترد",
    color: "bg-red-500",
  },
} as const;

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useGetOrderByIdQuery(parseInt(orderId!), { skip: !orderId });
  const [updateOrderItem] = useUpdateOrderItemMutation();
  // const [updateOrderPayment] = useUpdateOrderPaymentMutation();
  const [cancelOrder] = useCancelOrderMutation();
  // const [sendReceiptEmail] = useSendReceiptEmailMutation();

  // Dialog states
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPersonAssignDialog, setShowPersonAssignDialog] = useState(false);

  // Form states
  const [emailAddress, setEmailAddress] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [selectedItemId, setSelectedItemId] = useState<{
    id: number;
    type: string;
  } | null>(null);

  const [showItemPaymentDialog, setShowItemPaymentDialog] = useState(false);
  const [personName, setPersonName] = useState("");
  const [itemPaymentForm, setItemPaymentForm] = useState({
    isPaid: false,
    paidAmount: 0,
  });

  const calculateItemPrice = (item: any) => {
    const basePrice =
      item.item?.discount_price && item.item.discount_price > 0
        ? parseFloat(item.item.discount_price.toString())
        : parseFloat(item.item?.price?.toString() || "0");

    const variationsPrice = (item.item_variations || []).reduce(
      (sum: number, variation: any) => {
        const extraPrice = parseFloat(
          variation?.extra_price?.toString() || "0"
        );
        return sum + extraPrice;
      },
      0
    );

    return basePrice + variationsPrice;
  };

  const calculateServicePrice = (service: any) => {
    return parseFloat(service.service?.price?.toString() || "0");
  };

  const calculateSubtotal = () => {
    const itemsTotal = (order?.order_items || []).reduce(
      (sum: number, item: any) => {
        const unitPrice = calculateItemPrice(item);
        const quantity = parseInt(item.quantity?.toString() || "0");
        return sum + unitPrice * quantity;
      },
      0
    );

    const servicesTotal = (order?.order_services || []).reduce(
      (sum: number, service: any) => {
        const unitPrice = calculateServicePrice(service);
        const quantity = parseInt(service.quantity?.toString() || "0");
        return sum + unitPrice * quantity;
      },
      0
    );

    return itemsTotal + servicesTotal;
  };

  const subtotal = calculateSubtotal();
  const taxRate = parseFloat(order?.tax_rate?.toString() || "0.14");
  const tax = order?.tax_enabled ? subtotal * taxRate : 0;
  const total = subtotal + tax;

  // Generate receipt content for printing
  const generateReceiptContent = () => {
    return `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <title>فاتورة - الطلب #${order.ref_code || order.id}</title>
        <style>
  
          body { font-family: Arial, sans-serif; max-width: 100%; margin: 0 auto; padding:10px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .order-info { margin-bottom: 20px; }
          .items { margin-bottom: 20px; }
          .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .totals { border-top: 1px solid #000; padding-top: 10px; }
          .total-line { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .final-total { font-weight: bold; font-size: 1.2em; border-top: 1px solid #000; padding-top: 5px; }
          @media print { body { margin: 0 0; padding: 0px, max-width: 80mm; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Sina star</h2>
        </div>
        
        <div class="order-info">
          <p style="font-size: 0.9em;"><strong>طلب #:</strong> ${
            order.ref_code || order.id
          }</p>
          <p style="font-size: 0.9em;"><strong>تاريخ:</strong> ${format(
            new Date(order.created_at),
            "PPP 'at' p",
            { locale: ar }
          )}</p>
          <p style="font-size: 0.9em;"><strong>العميل:</strong> ${
            order.customer_name || "N/A"
          }</p>
          ${
            order.customer_phone
              ? `<p style="font-size: 0.9em;"><strong>رقم الهاتف:</strong> ${order.customer_phone}</p>`
              : ""
          }
          ${
            order.table
              ? `<p style="font-size: 0.9em;"><strong>الطاولة:</strong> ${order.table.area?.name} - طاولة ${order.table.number}</p>`
              : ""
          }
        </div>
        
        <div class="items">
          <h3>المنتجات:</h3>
          ${(order.order_items || [])
            .map((item: any) => {
              const unitPrice = calculateItemPrice(item);
              const quantity = parseInt(item.quantity?.toString() || "0");
              const totalPrice = unitPrice * quantity;
              return `
              <div class="item">
                <span>${quantity}x ${item.item?.name || "عنصر غير معرف"}</span>
                <span>${totalPrice.toFixed(2)} L.E</span>
              </div>
              ${(item.item_variations || [])
                .map(
                  (variation: any) =>
                    `<div style="margin-right: 20px; font-size: 0.8em; color: #333;">
                  + ${variation.value} (+${parseFloat(
                      variation.extra_price?.toString() || "0"
                    ).toFixed(2)} L.E)
                </div>`
                )
                .join("")}
              ${
                item.person_name
                  ? `<div style="margin-right: 20px; font-size: 0.8em; color: #333;">مُخصص لـ: ${item.person_name}</div>`
                  : ""
              }
            `;
            })
            .join("")}
          
          ${
            (order?.order_services || []).length > 0
              ? `
            <h3>الخدمات:</h3>
            ${(order?.order_services || [])
              .map((service: any) => {
                const unitPrice = calculateServicePrice(service);
                const quantity = parseInt(service.quantity?.toString() || "0");
                const totalPrice = unitPrice * quantity;
                return `
                <div class="item">
                  <span>${quantity}x ${
                  service.service?.name || "خدمة غير معرفة"
                }</span>
                  <span>${totalPrice.toFixed(2)} L.E</span>
                </div>
                ${
                  service.person_name
                    ? `<div style="margin-right: 20px; font-size: 0.8em; color: #333;">مسجل ل: ${service.person_name}</div>`
                    : ""
                }
              `;
              })
              .join("")}
          `
              : ""
          }
        </div>
        
        <div class="totals">
          <div class="total-line">
            <span>المجموع الفرعي:</span>
            <span>${subtotal.toFixed(2)} L.E</span>
          </div>
          ${
            order.tax_enabled
              ? `
            <div class="total-line">
              <span>ضريبة (${(taxRate * 100).toFixed(0)}%):</span>
              <span>${tax.toFixed(2)} L.E</span>
            </div>
          `
              : ""
          }
          <div class="total-line final-total">
            <span>الاجمالي:</span>
            <span>${total.toFixed(2)} L.E</span>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; font-size: 0.9em;">
          <p>شكرا لزيارتكم لنا..!</p>
          <p>حالة الدفع: ${
            OrderPaymentStatus[
              order.payment_status as keyof typeof OrderPaymentStatus
            ]?.name
          }</p>
        </div>
      </body>
      </html>
    `;
  };

  // const handleMarkAsPaid = async () => {
  //   try {
  //     await updateOrderPayment({
  //       orderId: order.id,
  //       paymentStatus: "paid",
  //     }).unwrap();

  //     toast.success("Order marked as paid");
  //     refetch();
  //   } catch (error) {
  //     toast.error("Failed to update payment status");
  //   }
  // };

  const toggleItemPaymentDialog = useCallback(() => {
    setShowItemPaymentDialog(!showItemPaymentDialog);
  }, [showItemPaymentDialog]);

  const togglePersonAssignmentDialog = useCallback(() => {
    setShowPersonAssignDialog(!showPersonAssignDialog);
  }, [showPersonAssignDialog]);

  const changeItemPayForm = useCallback(
    (key: string, value: any) => {
      setItemPaymentForm({ ...itemPaymentForm, [key]: value });
    },
    [itemPaymentForm]
  );

  const changePersonName = useCallback((value: string) => {
    setPersonName(value);
  }, []);
  const handlePrintReceipt = () => {
    setShowPrintDialog(true);

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(generateReceiptContent());
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        // printWindow.close();
        setShowPrintDialog(false);
      };
    } else {
      toast.error(
        "رسالة الطباعة لم يتم إنشاؤها بنجاح. يرجى التحقق من إعدادات الطابعة."
      );
      setShowPrintDialog(false);
    }
  };

  const handleSendEmailReceipt = async () => {
    if (!emailAddress.trim()) {
      toast.error("الرجاء إدخال عنوان البريد الإلكتروني");
      return;
    }

    try {
      // await sendReceiptEmail({
      //   orderId: order.id,
      //   email: emailAddress,
      //   receiptContent: generateReceiptContent(),
      // }).unwrap();

      toast.success("تم إرسال إيصال البريد الإلكتروني بنجاح");
      setShowEmailDialog(false);
      setEmailAddress("");
    } catch (error) {
      toast.error("فشل في إرسال إيصال البريد الإلكتروني");
    }
  };

  const handleCancelOrder = async () => {
    if (
      window.confirm(
        "هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
      )
    ) {
      try {
        await cancelOrder(order.id).unwrap();
        toast.success("تم إلغاء الطلب بنجاح");
        refetch();
      } catch (error) {
        toast.error("فشل في إلغاء الطلب");
      }
    }
  };

  const handlePartialPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    try {
      // await updateOrderPayment({
      //   orderId: order.id,
      //   // paymentAmount: parseFloat(paymentAmount),
      //   paymentMethod: selectedPaymentMethod,
      // }).unwrap();

      toast.success("Payment recorded successfully");
      setShowPaymentDialog(false);
      setPaymentAmount("");
      refetch();
    } catch (error) {
      toast.error("Failed to record payment");
    }
  };

  const handleAssignPerson = async () => {
    if (!personName.trim()) {
      toast.error("الرجاء إدخال اسم الشخص");
      return;
    }

    if (!selectedItemId?.id) {
      toast.error("الرجاء تحديد عنصر");
      return;
    }

    try {
      updateOrderItem({
        order_id: order.id,
        order_item_id: selectedItemId.id,
        type: selectedItemId.type,
        person_name: personName,
      }).then(() => {
        setShowPersonAssignDialog(false);
        setSelectedItemId(null);
      });
    } catch (error) {
      toast.error("فشل في تعيين الشخص");
    }
  };

  const handleItemPaymentUpdate = async () => {
    if (!selectedItemId?.id) {
      toast.error("الرجاء تحديد عنصر");
      return;
    }

    try {
      updateOrderItem({
        order_id: order.id,
        order_item_id: selectedItemId.id,
        type: selectedItemId.type,
        is_paid: itemPaymentForm.isPaid,
        paid_amount: itemPaymentForm.paidAmount,
      }).then(() => {
        setShowItemPaymentDialog(false);
        setSelectedItemId(null);
      });
    } catch (error) {
      toast.error("فشل في تعيين الشخص");
    }
  };

  const onClickAssgin = (item: OrderItem, type: string) => {
    setSelectedItemId({ id: item.id, type });
    setPersonName(item.person_name);
    setShowPersonAssignDialog(true);
  };
  const onPaymentItemClick = (item: OrderItem, type: string) => {
    setSelectedItemId({ id: item.id, type });
    setItemPaymentForm({ isPaid: item.is_paid, paidAmount: item.paid_amount });
    setShowItemPaymentDialog(true);
  };

  const isFullyPaid = useCallback((item: OrderItem) => {
    const item_price = item?.item?.price || item?.item?.discount_price;
    if (item && item.is_paid && item.paid_amount >= item_price) {
      return true;
    }
    return false;
  }, []);
  if (isLoading) {
    return <PageLoading text="جار تحميل بيانات الطلب" />;
  }

  if (error || !order) {
    return (
      <ErrorAlert text=" حدث خطأ أثناء تحميل بيانات الطلب او الطلب غير موجود" />
    );
  }
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Receipt className="h-8 w-8" />
              طلب #{order.ref_code || order.id}
            </h1>
            <p className="text-gray-600 mt-2">
              تم إنشاؤه في{" "}
              {format(new Date(order.created_at), "PPP 'at' p", {
                locale: ar,
              })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              className={
                order?.cancelled
                  ? "bg-red-100 text-red-800"
                  : order.payment_status === "paid"
                  ? "bg-green-100 text-green-800"
                  : order.payment_status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : order.payment_status === "partial"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-red-100 text-red-800"
              }
            >
              {order?.cancelled
                ? "ملغي"
                : OrderPaymentStatus[
                    order.payment_status as keyof typeof OrderPaymentStatus
                  ]?.name}
            </Badge>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                معلومات العميل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    الاسم:
                  </span>
                  <p className="font-medium">{order.customer_name || "N/A"}</p>
                </div>
                {order.customer_phone && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      الهاتف:
                    </span>
                    <p className="font-medium">{order.customer_phone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Table Information */}
          {order.table && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  معلومات الطاولة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      المكان:
                    </span>
                    <p className="font-medium">
                      {order.table.area?.name || "Unknown Area"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      رقم الطاولة:
                    </span>
                    <p className="font-medium">#{order.table.number}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      السعة:
                    </span>
                    <p className="font-medium">{order.table.capacity} people</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          {order?.order_items && order?.order_items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  المنتجات ({order.order_items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items.map((item: any) => {
                    const unitPrice = calculateItemPrice(item);
                    const quantity = parseInt(item.quantity?.toString() || "0");
                    const totalPrice = unitPrice * quantity;
                    const basePrice =
                      item.item?.discount_price && item.item.discount_price > 0
                        ? parseFloat(item.item.discount_price.toString())
                        : parseFloat(item.item?.price?.toString() || "0");

                    return (
                      <div
                        key={item.id}
                        className="flex items-start space-x-4 pb-4 border-b last:border-b-0"
                      >
                        <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={
                              item.item?.product_image ||
                              "/placeholder-image.jpg"
                            }
                            alt={item.item?.name || "Unknown Item"}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-lg">
                                {item.item?.name || "Unknown Item"}
                              </h4>

                              {/* Item Details */}
                              <div className="mt-1 space-y-1">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">الكمية:</span>{" "}
                                  {quantity}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">
                                    السعر الاساسي:
                                  </span>{" "}
                                  {basePrice.toFixed(2)} L.E
                                </p>
                                {item.item?.discount_price &&
                                  item.item.discount_price > 0 && (
                                    <p className="text-sm text-green-600">
                                      <span className="font-medium">
                                        تم تطبيق الخصم:
                                      </span>
                                      {(
                                        parseFloat(item.item.price.toString()) -
                                        parseFloat(
                                          item.item.discount_price.toString()
                                        )
                                      ).toFixed(2)}{" "}
                                      L.E خصم
                                    </p>
                                  )}
                              </div>

                              {/* Variations */}
                              {item.item_variations &&
                                item.item_variations.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    <p className="text-sm font-medium text-gray-700">
                                      المتغيرات:
                                    </p>
                                    {item.item_variations.map(
                                      (variation: any) => (
                                        <div
                                          key={variation.id}
                                          className="text-sm text-gray-600 ml-2 flex items-center justify-between"
                                        >
                                          <span>
                                            •{" "}
                                            {variation.value ||
                                              "Unknown Variation"}
                                          </span>
                                          {variation.extra_price &&
                                            parseFloat(
                                              variation.extra_price.toString()
                                            ) > 0 && (
                                              <span className="text-green-600 font-medium">
                                                +
                                                {parseFloat(
                                                  variation.extra_price.toString()
                                                ).toFixed(2)}{" "}
                                                L.E
                                              </span>
                                            )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}

                              {/* Person Assignment */}
                              <div className="mt-2 flex items-center justify-between">
                                {item.person_name ? (
                                  <Badge variant="outline" className="text-xs">
                                    <Users className="h-3 w-3 mr-1" />
                                    {item.person_name}
                                  </Badge>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      onClickAssgin(item, "item");
                                      setShowPersonAssignDialog(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    تعيين شخص
                                  </Button>
                                )}
                              </div>

                              {/* Payment Status */}
                              <div className="mt-2">
                                {isFullyPaid(item) ? (
                                  <Badge
                                    variant="default"
                                    className="text-xs bg-green-100 text-green-800"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    مدفوع:{" "}
                                    {parseFloat(
                                      item.paid_amount?.toString() || "0"
                                    ).toFixed(2)}{" "}
                                    L.E
                                  </Badge>
                                ) : (
                                  <div className="flex gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-yellow-600 border-yellow-300"
                                    >
                                      <XCircle className="h-3 w-3 mr-1" /> غير
                                      مدفوع تم دفع{" "}
                                      {parseFloat(
                                        item.paid_amount || "0"
                                      ).toFixed(2)}{" "}
                                      L.E
                                    </Badge>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        onPaymentItemClick(item, "item")
                                      }
                                    >
                                      <DollarSign className="h-4 w-4 mr-1" />
                                      الدفع
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {/* Notes */}
                              {item.notes && (
                                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                  <span className="font-medium text-gray-700">
                                    ملحظات:
                                  </span>
                                  <p className="text-gray-600 italic">
                                    {item.notes}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Price Summary */}
                            <div className="text-right ml-4">
                              <div className="space-y-1">
                                <p className="text-sm text-gray-500">
                                  سعر الوحدة:
                                </p>
                                <p className="font-medium">
                                  {unitPrice.toFixed(2)} L.E
                                </p>
                                <p className="text-sm text-gray-500">
                                  × {quantity}
                                </p>
                                <Separator className="my-2" />
                                <p className="font-bold text-lg text-primary">
                                  {totalPrice.toFixed(2)} L.E
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Services */}
          {order?.order_services && order?.order_services?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  الخدمات ({order?.order_services?.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order?.order_services?.map((service: any) => {
                    const unitPrice = calculateServicePrice(service);
                    const quantity = parseInt(
                      service.quantity?.toString() || "0"
                    );
                    const totalPrice = unitPrice * quantity;

                    return (
                      <div
                        key={service.id}
                        className="flex items-start justify-between pb-4 border-b last:border-b-0"
                      >
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-lg">
                                {service.service?.name || "Unknown Service"}
                              </h4>

                              <div className="mt-1 space-y-1">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">الكمية:</span>{" "}
                                  {quantity}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">
                                    سعر الوحدة:
                                  </span>{" "}
                                  {unitPrice.toFixed(2)} L.E
                                </p>
                              </div>

                              {/* Person Assignment */}
                              <div className="mt-2 flex items-center justify-between">
                                {service.person_name ? (
                                  <Badge variant="outline" className="text-xs">
                                    <Users className="h-3 w-3 mr-1" />
                                    {service.person_name}
                                  </Badge>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      onClickAssgin(service, "services");
                                    }}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    تعيين الشخص
                                  </Button>
                                )}
                              </div>

                              {/* Payment Status */}
                              <div className="mt-2">
                                {isFullyPaid(service) ? (
                                  <Badge
                                    variant="default"
                                    className="text-xs bg-green-100 text-green-800"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    مدفوع:{" "}
                                    {parseFloat(
                                      service.paid_amount?.toString() || "0"
                                    ).toFixed(2)}{" "}
                                    L.E
                                  </Badge>
                                ) : (
                                  <div className="flex gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-yellow-600 border-yellow-300"
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      غير مدفوع
                                    </Badge>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        onPaymentItemClick(service, "service")
                                      }
                                    >
                                      <DollarSign className="h-4 w-4 mr-1" />
                                      الدفع
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {/* Booking Info */}
                              {service.booking && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                  <span className="font-medium text-blue-700">
                                    الحجز:
                                  </span>
                                  <p className="text-blue-600">
                                    {format(
                                      new Date(service.booking.scheduled_time),
                                      "PPP 'at' p"
                                    )}
                                  </p>
                                </div>
                              )}

                              {/* Notes */}
                              {service.notes && (
                                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                  <span className="font-medium text-gray-700">
                                    ملحوظات:
                                  </span>
                                  <p className="text-gray-600 italic">
                                    {service.notes}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Price Summary */}
                            <div className="text-right ml-4">
                              <div className="space-y-1">
                                <p className="text-sm text-gray-500">
                                  سعر الوحدة:
                                </p>
                                <p className="font-medium">
                                  {unitPrice.toFixed(2)} L.E
                                </p>
                                <p className="text-sm text-gray-500">
                                  × {quantity}
                                </p>
                                <Separator className="my-2" />
                                <p className="font-bold text-lg text-primary">
                                  {totalPrice.toFixed(2)} L.E
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Order Summary & Actions */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                ملخص الطلب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">مجموع العناصر:</span>
                  <span>
                    {(order.order_items || [])
                      .reduce((sum: number, item: any) => {
                        const unitPrice = calculateItemPrice(item);
                        const quantity = parseInt(
                          item.quantity?.toString() || "0"
                        );
                        return sum + unitPrice * quantity;
                      }, 0)
                      .toFixed(2)}{" "}
                    L.E
                  </span>
                </div>

                {order.order_services && order.order_services.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">إجمالي الخدمات:</span>
                    <span>
                      {(order.order_services || [])
                        .reduce((sum: number, service: any) => {
                          const unitPrice = calculateServicePrice(service);
                          const quantity = parseInt(
                            service.quantity?.toString() || "0"
                          );
                          return sum + unitPrice * quantity;
                        }, 0)
                        .toFixed(2)}{" "}
                      L.E
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">المجموع الفرعي:</span>
                  <span>{subtotal.toFixed(2)} L.E</span>
                </div>

                {order.tax_enabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      ضريبة ({(taxRate * 100).toFixed(0)}%):
                    </span>
                    <span>{tax.toFixed(2)} L.E</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>المجموع:</span>
                  <span className="text-primary">{total.toFixed(2)} L.E</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                معلومات الدفع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">حالة:</span>
                <Badge
                  className={
                    order?.cancelled
                      ? "bg-red-100 text-red-800"
                      : order.payment_status === "paid"
                      ? "bg-green-100 text-green-800"
                      : order.payment_status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.payment_status === "partial"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {order?.cancelled
                    ? "ملغي"
                    : OrderPaymentStatus[
                        order.payment_status as keyof typeof OrderPaymentStatus
                      ]?.name}
                </Badge>
              </div>

              {/* Calculate paid amount */}
              {(() => {
                const totalPaid =
                  (order.order_items || []).reduce(
                    (sum: number, item: any) =>
                      sum + parseFloat(item.paid_amount?.toString() || "0"),
                    0
                  ) +
                  (order.order_services || []).reduce(
                    (sum: number, service: any) =>
                      sum + parseFloat(service.paid_amount?.toString() || "0"),
                    0
                  );

                const remaining = total - totalPaid;

                return (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">المبلغ المدفوع:</span>
                      <span className="text-green-600 font-medium">
                        {totalPaid.toFixed(2)} L.E
                      </span>
                    </div>
                    {remaining > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">متبقي:</span>
                        <span className="text-red-600 font-medium">
                          {remaining.toFixed(2)} L.E
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                الجدول الزمني للطلب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">تم إنشاء الطلب</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(order.created_at), "PPP 'at' p")}
                    </p>
                  </div>
                </div>

                {order.updated_at && order.updated_at !== order.created_at && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">آخر تحديث</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(order.updated_at), "PPP 'at' p")}
                      </p>
                    </div>
                  </div>
                )}

                {order.payment_status === "paid" && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">تم الدفع</p>
                      <p className="text-xs text-gray-500">
                        تم استلام الدفع الكامل
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                variant="outline"
                onClick={handlePrintReceipt}
                disabled={showPrintDialog}
              >
                <Printer className="h-4 w-4 mr-2" />
                {showPrintDialog ? "التحضير..." : "طباعة الإيصال"}
              </Button>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowEmailDialog(true)}
              >
                <Mail className="h-4 w-4 mr-2" />
                إرسال إيصال البريد الإلكتروني
              </Button>

              {order.payment_status !== "paid" && (
                <>
                  {/* <Button className="w-full" onClick={handleMarkAsPaid}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </Button> */}

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setShowPaymentDialog(true)}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    تسجيل الدفع الجزئي
                  </Button>
                </>
              )}
              {order.canclled && (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={handleCancelOrder}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  إلغاء الطلب
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Dialog */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>طباعة الإيصال</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>تحضير الإيصال للطباعة...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إرسال إيصال البريد الإلكتروني</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">عنوان البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="أدخل عنوان البريد الإلكتروني"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              يلغي
            </Button>
            <Button onClick={handleSendEmailReceipt}>
              <Mail className="h-4 w-4 mr-2" />
              إرسال الإيصال
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>سجل الدفع</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">مبلغ الدفع (L.E)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="أدخل مبلغ الدفع"
              />
            </div>
            <div>
              <Label htmlFor="method">طريقة الدفع</Label>
              <Select
                value={selectedPaymentMethod}
                onValueChange={setSelectedPaymentMethod}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="card">بطاقة الائتمان/الخصم</SelectItem>
                  <SelectItem value="mobile">
                    الدفع عبر الهاتف المحمول
                  </SelectItem>
                  <SelectItem value="bank_transfer">التحويل البنكي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
            >
              الالغاء
            </Button>
            <Button onClick={handlePartialPayment}>
              <DollarSign className="h-4 w-4 mr-2" />
              سجل الدفع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Person Assignment Dialog */}
      <AssignmentDialog
        showPersonAssignmentDialog={showPersonAssignDialog}
        setShowPersonAssignmentDialog={togglePersonAssignmentDialog}
        personName={personName}
        setPersonName={changePersonName}
        onSave={handleAssignPerson}
      />
      <PaymentDialog
        showPaymentDialog={showItemPaymentDialog}
        setShowPaymentDialog={toggleItemPaymentDialog}
        isPaid={itemPaymentForm.isPaid}
        paidAmount={itemPaymentForm.paidAmount}
        setPayForm={changeItemPayForm}
        onSave={handleItemPaymentUpdate}
      />
    </div>
  );
};

export default OrderDetailPage;
