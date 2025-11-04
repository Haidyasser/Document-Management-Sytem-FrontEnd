import { FileEntity } from "./file.model";

export interface Folder {
  id?: string;
  name: string;
  files?: FileEntity[];
  createdAt?: Date;
}
