import { Request, Response } from "express";
import { userService } from "../../services";
import { AppError } from "../../utils/AppError";

export const deleteUserController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUserId = req.user?.id;

  if (id === currentUserId) {
    throw new AppError("You cannot delete yourself", 400);
  }

  await userService.deleteUser(id as string);

  res.json({ isSuccess: true, message: "User deleted successfully" });
};

export const updateUserRoleController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  await userService.updateUserRole(id as string, role);

  res.json({ isSuccess: true, message: "User role updated successfully" });
};

export const updateUserStatusController = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  const { isActive } = req.body;

  await userService.updateUserStatus(id as string, isActive);

  res.json({
    isSuccess: true,
    message: `User ${isActive ? "activated" : "suspended"} successfully`,
  });
};
