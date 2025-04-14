
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useComplaints } from "@/contexts/ComplaintsContext";
import Layout from "@/components/Layout";
import ComplaintCard from "@/components/ComplaintCard";
import ComplaintFilters from "@/components/ComplaintFilters";
import { Button } from "@/components/ui/button";
import { Complaint } from "@/types";
import { subDays } from "date-fns";

const MyComplaints = () => {
  const { user } = useAuth();
  const { getComplaintsByUserId } = useComplaints();
  const navigate = useNavigate();
  
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [userComplaints, setUserComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    if (user) {
      const complaints = getComplaintsByUserId(user.id);
      setUserComplaints(complaints);
      setFilteredComplaints(complaints);
    }
  }, [user, getComplaintsByUserId]);

  if (!user || user.role !== "resident") {
    navigate("/");
    return null;
  }

  const handleFilterChange = (filters: any) => {
    let filtered = [...userComplaints];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (complaint) =>
          complaint.title.toLowerCase().includes(searchLower) ||
          complaint.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((complaint) => complaint.status === filters.status);
    }

    // Apply category filter
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter((complaint) => complaint.category === filters.category);
    }

    // Apply date filter
    if (filters.dateRange && filters.dateRange !== "all") {
      const now = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "week":
          startDate = subDays(now, 7);
          break;
        case "month":
          startDate = subDays(now, 30);
          break;
        default:
          startDate = new Date(0); // Beginning of time
      }

      filtered = filtered.filter(
        (complaint) => new Date(complaint.createdAt) >= startDate
      );
    }

    setFilteredComplaints(filtered);
  };

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">My Complaints</h1>
            <p className="text-gray-600">
              View and track all your submitted grievances
            </p>
          </div>
          <Button
            className="mt-4 md:mt-0 bg-municipal-primary hover:bg-municipal-primary/90"
            onClick={() => navigate("/submit-complaint")}
          >
            Submit New Complaint
          </Button>
        </div>
      </div>

      <ComplaintFilters onFilterChange={handleFilterChange} />

      <div className="space-y-4">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't submitted any complaints yet</p>
            <Button
              onClick={() => navigate("/submit-complaint")}
              className="bg-municipal-primary hover:bg-municipal-primary/90"
            >
              Submit Your First Complaint
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyComplaints;
