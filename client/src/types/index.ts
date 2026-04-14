// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  contact: string;
  role: "RESIDENT" | "ADMIN" | "GUARD";
  flatNumber?: string;
  wing?: string;
  societyId: string;
  createdAt: string;
}

// Society Types
export interface Society {
  id: string;
  name: string;
  address?: string;
}

// Notice Types
export interface Notice {
  id: string;
  title: string;
  content: string;
  type: "INFO" | "EVENT" | "ALERT";
  priority: "LOW" | "MEDIUM" | "HIGH";
  visibility?: "PRIVATE" | "PUBLIC";
  eventLink?: string;
  targetSocieties?: string[];
  createdAt: string;
  creatorId?: string;
  societyId?: string;
  society?: {
    name: string;
  };
}

// Complaint Types
export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  updatedAt: string;
  residentId?: string;
  societyId?: string;
  resident?: {
    name: string;
    flatNumber: string;
    wing: string;
  };
  history?: {
    status: string;
    remark: string;
    updatedAt: string;
  }[];
}

// Visitor Types
export interface Visitor {
  id: string;
  name: string;
  purpose: string;
  wing: string;
  flatNumber: string;
  contact?: string;
  visitorType?: string;
  vehicleNumber?: string;
  documentImage?: string;
  status: "PENDING" | "WAITING" | "APPROVED" | "REJECTED" | "ENTERED" | "EXITED";
  isWalkIn?: boolean;
  entryTime?: string;
  exitTime?: string;
  societyId?: string;
}

// Payment Types
export interface Payment {
  id: string;
  type: string;
  month: string;
  amount: number;
  status: "PENDING" | "PAID" | "OVERDUE";
  dueDate: string;
  createdAt: string;
  residentId: string;
  societyId: string;
  resident?: {
    name: string;
    flatNumber: string;
    wing: string;
  };
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "NOTICE" | "COMPLAINT" | "PAYMENT" | "VISITOR";
  isRead: boolean;
  createdAt: string;
  userId: string;
  societyId: string;
}

// Pagination Meta Type
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
