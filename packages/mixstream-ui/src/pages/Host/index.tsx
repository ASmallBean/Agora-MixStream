import { EnginesProvider } from '../../hooks/engine';
import { StreamProvider } from '../../hooks/stream';
import { useCheckInOut } from '../../hooks/useCheckInOut';
import './index.css';
import HostMain from './Main';
import HostMenu from './Menu';

const Host = () => {
  useCheckInOut();
  return (
    <EnginesProvider>
      <StreamProvider>
        <div className={'hostPage'}>
          <div className="header-container">
            <HostMenu />
          </div>
          <div className={'canvas-container'}>
            <HostMain />
          </div>
        </div>
      </StreamProvider>
    </EnginesProvider>
  );
};

export default Host;
