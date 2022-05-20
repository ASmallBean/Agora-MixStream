export enum StreamKind {
  SCREEN = 1,
}

export interface Stream {
  id: string;
  appId: string;
  uid: number;
  token: string;
  kind: StreamKind;
  audio: boolean;
  video: boolean;
  createdAt: Date;
  expiredAt: Date;
}
