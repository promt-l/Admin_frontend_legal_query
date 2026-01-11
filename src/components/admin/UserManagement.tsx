import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Trash2 } from "lucide-react";
import { fetchUsers, fetchUser, deleteUser, User } from "@/lib/user.api";

/* ---------- Helpers ---------- */
const formatDate = (date?: string | Date) => {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString();
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Load Users ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ---------- View User ---------- */
  const handleViewUser = async (id: string) => {
    try {
      const user = await fetchUser(id);
      setSelectedUser(user);
      setIsDialogOpen(true);
    } catch {
      setError("Failed to fetch user details");
    }
  };

  /* ---------- Delete User ---------- */
  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch {
      setError("Failed to delete user");
    }
  };

  /* ---------- Filters ---------- */
  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (loading) return <div className="p-4 text-center">Loading users…</div>;
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-gray-600 text-sm">
          View and monitor registered platform users
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex gap-3 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users…"
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Client">Client</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>All registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Queries</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredUsers.map(u => (
                <TableRow key={u._id}>
                  <TableCell>
                    <div className="font-medium">{u.fullName}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">{u.role}</Badge>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`font-medium ${
                        u.status === "active"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {u.status}
                    </span>
                  </TableCell>

                  <TableCell>{u.queriesCount || 0}</TableCell>

                  <TableCell className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleViewUser(u._id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleDeleteUser(u._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Read-only user information</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-2 text-sm">
              <div><b>Name:</b> {selectedUser.fullName}</div>
              <div><b>Email:</b> {selectedUser.email}</div>
              <div><b>Phone:</b> {selectedUser.phone || "N/A"}</div>
              <div><b>Role:</b> {selectedUser.role}</div>
              <div><b>No. of queries:</b> {selectedUser.queriesCount}</div>
              <div><b>Status:</b> {selectedUser.status}</div>
              <div><b>Joined On:</b> {formatDate(selectedUser.createdAt)}</div>
              <div><b>Last Active:</b> {formatDate(selectedUser.lastActive)}</div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setIsDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
