import { Injectable } from '@angular/core';
import { GraphqlService } from '../graphql/graphql.service';
import { Permission, PermissionInput } from '../../shared/models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly gqlFolder = 'permissions';

  constructor(private readonly graphql: GraphqlService) {}

  async getPermissionRegistry(): Promise<{ availablePermissions: string[]; basePermissions: string[] }> {
    return this.graphql.requestFromFile<{ availablePermissions: string[]; basePermissions: string[] }>(
      this.gqlFolder,
      'permission-registry.gql'
    );
  }

  async getAll(): Promise<Permission[]> {
    const result = await this.graphql.requestFromFile<{ permissions: Permission[] }>(
      this.gqlFolder,
      'permissions.gql'
    );
    return result.permissions;
  }

  async create(input: PermissionInput): Promise<Permission> {
    const result = await this.graphql.requestFromFile<{ createPermission: Permission }>(
      this.gqlFolder,
      'create-permission.gql',
      { input }
    );
    return result.createPermission;
  }

  async update(id: string, input: PermissionInput): Promise<Permission> {
    const result = await this.graphql.requestFromFile<{ updatePermission: Permission }>(
      this.gqlFolder,
      'update-permission.gql',
      { input: { id, ...input } }
    );
    return result.updatePermission;
  }

  async delete(id: string): Promise<Permission | null> {
    const result = await this.graphql.requestFromFile<{ deletePermission: Permission | null }>(
      this.gqlFolder,
      'delete-permission.gql',
      { id }
    );
    return result.deletePermission;
  }
}
