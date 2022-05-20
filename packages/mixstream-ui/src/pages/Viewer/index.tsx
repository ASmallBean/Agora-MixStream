import { notification } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { EnginesProvider } from '../../hooks/engines';
import { ProfileProvider } from '../../hooks/profile';
import { SessionProvider } from '../../hooks/session';
import './index.css';
import ViewerMain from './Main';
import ViewerMenu from './Menu';

const Viewer = () => {
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
          <div className="viewerPage">
            <div className="header-container">
              <ViewerMenu />
            </div>
            <div className="canvas-container">
              <ViewerMain />
            </div>
          </div>
        </EnginesProvider>
      </SessionProvider>
    </ProfileProvider>
  );
};

export default Viewer;
