export interface User {
  id: number;
  name: string;
  role: string;
}

export interface LoginRequest {
  name: string;
  pin: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (name: string, pin: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
