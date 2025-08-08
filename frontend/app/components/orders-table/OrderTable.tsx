import { MoreHorizontal, Eye } from "lucide-react";

import type { Order } from "~/types/dataTypes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { Link } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

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
};
interface OrderTableProps {
  data: Order[];
}
function OrderTable({ data }: OrderTableProps) {
  return (
    <div className="w-full overflow-auto" dir="rtl">
      <div className="w-full">
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-3xl">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/50 bg-muted/20">
                  <TableHead className="w-[50px] text-center">#</TableHead>
                  <TableHead className="text-right ">
                    <span className="h-auto p-0 font-bold hover:bg-transparent text-foreground ">
                      الرقم التعريفي
                    </span>
                  </TableHead>
                  <TableHead className="text-right ">
                    <span className="h-auto p-0 font-bold hover:bg-transparent text-foreground">
                      اسم العميل
                    </span>
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="font-bold text-foreground">
                      رقم العميل
                    </span>
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="font-bold text-foreground">
                      حالة الدفع
                    </span>
                  </TableHead>

                  <TableHead className="text-right">
                    <span className="font-bold text-foreground">
                      رقم الطاولة
                    </span>
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="font-bold text-foreground">
                      تاريخ الانشاء
                    </span>
                  </TableHead>

                  <TableHead className="text-right">
                    <span className="font-bold text-foreground">
                      اسم الموظف
                    </span>
                  </TableHead>

                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="text-center">{order.id}</TableCell>
                    <TableCell>
                      <div className="font-medium break-words whitespace-normal">
                        <Link
                          className="underline text-primary"
                          to={`/dashboard/orders/${order.id}`}
                        >
                          {order.ref_code}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium break-words whitespace-normal">
                        {order.customer_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium break-words whitespace-normal">
                        {order.customer_phone}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`${
                            OrderPaymentStatus[order.payment_status].color
                          } text-white px-2 py-1 rounded-md text-sm`}
                        >
                          {OrderPaymentStatus[order.payment_status].name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium break-words whitespace-normal">
                        {order.table?.number}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium break-words whitespace-normal">
                        {order.created_at &&
                          new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium break-words whitespace-normal">
                        {order?.staff?.username}
                      </div>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            //   disabled={deletePost.isPending}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">فتح القائمة</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>

                          <Link to={`/dashboard/orders/${order.id}`}>
                            <DropdownMenuItem>
                              <Eye className="ml-2 h-4 w-4" />
                              مشاهدة
                            </DropdownMenuItem>
                          </Link>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderTable;
