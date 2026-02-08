export type AuthUser = {
  sub: string;
  role: "staff" | "admin";
  name?: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
