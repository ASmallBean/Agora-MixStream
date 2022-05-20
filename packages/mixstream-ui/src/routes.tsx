import 'antd/dist/antd.min.css';
import { FC, PropsWithChildren } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import CustomTitleBar from './components/CustomTitleBar';
import Host from './pages/Host';
import Landing from './pages/Landing';
import Viewer from './pages/Viewer';
import Whiteboard from './pages/Whiteboard';

export const BlankLayout: FC<PropsWithChildren<{}>> = ({ children }) => {
  return <>{children}</>;
};

function RouteMap() {
  return (
    <div>
      <CustomTitleBar title={'Demo v0.0.1'} />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/session/:sessionId/profile/:profileId/whiteboard" element={<Whiteboard />} />
          <Route
            path="/host/session/:sessionId/profile/:profileId"
            element={
              <BlankLayout>
                <Host />
              </BlankLayout>
            }
          />
          <Route
            path="/viewer/session/:sessionId/profile/:profileId"
            element={
              <BlankLayout>
                <Viewer />
              </BlankLayout>
            }
          />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default RouteMap;
