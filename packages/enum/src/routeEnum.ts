export enum EBaseRoutes {
  system = "/system",
  auth = "/auth",
  events = "/events",
  hotspots = "/hotspots",
  exports = "/exports",
  regions = "/regions",
  vessels = "/vessels",
}

export enum ERegionsRoutes {
  geometry = "/geometry",
}

export enum EVesselsRoutes {
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
