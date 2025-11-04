import { FileEntity } from './file.model';
export interface Folder {
  id?: string;
  name: string;
  folders?: Folder[];
  files?: FileEntity[];
}