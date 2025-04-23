
export interface FileInterface {
  id: string;
  name: string;
  size: number;
  type: string;
  owner: string;
  ipfsHash: string;
  uploadDate: Date;
  viewers: string[];
}
