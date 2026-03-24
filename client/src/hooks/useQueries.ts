import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Notice, Complaint, Visitor, Payment, User, Notification } from "@/types";

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

export const useNotices = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["notices", page, limit],
    queryFn: async () => {
      const { data } = await api.get<GenericResponse<Notice>>(`/notices?page=${page}&limit=${limit}`);
      return extractData(data);
    },
  });
};

export const useComplaints = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["complaints", page, limit],
    queryFn: async () => {
      const { data } = await api.get<GenericResponse<Complaint>>(`/complaints?page=${page}&limit=${limit}`);
      return extractData(data);
    },
  });
};

export const useVisitors = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["visitors", page, limit],
    queryFn: async () => {
      const { data } = await api.get<GenericResponse<Visitor>>(`/visitors?page=${page}&limit=${limit}`);
      return extractData(data);
    },
  });
};

export const usePayments = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["payments", page, limit],
    queryFn: async () => {
      const { data } = await api.get<GenericResponse<Payment>>(`/payments?page=${page}&limit=${limit}`);
      return extractData(data);
    },
  });
};

export const useResidents = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["residents", page, limit],
    queryFn: async () => {
      const { data } = await api.get<GenericResponse<User>>(`/residents?page=${page}&limit=${limit}`);
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

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/stats");
      // The endpoint returns { success: boolean, data: { ...stats } }
      return data.data; // return the actual stats object
    },
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
