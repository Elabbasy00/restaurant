import React, { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useGetOrdersQuery } from "~/redux/order/orderApi";
import { Link } from "react-router";
import { Search, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import OrderTable from "~/components/orders-table/OrderTable";
import { Pagination } from "~/components/pagination/Pagination";
import { useDebounce } from "use-debounce";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import PageLoading from "~/components/loading/PageLoading";
import ErrorAlert from "~/components/error-alert/ErrorAlert";

interface Filters {
  tax_enabled: string;
  payment_status: string;
  created_at: string;
}

const OrdersPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [searchTable, setSearchTable] = useState("");
  const [debouncedSearchTable] = useDebounce(searchTable, 500);
  const [searchRefCode, setsearchRefCode] = useState("");
  const [debouncedSearchRefCode] = useDebounce(searchRefCode, 500);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [filters, setFilters] = useState<Filters>({
    tax_enabled: "",
    payment_status: "",
    created_at: "",
  });

  const {
    data: orders,
    isLoading,
    error,
  } = useGetOrdersQuery({
    limit,
    offset: (currentPage - 1) * limit,
    search: debouncedSearch,
    search_table: debouncedSearchTable,
    tax_enabled:
      filters?.tax_enabled === "yes"
        ? true
        : filters?.tax_enabled === "no"
        ? false
        : null,
    payment_status:
      filters.payment_status === "all" ? "" : filters.payment_status,
    created_at: filters.created_at,
    ref_code: debouncedSearchRefCode,
  });

  const changePage = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  const changeLimit = useCallback(
    (limit: number) => {
      setLimit(limit);
    },
    [setLimit]
  );

  const handleFilterChange = useCallback(
    (key: keyof Filters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setSearchTable("");
    setsearchRefCode("");
    setFilters({
      tax_enabled: "",
      payment_status: "",
      created_at: "",
    });
  }, []);

  const activeFilters = useMemo(() => {
    const filter = [];
    if (searchTable) {
      filter.push(
        <Badge key="search_table" variant="secondary" className="text-xs">
          جدول: "{searchTable}"
        </Badge>
      );
    }
    if (filters.tax_enabled) {
      filter.push(
        <Badge key="tax_enabled" variant="secondary" className="text-xs">
          الضريبة :{" "}
          {filters.tax_enabled === "all"
            ? "الكل"
            : filters?.tax_enabled === "yes"
            ? "مضافة"
            : "غير مضافة"}
        </Badge>
      );
    }
    if (filters.payment_status) {
      filter.push(
        <Badge key="payment_status" variant="secondary" className="text-xs">
          حالة الدفع:{" "}
          {filters.payment_status === "all" ? "الكل" : filters.payment_status}
        </Badge>
      );
    }
    if (filters.created_at) {
      filter.push(
        <Badge key="created_at" variant="secondary" className="text-xs">
          تاريخ الإنشاء: {filters.created_at}
        </Badge>
      );
    }
    if (searchRefCode) {
      filter.push(
        <Badge key="ref_code" variant="secondary" className="text-xs">
          الرمز: "{searchRefCode}"
        </Badge>
      );
    }

    if (search) {
      filter.push(
        <Badge key="search" variant="secondary" className="text-xs">
          البحث: "{search}"
        </Badge>
      );
    }
    return filter;
  }, [search, searchTable, filters, searchRefCode]);
  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        filters.payment_status ||
          searchRefCode ||
          search ||
          searchTable ||
          filters.tax_enabled !== null ||
          filters.created_at
      ),
    [
      filters.created_at,
      filters.payment_status,
      searchRefCode,
      search,
      searchTable,
      filters.tax_enabled,
    ]
  );

  const paginationData = useMemo(() => {
    if (!orders)
      return {
        currentPage: 1,
        totalPages: 1,
        itemsPerPage: limit,
        totalItems: 0,
        onPageChange: changePage,
        onItemsPerPageChange: changeLimit,
      };

    return {
      currentPage: currentPage,
      totalPages: Math.ceil(orders.count / orders.limit),
      itemsPerPage: limit,
      totalItems: orders.count,
      onPageChange: changePage,
      onItemsPerPageChange: changeLimit,
    };
  }, [orders, currentPage, limit, changePage, changeLimit]);

  if (isLoading) {
    return <PageLoading text="جار تحميل الطلبات" />;
  }

  if (error) {
    return <ErrorAlert text=" حدث خطأ أثناء تحميل الطلبات" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-3">
        <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
        <p className="text-gray-600 mt-2">إدارة جميع الطلبات وتتبعها</p>
      </div>

      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">تصفية</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex flex-col flex-wrap space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن عميل..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن طاولة او مكان طاولة..."
                    value={searchTable}
                    onChange={(e) => setSearchTable(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن رمز تعريفي..."
                    value={searchRefCode}
                    onChange={(e) => setsearchRefCode(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col flex-wrap space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <div className="w-auto">
                <Select
                  value={filters.payment_status}
                  onValueChange={(value) =>
                    handleFilterChange("payment_status", value)
                  }
                >
                  <SelectTrigger className="">
                    <SelectValue placeholder="كل الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الحالات</SelectItem>

                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="paid">مدفوع</SelectItem>
                    <SelectItem value="partial">جزئي</SelectItem>
                    <SelectItem value="refunded">مسترد</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-auto">
                <Select
                  value={filters.tax_enabled}
                  onValueChange={(value) =>
                    handleFilterChange("tax_enabled", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="كل الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الحالات</SelectItem>

                    <SelectItem value="yes">مع قيمة مضافة</SelectItem>
                    <SelectItem value="no">بدون قيمة مضافة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-100">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      data-empty={!filters.created_at}
                      className="data-[empty=true]:text-muted-foreground w-100 justify-start text-left font-normal"
                    >
                      <CalendarIcon />
                      {filters.created_at ? (
                        format(filters.created_at, "PPP")
                      ) : (
                        <span>اختار تاريخ</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        (filters?.created_at && new Date(filters.created_at)) ||
                        undefined
                      }
                      onSelect={(date) => {
                        handleFilterChange(
                          "created_at",
                          date?.toISOString().split("T")[0] ?? ""
                        );
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="w-full sm:w-auto"
                >
                  تصفية جديدة
                </Button>
              )}
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">{activeFilters}</div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {orders?.results?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">لايوجد طلبات</h3>
              <p className="text-gray-600 mb-4">
                لا يوجد طلبات حاليا. يمكنك إنشاء طلب جديد من هنا.
              </p>
              <Link to="/dashboard/menu">
                <Button>ابدا طلب جديد</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <OrderTable data={orders?.results || []} />
        )}

        {orders && orders.count > 20 && (
          <>
            <div className="text-xs sm:text-sm text-muted-foreground">
              عرض {(currentPage - 1) * 20 + 1} الي{" "}
              {Math.min(currentPage * 20, orders.count)} من {orders.count} مقال
            </div>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <Pagination {...paginationData} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
