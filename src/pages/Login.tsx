
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@/types";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<UserRole>("resident");
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await login(email, password, activeTab);
      navigate("/");
      toast({
        title: "Success",
        description: "You've been logged in successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-municipal-primary">Chitungwiza Municipality</h1>
          <p className="text-gray-600 mt-2">Grievance Management System</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Access the grievance management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="resident" className="w-full" onValueChange={(value) => setActiveTab(value as UserRole)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="resident">Resident</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleLogin}>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder={activeTab === "admin" ? "admin@chitungwiza.gov.zw" : "resident@example.com"}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="text-sm text-municipal-primary">
                        Forgot password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button className="w-full mt-6 bg-municipal-primary hover:bg-municipal-primary/90" type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              
              <TabsContent value="resident">
                <div className="mt-4 text-sm text-gray-500">
                  <p><strong>Demo Resident Access:</strong></p>
                  <p>Email: resident@example.com</p>
                  <p>Password: (any password will work)</p>
                </div>
              </TabsContent>
              
              <TabsContent value="admin">
                <div className="mt-4 text-sm text-gray-500">
                  <p><strong>Demo Admin Access:</strong></p>
                  <p>Email: admin@chitungwiza.gov.zw</p>
                  <p>Password: (any password will work)</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-gray-500">
              Note: This is a demo application. Use the credentials above to login.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
