
import { Badge } from "@/components/ui/badge";
import { ComplaintStatus } from "@/types";

interface StatusBadgeProps {
  status: ComplaintStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "in-progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "resolved":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getStatusText = (status: ComplaintStatus) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in-progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  return (
    <Badge className={getStatusColor(status)} variant="outline">
      {getStatusText(status)}
    </Badge>
  );
};

export default StatusBadge;
