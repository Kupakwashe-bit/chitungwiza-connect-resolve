
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useComplaints } from "@/contexts/ComplaintsContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { subDays, format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

const Reports = () => {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const navigate = useNavigate();

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  // Calculate time periods
  const today = new Date();
  const last7Days = subDays(today, 6);
  const last30Days = subDays(today, 29);
  const last90Days = subDays(today, 89);

  // Status distribution chart
  const statusData = [
    { name: "Pending", value: complaints.filter(c => c.status === "pending").length, color: "#f59e0b" },
    { name: "In Progress", value: complaints.filter(c => c.status === "in-progress").length, color: "#3b82f6" },
    { name: "Resolved", value: complaints.filter(c => c.status === "resolved").length, color: "#10b981" },
    { name: "Rejected", value: complaints.filter(c => c.status === "rejected").length, color: "#ef4444" },
  ];

  // Category distribution chart
  const categoryData = Object.entries(
    complaints.reduce((acc, complaint) => {
      const category = complaint.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name: name.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
    value
  })).sort((a, b) => b.value - a.value);

  // Time trend chart
  const getDailyTrend = (startDate: Date, endDate: Date = today) => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(day => {
      const date = format(day, "MMM dd");
      const count = complaints.filter(complaint => {
        const complaintDate = new Date(complaint.createdAt);
        return complaintDate.getDate() === day.getDate() &&
               complaintDate.getMonth() === day.getMonth() &&
               complaintDate.getFullYear() === day.getFullYear();
      }).length;
      
      return { date, count };
    });
  };

  const trend7Days = getDailyTrend(last7Days);
  const trend30Days = getDailyTrend(last30Days);

  // Category response time
  const categoryResponseTime = Object.entries(
    complaints.filter(c => c.status === "resolved")
      .reduce((acc, complaint) => {
        const category = complaint.category;
        const createDate = new Date(complaint.createdAt);
        const updateDate = new Date(complaint.updatedAt);
        const responseTime = (updateDate.getTime() - createDate.getTime()) / (1000 * 60 * 60 * 24); // in days
        
        if (!acc[category]) {
          acc[category] = { total: 0, count: 0 };
        }
        
        acc[category].total += responseTime;
        acc[category].count += 1;
        
        return acc;
      }, {} as Record<string, { total: number, count: number }>)
  ).map(([name, { total, count }]) => ({
    name: name.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
    value: Math.round((total / count) * 10) / 10 // Average with 1 decimal place
  })).sort((a, b) => b.value - a.value);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">
          View analytics and statistics about complaint management
        </p>
      </div>

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Complaints by Status</CardTitle>
                <CardDescription>Distribution of complaints by current status</CardDescription>
              </CardHeader>
              <CardContent>
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
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryData}
                      layout="vertical"
                      margin={{
                        top: 20,
                        right: 30,
                        left: 90,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={90} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0055a4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Complaint Submission Trends</CardTitle>
              <CardDescription>Number of complaints received over time</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="7days">
                <TabsList className="mb-4">
                  <TabsTrigger value="7days">Last 7 Days</TabsTrigger>
                  <TabsTrigger value="30days">Last 30 Days</TabsTrigger>
                </TabsList>
                
                <TabsContent value="7days">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trend7Days}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          name="Complaints"
                          stroke="#0055a4"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                
                <TabsContent value="30days">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trend30Days}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          name="Complaints"
                          stroke="#0055a4"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Average Resolution Time by Category</CardTitle>
              <CardDescription>Average days to resolve complaints by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryResponseTime}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 30,
                      left: 90,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" unit=" days" />
                    <YAxis dataKey="name" type="category" width={90} />
                    <Tooltip formatter={(value) => [`${value} days`, "Avg. Resolution Time"]} />
                    <Bar dataKey="value" name="Avg. Days to Resolve" fill="#28a745" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Reports;
