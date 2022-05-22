import { EnginesProvider } from '../../hooks/engines';
import './index.css';
import ViewerMain from './Main';
import ViewerMenu from './Menu';

const Viewer = () => {
  return (
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
  );
};

export default Viewer;
