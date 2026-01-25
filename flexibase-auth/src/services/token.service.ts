import { sign, verify } from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { v4 as uuidv4 } from "uuid";

export const generateAccessToken = (userId: string, role: string) => {
  return sign({ id: userId, role }, process.env.FLEXIBASE_AUTH_SECRET_KEY!, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = async (userId: string) => {
  const token = sign(
    { id: userId, version: uuidv4() },
    process.env.FLEXIBASE_AUTH_REFRESH_SECRET_KEY!,
    {
      expiresIn: "7d",
    },
  );

  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return token;
};

export const verifyRefreshToken = async (token: string) => {
  try {
    const payload = verify(
      token,
      process.env.FLEXIBASE_AUTH_REFRESH_SECRET_KEY!,
    ) as any;

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken || storedToken.revoked) {
      return null;
    }

    return { userId: payload.id, tokenId: storedToken.id };
  } catch {
    return null;
  }
};

export const revokeRefreshToken = async (tokenId: string) => {
  await prisma.refreshToken.update({
    where: { id: tokenId },
    data: { revoked: true },
  });
};
