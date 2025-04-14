
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Complaint, ComplaintStatus, ComplaintCategory } from "../types";

// Mock data for initial complaints
const initialComplaints: Complaint[] = [
  {
    id: "c1",
    title: "Water shortage in Unit K",
    description: "We have had no water for 3 days. This is affecting daily activities.",
    category: "water-supply",
    status: "pending",
    createdAt: "2023-04-10T10:30:00Z",
    updatedAt: "2023-04-10T10:30:00Z",
    userId: "2",
    userName: "John Resident",
    location: "Unit K, 5th Avenue",
    contactPhone: "0771234567",
  },
  {
    id: "c2",
    title: "Pothole on Main Street",
    description: "Large pothole causing traffic and vehicle damage near the market.",
    category: "road-maintenance",
    status: "in-progress",
    createdAt: "2023-04-08T09:15:00Z",
    updatedAt: "2023-04-11T14:20:00Z",
    userId: "2",
    userName: "John Resident",
    location: "Main Street, near Central Market",
    contactPhone: "0771234567",
    assignedTo: "Roads Department",
    responseNotes: "Team dispatched for assessment on 11th April."
  },
  {
    id: "c3",
    title: "Uncollected garbage",
    description: "Garbage has not been collected for two weeks, causing health concerns.",
    category: "waste-management",
    status: "resolved",
    createdAt: "2023-04-05T11:45:00Z",
    updatedAt: "2023-04-12T16:30:00Z",
    userId: "2",
    userName: "John Resident",
    location: "Unit D, Block 4",
    contactPhone: "0771234567",
    assignedTo: "Waste Management",
    responseNotes: "Garbage collected on 12th April. Regular schedule resumed."
  }
];

interface ComplaintsContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, "id" | "createdAt" | "updatedAt">) => void;
  updateComplaintStatus: (id: string, status: ComplaintStatus, notes?: string) => void;
  getComplaintsByUserId: (userId: string) => Complaint[];
  getComplaintById: (id: string) => Complaint | undefined;
}

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined);

export const ComplaintsProvider = ({ children }: { children: ReactNode }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    // Initialize with mock data
    setComplaints(initialComplaints);
  }, []);

  const addComplaint = (complaintData: Omit<Complaint, "id" | "createdAt" | "updatedAt">) => {
    const newComplaint: Complaint = {
      ...complaintData,
      id: `c${complaints.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "pending"
    };

    setComplaints([...complaints, newComplaint]);
  };

  const updateComplaintStatus = (id: string, status: ComplaintStatus, notes?: string) => {
    setComplaints(
      complaints.map((complaint) =>
        complaint.id === id
          ? {
              ...complaint,
              status,
              updatedAt: new Date().toISOString(),
              responseNotes: notes || complaint.responseNotes
            }
          : complaint
      )
    );
  };

  const getComplaintsByUserId = (userId: string) => {
    return complaints.filter((complaint) => complaint.userId === userId);
  };

  const getComplaintById = (id: string) => {
    return complaints.find((complaint) => complaint.id === id);
  };

  return (
    <ComplaintsContext.Provider
      value={{
        complaints,
        addComplaint,
        updateComplaintStatus,
        getComplaintsByUserId,
        getComplaintById
      }}
    >
      {children}
    </ComplaintsContext.Provider>
  );
};

export const useComplaints = () => {
  const context = useContext(ComplaintsContext);
  if (context === undefined) {
    throw new Error("useComplaints must be used within a ComplaintsProvider");
  }
  return context;
};
