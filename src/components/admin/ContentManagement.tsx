import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function ContentManagement() {
  const navigate = useNavigate();
  const location = useLocation();

  // get last segment of URL as active tab
  const currentTab = location.pathname.split("/").pop() || "home";

  return (
    <div className="space-y-6">
      <Tabs
        value={currentTab}
        onValueChange={(value) => navigate(value)}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="assistance">Assistance</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="about">About Website</TabsTrigger>
          <TabsTrigger value="contactus">Contact Us</TabsTrigger>
          <TabsTrigger value="sociallinks">Social Links</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Child route renders here */}
      <Outlet />
    </div>
  );
}
