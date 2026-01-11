
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">The admin page you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
