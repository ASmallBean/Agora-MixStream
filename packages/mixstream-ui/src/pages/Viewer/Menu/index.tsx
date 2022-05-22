import { Button } from 'antd';
import { useIntl } from 'react-intl';
import { useEngine } from '../../../hooks/engine';
import { ChannelEnum } from '../../../utils/channel';
import './index.css';

const ViewMenu = () => {
  const intl = useIntl();
  const { rtcEngine } = useEngine();
  return (
    <div className="viewer-menu">
      <Button
        onClick={() => {
          rtcEngine?.emit(ChannelEnum.QuitChannel);
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
