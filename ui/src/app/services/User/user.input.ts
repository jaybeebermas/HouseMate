export interface CreateUserInput {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserInput {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  role?: string;
}
