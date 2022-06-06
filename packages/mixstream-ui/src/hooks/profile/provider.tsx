import { FC, PropsWithChildren, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncFn } from 'react-use';
import { getProfile } from '../../services/api';
import { ProfileContext } from './context';

export interface ProfileProviderProps {
  sessionId: string;
  profileId: string;
}

export const ProfileProvider: FC<PropsWithChildren<ProfileProviderProps>> = ({ children, sessionId, profileId }) => {
  const navigator = useNavigate();

  const [state, fetch] = useAsyncFn(() =>
    getProfile(sessionId, profileId)
      .then((data) => {
        if (data.status !== 200) {
          navigator('/');
        }
        return data;
      })
      .catch((err) => {
        if (err) {
          navigator('/');
        }
      })
  );
  const refetchProfile = () => {
    fetch();
  };

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <ProfileContext.Provider
      value={{
        profile: state.value?.data,
        refetchProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
