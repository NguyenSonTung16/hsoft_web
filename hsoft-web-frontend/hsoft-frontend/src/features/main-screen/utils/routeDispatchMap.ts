const DEFAULT_ROUTE = "/main-screen";

const ACTION_ROUTE: Record<string, string> = {
  open_registration: "/registration",
  open_ordering: "/test-order",
  open_collection: "/collection",
  open_receipt: "/receipt",
  open_analysis: "/analysis",
  open_entry_screen: "/entry",
  open_approval: "/approval",
  open_print: "/print",
  open_payment: "/payment",
  open_work_item: "/work-item",
};

export function routeDispatchMap(actionKey: string, fallbackRouteTarget?: string): string {
  if (ACTION_ROUTE[actionKey]) {
    return ACTION_ROUTE[actionKey];
  }

  if (fallbackRouteTarget?.trim()) {
    return fallbackRouteTarget;
  }

  return DEFAULT_ROUTE;
}
