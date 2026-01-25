import { prisma } from "../config/prisma";
import { User, Prisma, Role } from "@prisma/client";
import { genSalt, hash } from "bcrypt";

export class UserService {
  /**
   * Create a new user with hashed password
   */
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const salt = await genSalt(10);
    const hashedPassword = await hash(data.password, salt);

    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  /**
   * Find a user by their email address
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find a user by their ID
   */
  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Update user details (Profile)
   */
  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a user (Admin)
   */
  async deleteUser(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Update user role (Admin)
   */
  async updateUserRole(id: string, role: Role): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  /**
   * Update user password (internal use)
   */
  async updatePassword(id: string, password: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { password },
    });
  }

  /**
   * Update user status (Active/Suspended)
   */
  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    // If suspending, revoke all refresh tokens
    if (!isActive) {
      await prisma.refreshToken.updateMany({
        where: { userId: id },
        data: { revoked: true },
      });
    }

    return prisma.user.update({
      where: { id },
      data: { isActive },
    });
  }
}

export const userService = new UserService();
