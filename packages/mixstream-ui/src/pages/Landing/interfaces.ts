import { Profile, Session } from 'mixstream-shared';
export type JoinSessionParams = Pick<Session, 'channel'> &
  Pick<Profile, 'username' | 'role'> & {
    resolutionAndBitrate: string;
  };
