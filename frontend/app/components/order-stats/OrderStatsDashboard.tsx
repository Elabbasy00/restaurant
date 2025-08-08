// components/stats/OrderStatsDashboard.tsx

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  Utensils,
  CalendarCheck,
  Clock,
  Calendar,
} from "lucide-react";
import { useOrderStatsQuery } from "~/redux/table/tableApi";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

// Utility function to format currency (handles Decimal objects)
const formatCurrency = (value: any) => {
  const numValue =
    typeof value === "object" && "toNumber" in value
      ? value.toNumber()
      : Number(value) || 0;
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(numValue);
};

// Utility to format numbers
const formatNumber = (value: any) => {
  const numValue =
    typeof value === "object" && "toNumber" in value
      ? value.toNumber()
      : Number(value) || 0;
  return new Intl.NumberFormat("ar-SA").format(numValue);
};

// Fetch data from API

// Color palette for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function OrderStatsDashboard() {
  const { data, isLoading, error } = useOrderStatsQuery();

  if (error) {
    return (
      <div className="text-red-500">
        Error loading statistics: {error?.message}
      </div>
    );
  }

  // Prepare data for charts
  const paymentStatusData =
    data?.paymentStatus?.map((status: any) => ({
      name: status.payment_status,
      value: status.total,
      count: status.count,
    })) || [];

  const topItemsData =
    data?.topItems?.map((item: any) => ({
      name: item.item__name,
      count: item.count,
      total: item.total,
    })) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-right">إحصائيات الطلبات</h2>

      {/* Time Period Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="اليوم"
          value={data?.newOrders}
          icon={<Clock className="h-4 w-4" />}
          isLoading={isLoading}
          description="طلبات جديدة"
        />
        <StatCard
          title="الأسبوع الحالي"
          value={data?.current_period_revenue}
          icon={<Calendar className="h-4 w-4" />}
          isLoading={isLoading}
          formatter={formatCurrency}
          description="إجمالي الإيرادات"
        />
        <StatCard
          title="الشهر الحالي"
          value={data?.previous_period_revenue}
          icon={<Calendar className="h-4 w-4" />}
          isLoading={isLoading}
          formatter={formatCurrency}
          description="إجمالي الإيرادات"
        />
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي الإيرادات"
          value={data?.totalRevenue}
          icon={<DollarSign className="h-4 w-4" />}
          isLoading={isLoading}
          formatter={formatCurrency}
        />
        <StatCard
          title="إجمالي الطلبات"
          value={data?.totalOrders}
          icon={<ShoppingCart className="h-4 w-4" />}
          isLoading={isLoading}
          formatter={formatNumber}
        />
        <StatCard
          title="المنتجات المباعة"
          value={data?.itemsSold}
          icon={<Utensils className="h-4 w-4" />}
          isLoading={isLoading}
          formatter={formatNumber}
        />
        <StatCard
          title="الخدمات المحجوزة"
          value={data?.servicesBooked}
          icon={<CalendarCheck className="h-4 w-4" />}
          isLoading={isLoading}
          formatter={formatNumber}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <ChartCard title="حالة الدفع">
          {isLoading ? (
            <Skeleton className="h-[300px]" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    formatCurrency(value),
                    `${props.payload.count} طلبات`,
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="أعلى المنتجات مبيعاً">
          {isLoading ? (
            <Skeleton className="h-[300px]" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topItemsData}
                layout="vertical"
                margin={{ left: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tickFormatter={(value) =>
                    value.length > 15 ? `${value.substring(0, 15)}...` : value
                  }
                />
                <Tooltip
                  formatter={(value, name, props) => [
                    formatCurrency(value),
                    `تم بيعها: ${props.payload.count} مرات`,
                  ]}
                />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" name="الإيرادات" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid gap-4">
        <ChartCard title="توزيع الإيرادات">
          {isLoading ? (
            <Skeleton className="h-[300px]" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: "منتجات", value: data?.itemRevenue || 0 },
                  { name: "خدمات", value: data?.serviceRevenue || 0 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="الإيرادات" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({
  title,
  value,
  icon,
  isLoading,
  formatter = (val: any) => val,
  description,
}: {
  title: string;
  value: any;
  icon: React.ReactNode;
  isLoading: boolean;
  formatter?: (val: any) => string;
  description?: string;
}) {
  return (
    <Card className="text-right">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-full" />
            {description && <Skeleton className="h-4 w-full mt-2" />}
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{formatter(value)}</div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Reusable Chart Card Component
function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="text-right">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
