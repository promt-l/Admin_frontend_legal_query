import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Eye, Edit, Trash2, ChevronDown, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  fetchQueries,
  fetchQuery,
  updateQuery,
  deleteQuery,
  Query,
  QueryStatus,
  QueryUrgency,
} from "@/lib/query.api";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface QueryManagementProps {
  onReplyClick?: (userId: number) => void;
}

type DialogMode = "view" | "edit" | null;

const QueryManagement = ({ onReplyClick }: QueryManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [queries, setQueries] = useState<Query[]>([]);
  
  const [statusEdit, setStatusEdit] = useState<QueryStatus>("pending");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueries()
      .then(setQueries)
      .catch(() => toast({ title: "Failed to fetch queries", variant: "destructive" }));
  }, [toast]);

  // Export logic
  const getFilteredQueriesByDateRange = (days?: number) => {
    if (!days) return filteredQueries; // "All" option
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return filteredQueries.filter(query => {
      if (!query.createdAt) return false;
      const queryDate = new Date(query.createdAt);
      return queryDate >= startDate;
    });
  };

  const exportToCSV = (data: Query[], filename: string) => {
    const headers = [
      'Date',
      'User Name',
      'Email', 
      'Category',
      'Subject',
      'Description',
      'Status',
      
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(query => [
        query.createdAt ? new Date(query.createdAt).toLocaleDateString() : '',
        `"${query.fullName || ''}"`,
        `"${query.email || ''}"`,
        `"${query.issueCategory || ''}"`,
        `"${query.subject || ''}"`,
        `"${(query.question || '').replace(/"/g, '""')}"`,
        `"${query.urgencyLevel || ''}"`,
        `"${query.status || ''}"`,
        `"${query.age || ''}"`,
        `"${query.gender || ''}"`,
        `"${query.city || ''}"`,
        `"${(query.status || '').replace(/"/g, '""')}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: `Export completed: ${filename}`, variant: "default" });
  };

  const handleExport = (period: string) => {
    let data: Query[];
    let filename: string;
    const timestamp = new Date().toISOString().split('T')[0];

    switch (period) {
      case 'today':
        data = getFilteredQueriesByDateRange(1);
        filename = `queries_today_${timestamp}.csv`;
        break;
      case 'lastMonth':
        data = getFilteredQueriesByDateRange(30);
        filename = `queries_last_month_${timestamp}.csv`;
        break;
      case 'last3Months':
        data = getFilteredQueriesByDateRange(90);
        filename = `queries_last_3_months_${timestamp}.csv`;
        break;
      case 'last6Months':
        data = getFilteredQueriesByDateRange(180);
        filename = `queries_last_6_months_${timestamp}.csv`;
        break;
      case 'all':
      default:
        data = filteredQueries;
        filename = `queries_all_${timestamp}.csv`;
        break;
    }

    if (data.length === 0) {
      toast({ title: "No data to export for selected period", variant: "destructive" });
      return;
    }

    exportToCSV(data, filename);
  };

  // Filtering
  const filteredQueries = queries.filter(query => {
    const matchesSearch =
      (query.fullName?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (query.subject?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (query.issueCategory?.toLowerCase() ?? "").includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || query.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Color helpers
  const getStatusColor = (status: QueryStatus) => {
    switch (status) {
      case "answered":
        return "default";
      case "in progress":
        return "secondary";
      case "pending":
        return "destructive";
      case "closed":
        return "outline";
      default:
        return "outline";
    }
  };
  

  // Dialog logic
  const openDialog = async (query: Query, mode: DialogMode) => {
  const latestQuery = await fetchQuery(query._id);

  let updatedQuery = latestQuery;

  // AUTO MOVE PENDING - IN PROGRESS ON VIEW
  if (mode === "view" && latestQuery.status === "pending") {
    try {
      updatedQuery = await updateQuery(latestQuery._id, {
        status: "in progress",
      });

      // Update list state immediately
      setQueries(qs =>
        qs.map(q => q._id === updatedQuery._id ? updatedQuery : q)
      );
    } catch (err) {
      toast({
        title: "Failed to update status",
        variant: "destructive",
      });
    }
  }

  setSelectedQuery(updatedQuery);
  setStatusEdit(updatedQuery.status);
  setDialogMode(mode);

  

  setDialogOpen(true);
};


  const closeDialog = () => {
    setDialogOpen(false);
    setDialogMode(null);
    setSelectedQuery(null);
  };

  // View: allow status and response update (but not other fields)
  const handleStatusChange = async (newStatus: string) => {
  if (!selectedQuery) return;

  // Block everything except closing
  if (newStatus !== "closed") return;

  // Already closed - do nothing
  if (selectedQuery.status === "closed") return;

  setStatusEdit("closed");

  try {
    const updated = await updateQuery(selectedQuery._id, {
      status: "closed",
    });

    setQueries(qs =>
      qs.map(q => q._id === selectedQuery._id ? updated : q)
    );

    setSelectedQuery(updated);
    toast({ title: "Query closed", variant: "default" });
  } catch {
    toast({ title: "Failed to close query", variant: "destructive" });
  }
};


  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this query?")) return;
    try {
      await deleteQuery(id);
      setQueries(qs => qs.filter(q => q._id !== id));
      toast({ title: "Query deleted", variant: "default" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  // Dialog content: view or edit
  const renderDialogContent = () => {
    if (!selectedQuery) return null;
    if (dialogMode === "view") {
      return (
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <div>
              <Label className="text-xs sm:text-sm">Full Name</Label>
              <p className="text-xs sm:text-sm mt-1">{selectedQuery.fullName}</p>
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Email</Label>
              <p className="text-xs sm:text-sm mt-1 truncate">{selectedQuery.email}</p>
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Phone</Label>
              <p className="text-xs sm:text-sm mt-1 truncate">{selectedQuery.phone}</p>
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Age</Label>
              <p className="text-xs sm:text-sm mt-1 truncate">{selectedQuery.age}</p>
            </div>
            <div>
              <Label className="text-xs sm:text-sm">City</Label>
              <p className="text-xs sm:text-sm mt-1 truncate">{selectedQuery.city}</p>
            </div>
            <div>
              <Label className="text-xs sm:text-sm">State</Label>
              <p className="text-xs sm:text-sm mt-1 truncate">{selectedQuery.state}</p>
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Category</Label>
              <p className="text-xs sm:text-sm mt-1">{selectedQuery.issueCategory}</p>
            </div>

          </div>
          <div>
            <Label className="text-xs sm:text-sm">Subject</Label>
            <p className="text-xs sm:text-sm mt-1">{selectedQuery.subject}</p>
          </div>
          <div>
            <Label className="text-xs sm:text-sm">Description</Label>
            <p className="text-xs sm:text-sm mt-1">{selectedQuery.question}</p>
          </div>
          <div>
  <Label className="text-xs sm:text-sm">Status</Label>

  <Select
    value={statusEdit}
    onValueChange={handleStatusChange}
    disabled={statusEdit === "closed"} 
  >
    <SelectTrigger className="mt-1 h-8 sm:h-9 text-xs sm:text-sm">
      <SelectValue />
    </SelectTrigger>

    <SelectContent>
      {/* show current status as read-only */}
      <SelectItem value={statusEdit}>
        {statusEdit}
      </SelectItem>

      {/* ONLY allow closing */}
      {statusEdit !== "closed" && (
        <SelectItem value="closed">Closed</SelectItem>
      )}
    </SelectContent>
  </Select>
</div>

         
          <div className="flex flex-col xs:flex-row gap-2 pt-2 sm:pt-4">
            <Button variant="outline" className="flex-1 h-8 sm:h-9 text-xs sm:text-sm" onClick={closeDialog}>Close</Button>
          </div>
        </div>
      );
    } else if (dialogMode === "edit") {
      return (
        <div className="space-y-3 sm:space-y-4">
          
         
          <div>
            <Label className="text-xs sm:text-sm">Status</Label>
            <Select value={statusEdit} onValueChange={v => setStatusEdit(v as QueryStatus)}>
              <SelectTrigger className="mt-1 h-8 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              
            </Select>
          </div>
        
          <div className="flex flex-col xs:flex-row gap-2 pt-2 sm:pt-4">
            <Button variant="outline" className="flex-1 h-8 sm:h-9 text-xs sm:text-sm" onClick={closeDialog}>Cancel</Button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">Query Management</h1>
        <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">Manage and respond to user legal queries</p>
      </div>
      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3 lg:pb-6">
          <CardTitle className="text-sm sm:text-base lg:text-lg xl:text-xl">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
          <div className="flex flex-col space-y-2 sm:space-y-3 lg:flex-row lg:space-y-0 lg:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-2 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <Input
                  placeholder="Search queries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 sm:pl-10 h-8 sm:h-9 lg:h-10 text-xs sm:text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 lg:gap-4">
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v)}>
                <SelectTrigger className="w-full xs:w-[120px] sm:w-[140px] lg:w-[180px] h-8 sm:h-9 lg:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="answered">Answered</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full xs:w-auto h-8 sm:h-9 lg:h-10 text-xs sm:text-sm px-2 sm:px-3 lg:px-4">
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Export
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleExport('today')}>
                    <Download className="h-4 w-4 mr-2" />
                    Today
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('lastMonth')}>
                    <Download className="h-4 w-4 mr-2" />
                    Last Month
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('last3Months')}>
                    <Download className="h-4 w-4 mr-2" />
                    Last 3 Months
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('last6Months')}>
                    <Download className="h-4 w-4 mr-2" />
                    Last 6 Months
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('all')}>
                    <Download className="h-4 w-4 mr-2" />
                    All Data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2 sm:pb-3 lg:pb-6">
          <CardTitle className="text-sm sm:text-base lg:text-lg xl:text-xl">Legal Queries ({filteredQueries.length})</CardTitle>
          <CardDescription className="text-xs sm:text-sm lg:text-base">Manage all incoming legal queries from users</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-3 lg:px-6">
          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-2 sm:space-y-3">
            {filteredQueries.map((query) => (
              <Card key={query._id} className="p-3 sm:p-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-xs sm:text-sm truncate">{query.fullName}</div>
                      <div className="text-xs text-gray-600 truncate">{query.email}</div>
                      <div className="text-xs sm:text-sm font-medium mt-1 truncate">{query.subject}</div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        navigate(`/admin/support?queryId=${query._id}`);
                      }}
                      className="h-7 w-7 p-0"
                    >
                    <MessageSquare className="h-3 w-3" />
                  </Button>

                      <Dialog open={dialogOpen && selectedQuery?._id === query._id} onOpenChange={v => !v && closeDialog()}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDialog(query, "view")}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                         
                        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">
                              {dialogMode === "edit" ? "Edit Query" : "Query Details"}
                            </DialogTitle>
                            <DialogDescription className="text-xs sm:text-sm">
                              {dialogMode === "edit"
                                ? "Edit all query fields and save changes."
                                : "Review and respond to user query"}
                            </DialogDescription>
                          </DialogHeader>
                          {renderDialogContent()}
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" variant="outline" className="h-7 w-7 sm:h-8 sm:w-8 p-0" onClick={() => handleDelete(query._id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <Badge variant="outline" className="text-xs">{query.issueCategory}</Badge>
                    <Badge variant={getStatusColor(query.status)} className="text-xs">
                      {query.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    Date: {query.createdAt ? new Date(query.createdAt).toLocaleDateString() : ""}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs lg:text-sm">User</TableHead>
                  <TableHead className="text-xs lg:text-sm">Category</TableHead>
                  <TableHead className="text-xs lg:text-sm">Subject</TableHead>
                  <TableHead className="text-xs lg:text-sm">Status</TableHead>
                 
                  <TableHead className="text-xs lg:text-sm">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQueries.map((query) => (
                  <TableRow key={query._id}>
                    <TableCell className="py-2 lg:py-4">
                      <div>
                        <div className="font-medium text-xs lg:text-sm">{query.fullName}</div>
                        <div className="text-xs text-gray-600">{query.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 lg:py-4">
                      <Badge variant="outline" className="text-xs">{query.issueCategory}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate py-2 lg:py-4 text-xs lg:text-sm">{query.subject}</TableCell>
                    <TableCell className="py-2 lg:py-4">
                      <Badge variant={getStatusColor(query.status)} className="text-xs">
                        {query.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2 lg:py-4 text-xs lonClick={() => {}}g:text-sm">
                      {query.createdAt ? new Date(query.createdAt).toLocaleDateString() : ""}
                    </TableCell>
                    <TableCell className="py-2 lg:py-4">
                      <div className="flex space-x-1 lg:space-x-2">
                        <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          navigate(`/admin/support?queryId=${query._id}`);
                        }}
                        className="h-7 w-7 p-0"
                      >
                      <MessageSquare className="h-3 w-3" />
                    </Button>

                        <Dialog open={dialogOpen && selectedQuery?._id === query._id} onOpenChange={v => !v && closeDialog()}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDialog(query, "view")}
                              className="h-7 w-7 lg:h-8 lg:w-8 p-0"
                            >
                              <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                            </Button>
                          </DialogTrigger>
                          
                          <DialogContent className="max-w-md lg:max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                {dialogMode === "edit" ? "Edit Query" : "Query Details"}
                              </DialogTitle>
                              <DialogDescription>
                                {dialogMode === "edit"
                                  ? "Edit all query fields and save changes."
                                  : "Review and respond to user query"}
                              </DialogDescription>
                            </DialogHeader>
                            {renderDialogContent()}
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(query._id)} className="h-7 w-7 lg:h-8 lg:w-8 p-0">
                          <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueryManagement;