import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

@Injectable({
  providedIn: 'root'
})
export class GraphqlService {
  private readonly endpointBaseUrl = environment.graphqlUrl;
  private readonly documentBaseUrl = '/gql';
  private readonly queryCache = new Map<string, string>();
  private readonly requestTimeoutMs = 10000;

  async request<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await this.withTimeout(
      fetch(this.endpointBaseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables })
      }),
      this.requestTimeoutMs,
      'GraphQL request timed out.'
    );

    const payload = (await response.json()) as GraphqlResponse<T>;

    if (payload.errors?.length) {
      throw new Error(payload.errors[0].message);
    }

    if (!payload.data) {
      throw new Error('No GraphQL data returned.');
    }

    return payload.data;
  }

  async requestFromFile<T>(
    folder: string,
    fileName: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    const query = await this.getQueryDocument(folder, fileName);
    return this.request<T>(query, variables);
  }

  private async getQueryDocument(folder: string, fileName: string): Promise<string> {
    const normalizedFolder = folder.replace(/^\/+|\/+$/g, '');
    const normalizedFileName = fileName.replace(/^\/+/, '');
    const path = `${this.documentBaseUrl}/${normalizedFolder}/${normalizedFileName}`;

    const cached = this.queryCache.get(path);
    if (cached) {
      return cached;
    }

    const response = await this.withTimeout(
      fetch(path, {
        method: 'GET',
        headers: {
          Accept: 'application/graphql'
        }
      }),
      this.requestTimeoutMs,
      `Failed to load GraphQL document (timeout): ${path}`
    );

    if (!response.ok) {
      throw new Error(`Failed to load GraphQL document: ${path}`);
    }

    const query = await response.text();
    this.queryCache.set(path, query);
    return query;
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }
}
