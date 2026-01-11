import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Eye } from "lucide-react";
import type { QueryStatus } from "@/lib/query.api";
import { updateQuery } from "@/lib/query.api";

interface Props {
  loading: boolean;
  error: string | null;
  stats: any[];
  recentQueries: any[];
}

/* STATUS COLOR (REUSED) */
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

const AdminOverview = ({ loading, error, stats, recentQueries }: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<any | null>(null);
  const [localQueries, setLocalQueries] = useState<any[]>(recentQueries);

  /* keep local state in sync */
  if (localQueries !== recentQueries) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    setTimeout(() => setLocalQueries(recentQueries), 0);
  }

  if (loading) {
    return (
      <div className="text-center p-10 text-gray-500">
        Loading Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 text-red-600 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  /* OPEN DIALOG + AUTO STATUS UPDATE */
  const openDialog = async (query: any) => {
    let updatedQuery = query;

    if (query.status === "pending") {
      try {
        updatedQuery = await updateQuery(query._id, {
          status: "in progress",
        });

        setLocalQueries((prev) =>
          prev.map((q) => (q._id === query._id ? updatedQuery : q))
        );
      } catch {
        // silently fail (backend will still enforce)
      }
    }

    setSelectedQuery(updatedQuery);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedQuery(null);
  };

  /* ONLY TODAY’S QUERIES */
  const todayQueries = localQueries.filter((q) => {
    if (!q.createdAt) return false;

    const queryDate = new Date(q.createdAt);
    const today = new Date();

    return (
      queryDate.getDate() === today.getDate() &&
      queryDate.getMonth() === today.getMonth() &&
      queryDate.getFullYear() === today.getFullYear()
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 mt-1">
          Monitor platform performance and user activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Queries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Queries</CardTitle>
          <CardDescription>
            Latest legal queries submitted by users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayQueries.length ? (
              todayQueries.map((q) => (
                <div
                  key={q._id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{q.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {q.issueCategory}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getStatusColor(q.status as QueryStatus)}
                      className="capitalize"
                    >
                      {q.status}
                    </Badge>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => openDialog(q)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-center text-muted-foreground">
                No queries submitted today.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* VIEW DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Query Details</DialogTitle>
            <DialogDescription>
              View submitted query information
            </DialogDescription>
          </DialogHeader>

          {selectedQuery && (
            <div className="space-y-3 text-sm">
              <div>
                <Label>User</Label>
                <p>{selectedQuery.fullName}</p>
              </div>

              <div>
                <Label>Email</Label>
                <p className="truncate">{selectedQuery.email}</p>
              </div>

              <div>
                <Label>Category</Label>
                <p>{selectedQuery.issueCategory}</p>
              </div>

              <div>
                <Label>Subject</Label>
                <p>{selectedQuery.subject}</p>
              </div>

              <div>
                <Label>Description</Label>
                <p>{selectedQuery.question}</p>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Status</Label>
                <Badge
                  variant={getStatusColor(
                    selectedQuery.status as QueryStatus
                  )}
                  className="capitalize w-fit"
                >
                  {selectedQuery.status}
                </Badge>
              </div>

              <div className="pt-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={closeDialog}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOverview;
