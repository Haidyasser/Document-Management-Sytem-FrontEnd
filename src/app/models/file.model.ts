export interface FileEntity {
  id?: string;
  displayName: string;
  type: string;
  path: string;
  createdAt?: Date;
  documentNo?: string;
  revisionNo?: string;
  sharedWith?: string[];
  size?: number;
}