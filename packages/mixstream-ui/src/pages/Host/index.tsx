import { notification } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { EnginesProvider } from '../../hooks/engines';
import { ProfileProvider } from '../../hooks/profile';
import { SessionProvider } from '../../hooks/session';
import { ShareCameraProvider } from '../../hooks/shareCamera/provider';
import { ShareScreenProvider } from '../../hooks/shareScreen/provider';
import { StreamProvider } from '../../hooks/stream';
import './index.css';
import HostMain from './Main';
import HostMenu from './Menu';

const Host = () => {
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
    <ProfileProvider sessionId={sessionId} profileId={profileId}>
      <SessionProvider sessionId={sessionId}>
        <EnginesProvider>
          <StreamProvider>
            <ShareCameraProvider>
              <ShareScreenProvider>
                <div className={'hostPage'}>
                  <div className="header-container">
                    <HostMenu />
                  </div>
                  <div className={'canvas-container'}>
                    <HostMain />
                  </div>
                </div>
              </ShareScreenProvider>
            </ShareCameraProvider>
          </StreamProvider>
        </EnginesProvider>
      </SessionProvider>
    </ProfileProvider>
  );
};

export default Host;
