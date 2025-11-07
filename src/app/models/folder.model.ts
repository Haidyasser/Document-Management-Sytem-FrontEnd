import { FileEntity } from "./file.model";

export interface Folder {
description: any;
  id?: string;
  name: string;
  files?: FileEntity[];
  createdAt?: Date;
}
