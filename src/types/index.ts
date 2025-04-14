
export type UserRole = "resident" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type ComplaintStatus = "pending" | "in-progress" | "resolved" | "rejected";

export type ComplaintCategory = 
  | "water-supply" 
  | "electricity" 
  | "road-maintenance" 
  | "waste-management" 
  | "public-safety" 
  | "noise-pollution"
  | "other";

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
  location: string;
  contactPhone?: string;
  assignedTo?: string;
  responseNotes?: string;
}
