import { compare, genSalt, hash } from "bcrypt";
import { User } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { userService } from "./user.service";

export class AuthService {
  /**
   * Verify credentials and return the user if valid.
   * Throws AppError 401 if invalid.
   */
  async verifyCredentials(email: string, password: string): Promise<User> {
    const user = await userService.findUserByEmail(email);

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    if (!user.isActive) {
      throw new AppError("Account is suspended", 403);
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    return user;
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    oldPass: string,
    newPass: string,
  ): Promise<User> {
    const user = await userService.findUserById(userId);
    if (!user) throw new AppError("User not found", 404);

    const isMatch = await compare(oldPass, user.password);
    if (!isMatch) throw new AppError("Invalid old password", 401);

    const salt = await genSalt(10);
    const hashed = await hash(newPass, salt);

    return userService.updatePassword(userId, hashed);
  }
}

export const authService = new AuthService();
