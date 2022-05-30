import { Button } from 'antd';
import { BsBoxArrowLeft } from 'react-icons/bs';
import { useIntl } from 'react-intl';
import { useSession } from '../../../hooks/session';
import { GlobalEvent, globalEvent } from '../../../utils';
import './index.css';

const ViewMenu = () => {
  const intl = useIntl();
  const { channel } = useSession();
  return (
    <div className="viewer-menu">
      <Button
        className="quiteChannel"
        title={intl.formatMessage({
          id: 'host.menu.quit.channel',
        })}
        onClick={() => {
          globalEvent.emit(GlobalEvent.QuitChannel);
        }}
      >
        <div className="roomName">
          {intl.formatMessage({ id: 'host.menu.roomName' })}: {channel}
        </div>
        <BsBoxArrowLeft size={21} />
      </Button>
    </div>
  );
};

export default ViewMenu;
