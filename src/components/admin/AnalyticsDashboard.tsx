import { useEffect, useState } from "react";
import axios from "axios"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Users, MessageSquare, Download } from "lucide-react";
import { AnalyticsData } from "../../lib/types"; // Import types from the new file

const AnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("last30days");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Hitting your live API endpoint with the selected time range as a query parameter
        const response = await axios.get(
          `http://localhost:3000/api/analytics?range=${timeRange}`,
          {
            params: { range: timeRange },
            withCredentials: true,
          }
        );
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [timeRange]); // Re-fetches when timeRange changes

  // Handler to export chart data to CSV (no changes needed)
  const handleExport = () => {
    if (!data) return;

    const trends = data.queryTrends;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Month,Submitted Queries,Resolved Queries\n";

    trends.forEach(row => {
      csvContent += `${row.month},${row.queries},${row.resolved}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `query_trends_report_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (!data) return <div className="p-8 text-center">Failed to load analytics. Please try again.</div>;

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600">Platform performance metrics and insights</p>
        </div>
        <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-2 lg:space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full xs:w-[140px] lg:w-[180px] h-8 sm:h-9 lg:h-10 text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last90days">Last 90 days</SelectItem>
              <SelectItem value="lastyear">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-8 sm:h-9 lg:h-10 text-xs sm:text-sm px-2 sm:px-3 lg:px-4" onClick={handleExport}>
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* The rest of the JSX remains exactly the same, as it correctly reads from the 'data' state */}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs sm:text-sm lg:text-base font-medium">Total Queries</CardTitle>
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold">{data.totalQueries}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs sm:text-sm lg:text-base font-medium">Active Users</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold">{data.activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-2 sm:p-3 lg:p-4">
            <CardTitle className="text-xs sm:text-sm lg:text-base font-medium">Resolution Rate</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="p-2 sm:p-3 lg:p-4 pt-0">
            <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold">{data.resolutionRate}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-sm sm:text-base lg:text-lg xl:text-xl">Query Trends</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Monthly queries submitted and resolved</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <ResponsiveContainer width="100%" height={250} className="lg:h-[300px]">
              <BarChart data={data.queryTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="queries" fill="#3b82f6" name="Submitted" />
                <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-sm sm:text-base lg:text-lg xl:text-xl">Query Categories</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Distribution of queries by category</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <ResponsiveContainer width="100%" height={250} className="lg:h-[300px]">
              <PieChart>
                <Pie
                  data={data.categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {data.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || "#8884d8"} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} queries`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-sm sm:text-base lg:text-lg xl:text-xl">User Growth</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Monthly active users on the platform</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <ResponsiveContainer width="100%" height={250} className="lg:h-[300px]">
              <LineChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" name="Active Users" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;