export enum EBaseRoutes {
  system = "/system",
  auth = "/auth",
  events = "/events",
  hotspots = "/hotspots",
  exports = "/exports",
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
  evidence = "/evidence",
}

// -- Route Service --

export enum ERepositoryKey {
  gfw = "gfw",
}
