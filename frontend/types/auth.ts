export type Credentials = {
  email: string;
  password: string;
};

export type RegistrationPayload = Credentials & {
  name: string;
};

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type AuthContextValue = {
  token: string | null;
  user: AuthResponse['user'] | null;
  initialising: boolean;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  register: (payload: RegistrationPayload) => Promise<void>;
  logout: () => void;
};
