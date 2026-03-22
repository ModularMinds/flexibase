"use client";

import { authApi } from "@/api";
import { useFlexibaseAuth } from "@/context/FlexibaseAuthProvider";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, Shield, Ban, CheckCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
  createdAt?: string;
}

const AuthenticatedUsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { fetchKey, triggerFetch } = useFlexibaseAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchKey]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authApi.get("/admin/get-users");
      // Adjust based on actual response structure
      // controller: res.status(200).json({ isSuccess: true, users: ... }) or similar
      setUsers(res.data.users || res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await authApi.delete(`/admin/users/${userId}`);
      triggerFetch((prev: number) => prev + 1);
    } catch (error) {
      console.error("Failed to delete user", error);
      alert("Failed to delete user");
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      await authApi.patch(`/admin/users/${userId}/role`, { role: newRole });
      triggerFetch((prev: number) => prev + 1);
    } catch (error) {
      console.error("Failed to update role", error);
      alert("Failed to update role");
    }
  };

  const handleStatusUpdate = async (userId: string, isActive: boolean) => {
    try {
      await authApi.patch(`/admin/users/${userId}/status`, { isActive });
      triggerFetch((prev: number) => prev + 1);
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status");
    }
  };

  return (
    <div className="px-10 py-5">
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => triggerFetch((prev: number) => prev + 1)}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  {loading ? "Loading..." : "No users found."}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "ADMIN" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={user.isActive ? "bg-green-500" : "bg-red-500"}
                    >
                      {user.isActive ? "Active" : "Suspended"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <span className="h-4 w-4">...</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            handleRoleUpdate(
                              user.id,
                              user.role === "ADMIN" ? "USER" : "ADMIN",
                            )
                          }
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          {user.role === "ADMIN"
                            ? "Demote to User"
                            : "Promote to Admin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusUpdate(user.id, !user.isActive)
                          }
                        >
                          {user.isActive ? (
                            <Ban className="mr-2 h-4 w-4" />
                          ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                          )}
                          {user.isActive ? "Suspend User" : "Activate User"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AuthenticatedUsersList;
