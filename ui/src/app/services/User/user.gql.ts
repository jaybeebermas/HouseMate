export const GET_USERS = `
  query GetUsers {
    users {
      id
      username
      first_name
      last_name
      email
      role
      created_at
      updated_at
    }
  }
`;

export const GET_USER = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      username
      first_name
      last_name
      email
      role
      created_at
      updated_at
    }
  }
`;

export const CREATE_USER = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      username
      first_name
      last_name
      email
      role
    }
  }
`;

export const UPDATE_USER = `
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      username
      first_name
      last_name
      email
      role
    }
  }
`;

export const DELETE_USER = `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;
