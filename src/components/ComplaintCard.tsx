
import { Complaint } from "@/types";
import StatusBadge from "./StatusBadge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface ComplaintCardProps {
  complaint: Complaint;
  showActions?: boolean;
}

const ComplaintCard = ({ complaint, showActions = true }: ComplaintCardProps) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.split("-").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{complaint.title}</CardTitle>
            <CardDescription>
              {getCategoryLabel(complaint.category)} - {formatDate(complaint.createdAt)}
            </CardDescription>
          </div>
          <StatusBadge status={complaint.status} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 mb-2">{complaint.description.slice(0, 150)}{complaint.description.length > 150 ? "..." : ""}</p>
        <div className="text-xs text-gray-500 mt-2">
          <p><strong>Location:</strong> {complaint.location}</p>
          <p><strong>Submitted by:</strong> {complaint.userName}</p>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/complaint/${complaint.id}`)}
          >
            View Details
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ComplaintCard;
