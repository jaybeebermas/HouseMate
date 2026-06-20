export interface Permission {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface PermissionInput {
  name: string;
}
