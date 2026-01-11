import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Bell, User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logout } from "../../lib/auth.api"; 

const AdminNavigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout(); 

      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });

      navigate("/login", { replace: true });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 xl:px-6">
        <div className="flex justify-between items-center h-12 sm:h-14 lg:h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1 sm:space-x-2 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs sm:text-sm">LA</span>
            </div>
            <span className="font-bold text-xs sm:text-sm lg:text-base xl:text-lg text-gray-900 hidden xs:block truncate">
              Legal Aid Admin
            </span>
          </Link>

          {/* Right Section */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
            
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 p-0"
            >
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 sm:h-8 lg:h-9 px-1 sm:px-2 lg:px-3"
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-0 sm:mr-1 lg:mr-2" />
              <span className="hidden sm:inline text-xs sm:text-sm">
                Admin
              </span>
            </Button>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-7 sm:h-8 lg:h-9 px-2 sm:px-3"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline text-xs sm:text-sm">
                Logout
              </span>
            </Button>
            
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavigation;
