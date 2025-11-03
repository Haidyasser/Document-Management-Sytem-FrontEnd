import { Folder } from './folder.model';
import { FileEntity } from './file.model';
export interface Workspace {
  id?: string;
  name: string;
  description: string;
  type: string;
  access: string;
  folders?: Folder[];
  files?: FileEntity[];
}
export type { Folder, FileEntity };

