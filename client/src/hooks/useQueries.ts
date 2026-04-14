import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Notice, Complaint, Visitor, Payment, User, Notification, Society } from "@/types";

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

// Ensure backward compatibility if backend doesn't paginate yet
type GenericResponse<T> = PaginatedResponse<T> | { success: boolean; data: T[] };

const extractData = <T>(res: GenericResponse<T>): { data: T[]; totalPages?: number } => {
  if ("pagination" in res.data) {
    return { data: res.data.data, totalPages: res.data.pagination.totalPages };
  }
  return { data: res.data as T[], totalPages: 1 };
};

export const useNotices = (page = 1, limit = 10, search = "") => {
  return useQuery({
    queryKey: ["notices", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.append("search", search);
      const { data } = await api.get<GenericResponse<Notice>>(`/notices?${params}`);
      return extractData(data);
    },
    refetchInterval: 15000,
  });
};

export const useComplaints = (page = 1, limit = 10, search = "") => {
  return useQuery({
    queryKey: ["complaints", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.append("search", search);
      const { data } = await api.get<GenericResponse<Complaint>>(`/complaints?${params}`);
      return extractData(data);
    },
    refetchInterval: 15000,
  });
};

export const useVisitors = (page = 1, limit = 10, search = "", status = "", date = "") => {
  return useQuery({
    queryKey: ["visitors", page, limit, search, status, date],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.append("search", search);
      if (status) params.append("status", status);
      if (date) params.append("date", date);
      const { data } = await api.get<GenericResponse<Visitor>>(`/visitors?${params}`);
      return extractData(data);
    },
    staleTime: 10_000, // Reuse cached data for 10s — avoids redundant fetches
    placeholderData: (prev) => prev, // Keep showing old data while new data loads
    refetchInterval: 15000,
  });
};

export const usePayments = (page = 1, limit = 10, search = "") => {
  return useQuery({
    queryKey: ["payments", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.append("search", search);
      const { data } = await api.get<GenericResponse<Payment>>(`/payments?${params}`);
      return extractData(data);
    },
    refetchInterval: 15000,
  });
};

export const useResidents = (page = 1, limit = 10, search = "") => {
  return useQuery({
    queryKey: ["residents", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.append("search", search);
      const { data } = await api.get<GenericResponse<User>>(`/residents?${params}`);
      return extractData(data);
    },
  });
};

export const useGuards = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["guards", page, limit],
    queryFn: async () => {
      const { data } = await api.get<GenericResponse<User>>(`/admins?page=${page}&limit=${limit}`);
      return extractData(data);
    },
  });
};

export const useGuardStats = () => {
  return useQuery({
    queryKey: ["guardStats"],
    queryFn: async () => {
      const { data } = await api.get("/visitors/stats/guard");
      return data.data;
    },
    refetchInterval: 15000,
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/stats");
      // The endpoint returns { success: boolean, data: { ...stats } }
      return data.data; // return the actual stats object
    },
    refetchInterval: 15000,
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ["recentActivity"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/activity");
      return data.data;
    },
    refetchInterval: 15000,
  });
};

// --- NOTIFICATIONS ---
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: { count: number } }>(
        "/notifications/count"
      );
      return data.data.count;
    },
    refetchInterval: 30_000, // Poll every 30 seconds
  });
};

export const useNotifications = (enabled: boolean) => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get<{
        success: boolean;
        data: { data: Notification[]; unreadCount: number };
      }>("/notifications?limit=10");
      return data.data.data;
    },
    enabled, // Only fetch when the popover is open
  });
};

// --- REPORTS ---
export const useReportStats = () => {
  return useQuery({
    queryKey: ["reportStats"],
    queryFn: async () => {
      const { data } = await api.get("/reports/stats");
      return data.data;
    },
  });
};

export const useSocieties = () => {
  return useQuery({
    queryKey: ["societies"],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Society[] }>("/societies");
      return data.data;
    },
    staleTime: 60000,
  });
};
