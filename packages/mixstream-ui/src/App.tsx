import 'antd/dist/antd.min.css';
import CustomTitleBar from './components/CustomTitleBar';
import RouteMap from './routes';

function App() {
  return (
    <div>
      <CustomTitleBar title={'Demo v0.0.1'} />
      <RouteMap />
    </div>
  );
}

export default App;
