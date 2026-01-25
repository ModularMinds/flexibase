import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      id?: string;
    }
  }
}

export interface UserPayload extends JwtPayload {
  id: string;
  role: string;
}
