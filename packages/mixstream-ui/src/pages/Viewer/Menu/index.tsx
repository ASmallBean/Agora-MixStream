import { Button } from 'antd';
import { useIntl } from 'react-intl';
import { GlobalEvent, globalEvent } from '../../../utils';
import './index.css';

const ViewMenu = () => {
  const intl = useIntl();
  return (
    <div className="viewer-menu">
      <Button
        onClick={() => {
          globalEvent?.emit(GlobalEvent.QuitChannel);
        }}
      >
        {intl.formatMessage({
          id: 'host.menu.quit.channel',
        })}
      </Button>
    </div>
  );
};

export default ViewMenu;
