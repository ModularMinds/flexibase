import { RowDataPacket } from "mysql2";

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

interface User extends RowDataPacket {
  id: string;
  email: string;
  password: string;
}
