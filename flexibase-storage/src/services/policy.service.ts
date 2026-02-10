import { File, FileVisibility } from "@prisma/client";

export interface UserContext {
  id: string;
  role: string;
}

export const policyService = {
  /**
   * Check if user can read file metadata or content
   */
  canRead: (file: File, user?: UserContext): boolean => {
    // Public files are readable by everyone
    if (file.visibility === FileVisibility.PUBLIC) {
      return true;
    }

    // Admins can read everything
    if (user?.role === "admin" || user?.role === "ADMIN") {
      return true;
    }

    // Owners can read their private files
    if (user && file.userId === user.id) {
      return true;
    }

    return false;
  },

  /**
   * Check if user can delete a file
   */
  canDelete: (file: File, user: UserContext): boolean => {
    // Admins can delete everything
    if (user.role === "admin" || user.role === "ADMIN") {
      return true;
    }

    // Only owners can delete their files
    return file.userId === user.id;
  },

  /**
   * Check if user can update file metadata (e.g. visibility)
   */
  canUpdate: (file: File, user: UserContext): boolean => {
    if (user.role === "admin" || user.role === "ADMIN") {
      return true;
    }
    return file.userId === user.id;
  },
};
