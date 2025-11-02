export interface Workspace {
  id?: string;
  name: string;
  description?: string;
  type: string;
  access: 'private' | 'public' | string;
}
export type CreateWorkspaceDto = Omit<Workspace, 'id'>;