import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";

// --- NOTICES ---
export const useCreateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post("/notices", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Notice created successfully");
      queryClient.invalidateQueries({ queryKey: ["notices"], exact: false });
    },
    onError: (error: AxiosError<{ message: string }>) => toast.error(error.response?.data?.message || "Failed to create notice"),
  });
};

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notices/${id}`);
    },
    onSuccess: () => {
      toast.success("Notice deleted");
      queryClient.invalidateQueries({ queryKey: ["notices"], exact: false });
    },
    onError: (error: AxiosError<{ message: string }>) => toast.error(error.response?.data?.message || "Failed to delete notice"),
  });
};

// --- COMPLAINTS ---
export const useUpdateComplaintStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/complaints/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["complaints"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onError: (error: AxiosError<{ message: string }>) => toast.error(error.response?.data?.message || "Failed to update status"),
  });
};

export const useCreateComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post("/complaints", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Complaint submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["complaints"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onError: (error: AxiosError<{ message: string }>) => toast.error(error.response?.data?.message || "Failed to submit complaint"),
  });
};

// --- VISITORS ---
export const useUploadImage = () => {
  return useMutation({
    mutationFn: async ({ image, folder }: { image: string; folder?: string }) => {
      const res = await api.post("/upload/image", { image, folder });
      return res.data; // { success: true, data: { url: "..." } }
    },
    onError: (error: AxiosError<{ message: string }>) =>
      toast.error(error.response?.data?.message || "Failed to upload image"),
  });
};

export const useCreateVisitor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post("/visitors", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Visitor pre-approved successfully");
      queryClient.invalidateQueries({ queryKey: ["visitors"], exact: false });
    },
    onError: (error: AxiosError<{ message: string }>) => toast.error(error.response?.data?.message || "Failed to pre-approve visitor"),
  });
};

export const useUpdateVisitorStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/visitors/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Visitor status updated");
      queryClient.invalidateQueries({ queryKey: ["visitors"], exact: false });
    },
    onError: (error: AxiosError<{ message: string }>) =>
      toast.error(error.response?.data?.message || "Failed to update status"),
  });
};

export const useMarkVisitorExit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/visitors/${id}/exit`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Visitor exit logged");
      queryClient.invalidateQueries({ queryKey: ["visitors"], exact: false });
    },
    onError: (error: AxiosError<{ message: string }>) =>
      toast.error(error.response?.data?.message || "Failed to mark exit"),
  });
};


// --- PAYMENTS ---
export const useMarkPaymentPaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/payments/${id}/pay`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Payment marked as PAID");
      queryClient.invalidateQueries({ queryKey: ["payments"], exact: false });
    },
    onError: (error: AxiosError<{ message: string }>) => toast.error(error.response?.data?.message || "Failed to update payment status"),
  });
};

export const useCreatePaymentRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      // Bulk or individual
      if (Array.isArray(data.residentIds) && data.residentIds[0] === "ALL") {
        const res = await api.post("/payments/bulk", {
          month: data.month,
          amount: data.amount,
          dueDate: data.dueDate,
          type: data.type,
        });
        return res.data;
      } else {
        const res = await api.post("/payments", data);
        return res.data;
      }
    },
    onSuccess: () => {
      toast.success("Payment request created successfully");
      queryClient.invalidateQueries({ queryKey: ["payments"], exact: false });
    },
    onError: (error: AxiosError<{ message: string }>) => toast.error(error.response?.data?.message || "Failed to create payment request"),
  });
};

// --- USERS ---
export const useDeleteResident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/residents/${id}`);
    },
    onSuccess: () => {
      toast.success("Resident removed");
      queryClient.invalidateQueries({ queryKey: ["residents"], exact: false });
    },
    onError: (error: AxiosError<{ message: string }>) => toast.error(error.response?.data?.message || "Failed to remove resident"),
  });
};

export const useDeleteGuard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admins/${id}`);
    },
    onSuccess: () => {
      toast.success("Guard removed");
      queryClient.invalidateQueries({ queryKey: ["guards"], exact: false });
    },
    onError: (error: AxiosError<{ message: string }>) => toast.error(error.response?.data?.message || "Failed to remove guard"),
  });
};

// --- NOTIFICATIONS ---
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: AxiosError<{ message: string }>) =>
      toast.error(error.response?.data?.message || "Failed to mark as read"),
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.patch("/notifications/read-all");
    },
    onSuccess: () => {
      toast.success("All caught up!");
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: AxiosError<{ message: string }>) =>
      toast.error(
        error.response?.data?.message || "Failed to mark all as read"
      ),
  });
};
