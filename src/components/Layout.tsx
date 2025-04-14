
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-municipal-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-white mr-2"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
              <h1 className="text-xl font-bold">Chitungwiza Municipality</h1>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline">
                Welcome, {user.name} ({user.role})
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar for authenticated users */}
        {user && (
          <aside 
            className={cn(
              "bg-white shadow-md w-64 md:w-64 flex-shrink-0 fixed md:static h-full md:h-auto z-10 transition-all duration-300 ease-in-out",
              sidebarOpen ? "left-0" : "-left-64 md:left-0"
            )}
          >
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/");
                      setSidebarOpen(false);
                    }}
                  >
                    Dashboard
                  </Button>
                </li>
                {user.role === "resident" && (
                  <>
                    <li>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => {
                          navigate("/submit-complaint");
                          setSidebarOpen(false);
                        }}
                      >
                        Submit Complaint
                      </Button>
                    </li>
                    <li>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => {
                          navigate("/my-complaints");
                          setSidebarOpen(false);
                        }}
                      >
                        My Complaints
                      </Button>
                    </li>
                  </>
                )}
                {user.role === "admin" && (
                  <>
                    <li>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => {
                          navigate("/all-complaints");
                          setSidebarOpen(false);
                        }}
                      >
                        All Complaints
                      </Button>
                    </li>
                    <li>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => {
                          navigate("/reports");
                          setSidebarOpen(false);
                        }}
                      >
                        Reports
                      </Button>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6">
          {/* Overlay for mobile sidebar */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-municipal-dark text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Chitungwiza Municipality. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
