
import { useAuth } from "@/contexts/AuthContext";
import { useComplaints } from "@/contexts/ComplaintsContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import ComplaintCard from "@/components/ComplaintCard";
import { FileText, MessageCircle, CheckCircle, AlertCircle, Clock } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { complaints, getComplaintsByUserId } = useComplaints();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  // Statistics calculation
  const totalComplaints = user.role === "admin" 
    ? complaints.length 
    : getComplaintsByUserId(user.id).length;
  
  const pendingComplaints = complaints.filter(c => 
    (user.role === "admin" || c.userId === user.id) && c.status === "pending"
  ).length;
  
  const inProgressComplaints = complaints.filter(c => 
    (user.role === "admin" || c.userId === user.id) && c.status === "in-progress"
  ).length;
  
  const resolvedComplaints = complaints.filter(c => 
    (user.role === "admin" || c.userId === user.id) && c.status === "resolved"
  ).length;

  // Recent complaints
  const recentComplaints = [...complaints]
    .filter(c => user.role === "admin" || c.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Chart data
  const statusData = [
    { name: "Pending", value: pendingComplaints, color: "#f59e0b" },
    { name: "In Progress", value: inProgressComplaints, color: "#3b82f6" },
    { name: "Resolved", value: resolvedComplaints, color: "#10b981" },
    { name: "Rejected", value: complaints.filter(c => 
      (user.role === "admin" || c.userId === user.id) && c.status === "rejected"
    ).length, color: "#ef4444" },
  ];

  const categoryData = Object.entries(
    complaints
      .filter(c => user.role === "admin" || c.userId === user.id)
      .reduce((acc, complaint) => {
        const category = complaint.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name: name.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
    value
  }));

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">
          {user.role === "admin" 
            ? "Overview of all grievances in the Chitungwiza Municipality." 
            : "Track and manage your grievances with the Chitungwiza Municipality."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-municipal-primary mr-3" />
              <div>
                <p className="text-2xl font-bold">{totalComplaints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{pendingComplaints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{inProgressComplaints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{resolvedComplaints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Complaints by Status</CardTitle>
            <CardDescription>Distribution of complaints by their current status</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ""}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Complaints by Category</CardTitle>
            <CardDescription>Distribution of complaints across different categories</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 70,
                  }}
                >
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0055a4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Complaints */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Complaints</CardTitle>
              <CardDescription>Latest grievances {user.role === "admin" ? "submitted" : "you've submitted"}</CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate(user.role === "admin" ? "/all-complaints" : "/my-complaints")}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentComplaints.length > 0 ? (
              recentComplaints.map((complaint) => (
                <ComplaintCard key={complaint.id} complaint={complaint} />
              ))
            ) : (
              <p className="text-center py-4 text-gray-500">No complaints found</p>
            )}
          </div>
        </CardContent>
        {user.role === "resident" && (
          <CardFooter>
            <Button 
              className="w-full bg-municipal-primary hover:bg-municipal-primary/90"
              onClick={() => navigate("/submit-complaint")}
            >
              Submit New Complaint
            </Button>
          </CardFooter>
        )}
      </Card>
    </Layout>
  );
};

export default Dashboard;
