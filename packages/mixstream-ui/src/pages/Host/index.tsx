import { EnginesProvider } from '../../hooks/engines';
import { ShareCameraProvider } from '../../hooks/shareCamera/provider';
import { ShareScreenProvider } from '../../hooks/shareScreen/provider';
import { StreamProvider } from '../../hooks/stream';
import './index.css';
import HostMain from './Main';
import HostMenu from './Menu';

const Host = () => {
  return (
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
  );
};

export default Host;
