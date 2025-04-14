
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useComplaints } from "@/contexts/ComplaintsContext";
import Layout from "@/components/Layout";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ComplaintStatus } from "@/types";
import { ArrowLeft, Calendar, MapPin, Phone, User } from "lucide-react";

const ComplaintDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getComplaintById, updateComplaintStatus } = useComplaints();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | "">("");
  const [responseNotes, setResponseNotes] = useState("");

  if (!user) {
    navigate("/login");
    return null;
  }

  if (!id) {
    navigate("/");
    return null;
  }

  const complaint = getComplaintById(id);

  if (!complaint) {
    navigate("/");
    return null;
  }

  // Check if user has permission to view this complaint
  if (user.role === "resident" && complaint.userId !== user.id) {
    navigate("/");
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        relative: formatDistanceToNow(date, { addSuffix: true }),
        formatted: format(date, "PPpp") // e.g., "Apr 29, 2023, 1:00 PM"
      };
    } catch (error) {
      return {
        relative: "Invalid date",
        formatted: "Invalid date"
      };
    }
  };

  const createdDate = formatDate(complaint.createdAt);
  const updatedDate = formatDate(complaint.updatedAt);

  const getCategoryLabel = (category: string) => {
    return category.split("-").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  const handleUpdateStatus = () => {
    if (!selectedStatus) {
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      updateComplaintStatus(complaint.id, selectedStatus, responseNotes || undefined);
      
      toast({
        title: "Success",
        description: "Complaint status updated successfully",
      });
      
      // Reset form
      setSelectedStatus("");
      setResponseNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate(user.role === "admin" ? "/all-complaints" : "/my-complaints")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Complaints
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl mb-2">{complaint.title}</CardTitle>
              <CardDescription>
                {getCategoryLabel(complaint.category)} - Submitted {createdDate.relative}
              </CardDescription>
            </div>
            <StatusBadge status={complaint.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{complaint.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Details</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>Submitted by: {complaint.userName}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Location: {complaint.location}</span>
                </div>
                {complaint.contactPhone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>Contact: {complaint.contactPhone}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Created: {createdDate.formatted}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Last updated: {updatedDate.formatted}</span>
                </div>
              </div>
            </div>

            {(complaint.assignedTo || complaint.responseNotes) && (
              <div>
                <h3 className="font-medium mb-2">Response</h3>
                <div className="space-y-2">
                  {complaint.assignedTo && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Assigned to:</span> {complaint.assignedTo}
                    </div>
                  )}
                  {complaint.responseNotes && (
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Notes:</span>
                      <p className="mt-1 whitespace-pre-line">{complaint.responseNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status update form (admin only) */}
      {user.role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
            <CardDescription>
              Change the status of this complaint and provide a response
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Status</h3>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ComplaintStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Response Notes</h3>
              <Textarea
                placeholder="Provide details about actions taken or next steps"
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleUpdateStatus} 
              className="ml-auto bg-municipal-primary hover:bg-municipal-primary/90"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </Layout>
  );
};

export default ComplaintDetail;
