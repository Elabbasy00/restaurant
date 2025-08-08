import {
  type RouteConfig,
  index,
  route,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/Login.tsx"),
  // Dashboard routes with shared layout
  route("dashboard", "layouts/DashboardLayout.tsx", [
    index("routes/dashboard/index.tsx"), // Dashboard home
    ...prefix("menu", [
      index("routes/dashboard/menu/index.tsx"),
      route(":slug", "routes/dashboard/menu/detail.tsx"),
    ]),
    route("checkout", "routes/dashboard/checkout/checkout.tsx"),
    ...prefix("orders", [
      index("routes/dashboard/orders/index.tsx"),
      route(":orderId", "routes/dashboard/orders/detail.tsx"),
    ]),

    ...prefix("services", [
      // Add this section
      index("routes/dashboard/services/index.tsx"),
      route(":slug", "routes/dashboard/services/detail.tsx"),
    ]),
    // Add other dashboard routes here
  ]),
  // ...prefix("menu", [index("routes/menu.tsx")]),
] satisfies RouteConfig;
