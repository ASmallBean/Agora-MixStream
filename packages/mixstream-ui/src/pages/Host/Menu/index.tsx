import { Button, Dropdown, Menu, Select } from 'antd';
import _ from 'lodash';
import { useRef } from 'react';
import { AiOutlineAudio, AiOutlineAudioMuted, AiOutlinePauseCircle, AiOutlinePlayCircle } from 'react-icons/ai';
import { BsBoxArrowLeft } from 'react-icons/bs';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { useUnmount } from 'react-use';
import { bitrateMap, VIDEO_SOURCE_TYPE } from '../../../engine';
import { useEngine } from '../../../hooks/engine';
import { useStream } from '../../../hooks/stream';
import { hostPath } from '../../../utils';
import { ChannelEnum } from '../../../utils/channel';
import WhiteboardBrowserWindow from '../../Whiteboard/BrowersWindow';
import './index.css';

export enum MenuEventEnum {
  CreateCameraLayer, // 创建摄像头图层
  CreateScreenLayer, // 创建屏幕图层
  CreateWhiteboardLayer, // 创建白板图层
  Play, // 创建白板图层
}

const bitrateOptions = Object.keys(bitrateMap).map((v) => ({ label: v, value: v }));

const HostMenu = () => {
  const intl = useIntl();
  const { rtcEngine } = useEngine();
  const whiteboardRef = useRef<WhiteboardBrowserWindow | null>(null);
  const {
    audio,
    setAudio,
    play,
    resolution,
    updateResolution,
    whiteboard,
    setWhiteboard,
    shareCamera,
    shareScreen,
    shareWhiteboard,
    removeStream,
  } = useStream();
  const { sessionId, profileId } = useParams<{ sessionId: string; profileId: string }>();

  const menu = (
    <Menu
      items={[
        {
          label: intl.formatMessage({ id: 'host.menu.layer.camera' }),
          key: 'camera',
          disabled: !shareCamera || play,
          onClick: () => {
            rtcEngine?.emit(ChannelEnum.MenuControl, MenuEventEnum.CreateCameraLayer);
          },
        },
        {
          label: intl.formatMessage({ id: 'host.menu.layer.screen' }),
          key: 'screen',
          disabled: !shareScreen || play,
          onClick: () => {
            rtcEngine?.emit(ChannelEnum.MenuControl, MenuEventEnum.CreateScreenLayer);
          },
        },
        {
          label: intl.formatMessage({ id: 'host.menu.layer.whiteboard' }),
          key: 'whiteboard',
          disabled: !whiteboard || !shareWhiteboard || play,
          onClick: () => {
            rtcEngine?.emit(ChannelEnum.MenuControl, MenuEventEnum.CreateWhiteboardLayer);
          },
        },
      ]}
    />
  );

  useUnmount(() => {
    if (whiteboardRef.current) {
      whiteboardRef.current.destroyWindow();
    }
  });

  return (
    <div className="host-menu">
      <Dropdown overlay={menu} placement="bottomLeft">
        <Button>{intl.formatMessage({ id: 'host.menu.layer.new' })}</Button>
      </Dropdown>
      <Button
        disabled={whiteboard}
        onClick={_.throttle(async () => {
          if (sessionId && profileId) {
            const pathname = `/#/session/${sessionId}/profile/${profileId}/whiteboard`;

            whiteboardRef.current = WhiteboardBrowserWindow.singleton();
            console.log('🚀 load whiteboard :', hostPath() + pathname);
            whiteboardRef.current.open(hostPath() + pathname).then((browserWindow) => {
              browserWindow.on('closed', () => {
                setWhiteboard(false);
                removeStream(VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_SECONDARY);
              });
              setWhiteboard(true);
            });
          }
        }, 1000)}
      >
        {intl.formatMessage({ id: 'host.menu.whiteboard.create' })}
      </Button>

      <Select
        style={{ width: 120 }}
        value={resolution}
        onChange={(value) => {
          updateResolution(value);
        }}
      >
        {bitrateOptions.map((v) => {
          return (
            <Select.Option key={v.value} value={v.value}>
              {v.label}
            </Select.Option>
          );
        })}
      </Select>
      <Button
        title={intl.formatMessage({
          id: audio ? 'host.menu.audio.off' : 'host.menu.audio.on',
        })}
        onClick={_.throttle(async () => {
          if (rtcEngine) {
            const code = rtcEngine.publishOrUnpublish({ audio: !audio });
            if (code === 0) {
              setAudio((pre) => !pre);
            }
          }
        }, 200)}
      >
        {audio ? <AiOutlineAudio size={20} /> : <AiOutlineAudioMuted size={20} />}
      </Button>
      <Button
        title={intl.formatMessage({
          id: play ? 'host.menu.play.off' : 'host.menu.play.on',
        })}
        onClick={_.throttle(async () => {
          rtcEngine?.emit(ChannelEnum.PlayChannel, { play: !play });
        }, 200)}
      >
        {play ? <AiOutlinePauseCircle size={22} /> : <AiOutlinePlayCircle size={22} />}
      </Button>
      <Button
        title={intl.formatMessage({
          id: 'host.menu.quit.channel',
        })}
        onClick={() => {
          rtcEngine?.emit(ChannelEnum.QuitChannel);
        }}
      >
        <BsBoxArrowLeft size={21} />
      </Button>
    </div>
  );
};

export default HostMenu;
