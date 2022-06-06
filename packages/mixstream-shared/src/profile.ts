export enum RoleType {
  HOST = 0,
  NORMAL = 1,
}

export interface Profile {
  id: string;
  username: string;
  role: RoleType;
  aspectRatio: number;
  markable: boolean;
  createdAt: Date;
  expiredAt: Date;
}
