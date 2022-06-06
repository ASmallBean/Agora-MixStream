import { notification } from 'antd';
import { FC, PropsWithChildren } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProfileProvider } from '../hooks/profile';
import { SessionProvider } from '../hooks/session';
import BlankLayout from './BlankLayout';

const AuthLayout: FC<PropsWithChildren<{}>> = ({ children }) => {
  const { sessionId, profileId } = useParams<{ sessionId: string; profileId: string }>();
  const navigator = useNavigate();
  if (!sessionId || !profileId) {
    notification.error({
      message: '参数错误',
      description: 'sessionId 或者 profileId 不正确',
    });
    navigator('/');
    return null;
  }

  return (
    <BlankLayout>
      <ProfileProvider sessionId={sessionId} profileId={profileId}>
        <SessionProvider sessionId={sessionId}>{children}</SessionProvider>
      </ProfileProvider>
    </BlankLayout>
  );
};
export default AuthLayout;
