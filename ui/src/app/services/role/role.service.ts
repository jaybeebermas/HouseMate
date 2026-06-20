import { Injectable } from '@angular/core';
import { GraphqlService } from '../graphql/graphql.service';

export interface Role {
  id: string;
  name: string;
  guard_name: string;
  permissions?: Array<{ id: string; name: string }>;
  users_count: number;
}

export interface RoleInput {
  name: string;
  guard_name?: string;
  permissions?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly gqlFolder = 'roles';

  constructor(private readonly graphql: GraphqlService) {}

  async getAll(): Promise<Role[]> {
    const result = await this.graphql.requestFromFile<{ roles: Role[] }>(
      this.gqlFolder,
      'roles.gql'
    );
    return result.roles;
  }

  async create(input: RoleInput): Promise<Role> {
    const result = await this.graphql.requestFromFile<{ createRole: Role }>(
      this.gqlFolder,
      'create-role.gql',
      { input }
    );
    return result.createRole;
  }

  async update(id: string, input: RoleInput): Promise<Role> {
    const result = await this.graphql.requestFromFile<{ updateRole: Role }>(
      this.gqlFolder,
      'update-role.gql',
      { input: { id, ...input } }
    );
    return result.updateRole;
  }

  async delete(id: string): Promise<Role | null> {
    const result = await this.graphql.requestFromFile<{ deleteRole: Role | null }>(
      this.gqlFolder,
      'delete-role.gql',
      { id }
    );
    return result.deleteRole;
  }
}
