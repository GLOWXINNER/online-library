export type AuthLoginRequest = {
  email: string;
  password: string;
};

export type AuthRegisterRequest = {
  email: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: "bearer" | string;
};
