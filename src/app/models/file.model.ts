export interface FileEntity {
  id?: string;
  name: string;
  type: string;
  path: string;
  createdAt?: Date;
  documentNo?: string;
  revisionNo?: string;
  sharedWith?: string[];
  size?: number;
}