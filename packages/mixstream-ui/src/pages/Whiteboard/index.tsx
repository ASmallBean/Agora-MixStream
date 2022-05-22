import { notification } from 'antd';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGlobal } from '../../hooks/global/useGlobal';
import { ProfileProvider } from '../../hooks/profile';
import { SessionProvider } from '../../hooks/session';
import WhiteboardMain from './main';

export const WhiteboardTitle = 'MixStream-Whiteboard';

const Whiteboard = () => {
  const { sessionId, profileId } = useParams<{ sessionId: string; profileId: string }>();
  const navigator = useNavigate();
  const { setTitleBar } = useGlobal();

  useEffect(() => {
    document.title = WhiteboardTitle;
    setTitleBar((pre) => {
      return {
        title: '',
        visible: false,
      };
    });
  }, [setTitleBar]);

  if (!sessionId || !profileId) {
    notification.error({
      message: '参数错误',
      description: 'sessionId 或者 profileId 不正确',
    });
    navigator('/');
    return null;
  }

  return (
    <ProfileProvider sessionId={sessionId} profileId={profileId}>
      <SessionProvider sessionId={sessionId}>
        <WhiteboardMain />
      </SessionProvider>
    </ProfileProvider>
  );
};

export default Whiteboard;
