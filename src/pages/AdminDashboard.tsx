import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

import AdminNavigation from "@/components/admin/AdminNavigation";
import QueryManagement from "@/components/admin/QueryManagement";
import UserManagement from "@/components/admin/UserManagement";
import ContentManagement from "@/components/admin/ContentManagement";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import SupportQueries from "@/components/admin/SupportQueries";
import AdminOverview from "@/components/admin/AdminOverview";

import {
  MessageSquare,
  Users,
  FileText,
  BarChart3,
} from "lucide-react";

/* ---------------- Types ---------------- */

export type QueryStatus = "pending" | "in progress" | "answered" | "closed";

export interface IQuery {
  _id: string;
  fullName: string;
  email: string;
  issueCategory: string;
  status: QueryStatus;
  createdAt: string;
}

/* ---------------- Sidebar ---------------- */

import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Home from "@/components/admin/Content/Home/Home";
import AssistancePage from "@/components/admin/Content/Assistance/Assistance";
import FAQs from "@/components/admin/Content/FAQs/Faq";
import AboutSection from "@/components/admin/Content/AboutWebsite/AboutWebsite";
import ContactUs from "@/components/admin/Content/ContactUs/ContactUs";
import SocialLinks from "@/components/admin/Content/SocialLinks/SocialLinks";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { label: "Overview", path: "/admin", icon: BarChart3 },
    { label: "Queries", path: "/admin/queries", icon: MessageSquare },
    { label: "Support", path: "/admin/support", icon: MessageSquare },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Content", path: "/admin/content", icon: FileText },
    { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  ];

  return (
    <aside className="hidden lg:block w-64 bg-white border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
        <p className="text-sm text-gray-500">Legal Aid Platform</p>
      </div>

      <nav className="p-3 space-y-2">
        {items.map((item) => (
          <Button
            key={item.path}
            variant={
              location.pathname === item.path ? "secondary" : "ghost"
            }
            className="w-full justify-start"
            onClick={() => navigate(item.path)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>
    </aside>
  );
};

/* ---------------- Component ---------------- */

const AdminDashboard = () => {
  const [recentQueries, setRecentQueries] = useState<IQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statsData, setStatsData] = useState({
    totalQueries: 0,
    activeUsers: 0,
    casesResolved: 0,
    resolutionRate: "0%",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [analyticsRes, queriesRes] = await Promise.all([
          axios.get("http://localhost:3000/api/analytics", {
            withCredentials: true,
          }),
          axios.get("http://localhost:3000/api/queries", {
            withCredentials: true,
          }),
        ]);

        setStatsData({
          totalQueries: analyticsRes.data.totalQueries,
          activeUsers: analyticsRes.data.activeUsers,
          casesResolved: analyticsRes.data.casesResolved,
          resolutionRate: analyticsRes.data.resolutionRate,
        });

        setRecentQueries(queriesRes.data.slice(0, 5));
        setError(null);
      } catch {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { title: "Total Queries", value: statsData.totalQueries, icon: MessageSquare, color: "text-blue-600" },
    { title: "Active Users", value: statsData.activeUsers, icon: Users, color: "text-green-600" },
    { title: "Resolved Cases", value: statsData.casesResolved, icon: FileText, color: "text-purple-600" },
    { title: "Resolution Rate", value: statsData.resolutionRate, icon: BarChart3, color: "text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route
              index
              element={
                <AdminOverview
                  loading={loading}
                  error={error}
                  stats={stats}
                  recentQueries={recentQueries}
                />
              }
            />
            <Route path="queries" element={<QueryManagement />} />
            <Route path="support" element={<SupportQueries />} />
            <Route path="users" element={<UserManagement />} />

            <Route path="content/*" element={<ContentManagement />}>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<Home />} />
                <Route path="assistance" element={<AssistancePage />} />
                <Route path="faqs" element={<FAQs/>} />
                <Route path="about" element={<AboutSection />} />
                <Route path="contactus" element={<ContactUs />} />
                <Route path="sociallinks" element={<SocialLinks />} />
            </Route>

            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="*" element={<Navigate to="/admin" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
