import { FileEntity } from "./file.model";
import { Folder } from "./folder.model";

export interface Workspace {
  id?: string;
  name: string;
  description?: string;
  parentId?: string;
  type?: string;
  access?: string;
  folders?: Folder[];
  files?: FileEntity[];
  createdAt?: Date;
}
