import 'antd/dist/antd.min.css';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { GlobalProvider } from './hooks/global/provider';
import AuthLayout from './layout/AuthLayout';
import BlankLayout from './layout/BlankLayout';
import Host from './pages/Host';
import Landing from './pages/Landing';
import Viewer from './pages/Viewer';
import Whiteboard from './pages/Whiteboard';

function App() {
  return (
    <GlobalProvider>
      <HashRouter>
        <Routes>
          <Route
            path="/"
            element={
              <BlankLayout>
                <Landing />
              </BlankLayout>
            }
          />
          <Route
            path="/session/:sessionId/profile/:profileId/whiteboard"
            element={
              <AuthLayout>
                <Whiteboard />
              </AuthLayout>
            }
          />
          <Route
            path="/host/session/:sessionId/profile/:profileId"
            element={
              <AuthLayout>
                <Host />
              </AuthLayout>
            }
          />
          <Route
            path="/viewer/session/:sessionId/profile/:profileId"
            element={
              <AuthLayout>
                <Viewer />
              </AuthLayout>
            }
          />
        </Routes>
      </HashRouter>
    </GlobalProvider>
  );
}

export default App;
