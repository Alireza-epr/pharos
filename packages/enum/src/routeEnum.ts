export enum EBaseRoutes {
  system = "/system",
  auth = "/auth",
  report = "/report",
  hotspots = "/hotspots",
  exports = "/exports",
  regions = "/regions",
  vessels = "/vessels",
  mcp = "/mcp",
  events = "/events",
}

export enum ERegionsRoutes {
  geometry = "/geometry",
}

export enum EVesselsRoutes {
  search = "/search",
}

export enum EEventsRoutes {
  search = "/search",
}

export enum ESystemRoutes {
  health = "/health",
}

export enum EAuthRoutes {
  login = "/login",
  testToken = "/test-token",
  checkToken = "/check-token",
  refresh = "/refresh",
}

export enum EExportsRoutes {
  events = "/events",
}
