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
      <div className="room">
        <div className="roomName">
          {intl.formatMessage({ id: 'host.menu.roomName' })}: {channel}
        </div>
        <BsBoxArrowLeft
          className="quit"
          size={21}
          title={intl.formatMessage({
            id: 'host.menu.quit.channel',
          })}
          onClick={() => {
            globalEvent.emit(GlobalEvent.QuitChannel);
          }}
        />
      </div>
    </div>
  );
};

export default ViewMenu;
