import { Injectable } from '@angular/core';
import { GraphqlService } from '../graphql/graphql.service';
import { NavigationItem } from '../../shared/models/navigation.model';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly gqlFolder = 'navigation';

  constructor(private readonly graphql: GraphqlService) {}

  async getNavigation(): Promise<NavigationItem[]> {
    const result = await this.graphql.requestFromFile<{ navigation: NavigationItem[] }>(
      this.gqlFolder,
      'navigation.gql'
    );
    return result.navigation;
  }
}
