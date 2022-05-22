import 'antd/dist/antd.min.css';
import { GlobalProvider } from './hooks/global/provider';
import RouteMap from './routes';

function App() {
  return (
    <GlobalProvider>
      <RouteMap />
    </GlobalProvider>
  );
}

export default App;
