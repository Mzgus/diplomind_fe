import API from "./caller.services";

const getAuditLogs = (params?: { limit?: number }) => {
  return API.get("/audit-logs", { params });
};

export const AuditService = {
  getAuditLogs,
};
