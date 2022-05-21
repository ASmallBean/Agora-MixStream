import { Button, Dropdown, Menu, Select } from 'antd';
import _ from 'lodash';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { useEngine } from '../../../hooks/engines';
import { useProfile } from '../../../hooks/profile';
import { useSession } from '../../../hooks/session';
import { useStream } from '../../../hooks/stream';
import { findVideoStreamFromProfile } from '../../../services/api';
import { hostPath } from '../../../utils';
import { ChannelEnum } from '../../../utils/channel';
import WhiteboardBrowserWindow from '../../Whiteboard/BrowersWindow';
import './index.css';

const bitrates: { [key: string]: number } = {
  '1280x720': 1000,
  '1920x1080': 2000,
};

export enum MenuEventEnum {
  CreateCameraLayer, // 创建摄像头图层
  CreateScreenLayer, // 创建屏幕图层
  CreateWhiteboardLayer, // 创建白板图层
}

const bitrateOptions = Object.keys(bitrates).map((v) => ({ label: v, value: bitrates[v] }));

const HostMenu = () => {
  const intl = useIntl();
  const { rtcEngine } = useEngine();
  const { profile } = useProfile();
  const { channel } = useSession();
  const {
    audio,
    setAudio,
    play,
    setPlay,
    resolution,
    updateResolution,
    whiteboard,
    setWhiteboard,
    shareCamera,
    shareScreen,
  } = useStream();
  const { sessionId, profileId } = useParams<{ sessionId: string; profileId: string }>();

  const menu = (
    <Menu
      items={[
        {
          label: intl.formatMessage({ id: 'host.menu.layer.camera' }),
          key: 'camera',
          disabled: !shareCamera,
          onClick: () => {
            rtcEngine?.emit(ChannelEnum.MenuControl, MenuEventEnum.CreateCameraLayer);
          },
        },
        {
          label: intl.formatMessage({ id: 'host.menu.layer.screen' }),
          key: 'screen',
          disabled: !shareScreen,
          onClick: () => {
            rtcEngine?.emit(ChannelEnum.MenuControl, MenuEventEnum.CreateScreenLayer);
          },
        },
        {
          label: intl.formatMessage({ id: 'host.menu.layer.whiteboard' }),
          key: 'whiteboard',
          disabled: !whiteboard,
          onClick: () => {
            rtcEngine?.emit(ChannelEnum.MenuControl, MenuEventEnum.CreateWhiteboardLayer);
          },
        },
      ]}
    />
  );

  return (
    <div className="host-menu">
      <Dropdown overlay={menu} placement="bottomLeft">
        <Button>{intl.formatMessage({ id: 'host.menu.layer.new' })}</Button>
      </Dropdown>
      <Button
        disabled={whiteboard}
        onClick={_.throttle(async () => {
          if (sessionId && profileId) {
            const w = WhiteboardBrowserWindow.singleton();
            const pathname = `/#/session/${sessionId}/profile/${profileId}/whiteboard`;
            w.open(hostPath() + pathname).then((browserWindow) => {
              browserWindow.on('closed', () => {
                setWhiteboard(false);
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
        disabled={audio}
        onClick={_.throttle(async () => {
          if (rtcEngine) {
            let code;
            if (audio) {
              // 停止音频
              code = rtcEngine.stopAudio();
            } else {
              code = rtcEngine.startAudio();
            }
            if (code === 0) {
              setAudio((pre) => !pre);
            }
          }
        }, 200)}
      >
        {intl.formatMessage({
          id: audio ? 'host.menu.audio.on' : 'host.menu.audio.off',
        })}
      </Button>
      <Button
        disabled={play}
        onClick={_.throttle(async () => {
          if (rtcEngine) {
            let code;
            if (play) {
              code = rtcEngine.stopLocalVideoTranscoder();
              // 停止推流
            } else {
              code = rtcEngine.startLocalVideoTranscoder();
              if (code !== 0) {
                return;
              }
              const stream = findVideoStreamFromProfile(profile);
              if (!stream || !channel) {
                return;
              }
              const { token, uid } = stream;
              code = rtcEngine.joinChannel(token, channel, uid);
            }
            if (code === 0) {
              setPlay((pre) => !pre);
            }
          }
        }, 200)}
      >
        {intl.formatMessage({
          id: !play ? 'host.menu.play.on' : 'host.menu.play.off',
        })}
      </Button>
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

export default HostMenu;
