import { Profile, Session, Signal, Stream, Whiteboard } from 'mixstream-shared';
import request from '../utils/request';

export type ProfileEntity = Profile & {
  streams: Stream[];
  signals: Signal[];
  whiteboard: Whiteboard;
};

export const findVideoStreamFromProfile = (profile: ProfileEntity | undefined) => {
  return profile?.streams[0];
};

export const createSession = (params: Pick<Session, 'channel'>) => request.post<Session>(`/session`, params);

export const getSession = (sessionId: string) => request.get<Session>(`/session/${sessionId}`);

export const createProfile = (sessionId: string, params: Pick<Profile, 'username' | 'role'>) =>
  request.post<Profile>(`/session/${sessionId}/profile`, params);

export const getProfile = (sessionId: string, profileId: string) =>
  request.get<ProfileEntity>(`/session/${sessionId}/profile/${profileId}`);

export const updateProfile = (
  sessionId: string,
  profileId: string,
  params: Partial<
    Pick<Profile, 'markable' | 'aspectRatio'> & {
      streams: Partial<Stream>[];
    }
  >
) => request.put<Profile>(`/session/${sessionId}/profile/${profileId}`, params);

export const checkInOut = (sessionId: string, profileId: string, isIn: boolean) =>
  request.patch<Profile>(`/session/${sessionId}/profile/${profileId}`, { isIn });

export const getWhiteboard = (uuid: string) => request.get<Whiteboard>(`/whiteboard/${uuid}`);
