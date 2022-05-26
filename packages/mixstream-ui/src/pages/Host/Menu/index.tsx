import { Button, Dropdown, Menu, Select } from 'antd';
import _ from 'lodash';
import { useCallback, useRef, useState } from 'react';
import { AiOutlineAudio, AiOutlineAudioMuted, AiOutlinePauseCircle, AiOutlinePlayCircle } from 'react-icons/ai';
import { BsBoxArrowLeft } from 'react-icons/bs';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { useMount, useUnmount } from 'react-use';
import CameraSelector from '../../../components/CameraSelector';
import { ScreenSelector, ScreenSelectorHandler } from '../../../components/ScreenSelector';
import {
  bitrateMap,
  DeviceInfo,
  DisplayInfo,
  Resolution,
  ShareScreenType,
  VIDEO_SOURCE_TYPE,
  WindowInfo,
} from '../../../engine';
import { useEngine } from '../../../hooks/engine';
import { useGlobal } from '../../../hooks/global/useGlobal';
import { useStream } from '../../../hooks/stream';
import { hostPath } from '../../../utils';
import { ChannelEnum } from '../../../utils/channel';
import { WhiteboardTitle } from '../../Whiteboard';
import WhiteboardBrowserWindow from '../../Whiteboard/BrowersWindow';
import {
  getLayerConfigFromDisplayInfo,
  getLayerConfigFromMediaDeviceInfo,
  getLayerConfigFromWindowInfo,
} from '../Layer';
import './index.css';

const bitrateOptions = Object.keys(bitrateMap).map((v) => ({ label: v, value: v }));

const HostMenu = () => {
  const intl = useIntl();
  const { rtcEngine } = useEngine();
  const { setLoading } = useGlobal();
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
    addStream,
  } = useStream();
  const { sessionId, profileId } = useParams<{ sessionId: string; profileId: string }>();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [screenVisible, setScreenVisible] = useState(false);
  const [displayList, setDisplayList] = useState<DisplayInfo[]>([]);
  const [windowList, setWindowList] = useState<WindowInfo[]>([]);

  const onCameraSelected = useCallback(
    (deviceInfo: DeviceInfo, resolution: Resolution) => {
      setCameraVisible(false);
      addStream(
        getLayerConfigFromMediaDeviceInfo(
          { ...deviceInfo, ...resolution },
          VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_PRIMARY
        )
      );
    },
    [addStream]
  );

  const onScreenSelected = useCallback<ScreenSelectorHandler>(
    (type, data) => {
      setScreenVisible(false);
      switch (type) {
        case ShareScreenType.Display:
          addStream(getLayerConfigFromDisplayInfo(data as DisplayInfo, VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY));
          break;
        case ShareScreenType.Window:
          addStream(getLayerConfigFromWindowInfo(data as WindowInfo, VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY));
          break;
      }
    },
    [addStream]
  );

  const openScreenSelector = () => {
    Promise.all([rtcEngine?.getScreenDisplaysInfo(), rtcEngine?.getScreenWindowsInfo()])
      .then(([displays, windows]) => {
        setDisplayList(displays || []);
        setWindowList(windows || []);
        setScreenVisible(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const createLayerMenu = (
    <Menu
      items={[
        {
          label: intl.formatMessage({ id: 'host.menu.layer.camera' }),
          key: 'camera',
          disabled: !shareCamera || play,
          onClick: () => {
            setCameraVisible(true);
          },
        },
        {
          label: intl.formatMessage({ id: 'host.menu.layer.screen' }),
          key: 'screen',
          disabled: !shareScreen || play,
          onClick: () => {
            setLoading(true);
            setTimeout(() => {
              openScreenSelector();
            }, 0);
          },
        },
        {
          label: intl.formatMessage({ id: 'host.menu.layer.whiteboard' }),
          key: 'whiteboard',
          disabled: !whiteboard || !shareWhiteboard || play,
          onClick: () => {
            if (rtcEngine) {
              setLoading(true);
              rtcEngine
                .getScreenWindowsInfo()
                .then((data) => {
                  if (data && data.length) {
                    const whiteboardWindow = data.find((v) => {
                      return v.name === WhiteboardTitle;
                    });
                    if (whiteboardWindow) {
                      addStream(
                        getLayerConfigFromWindowInfo(whiteboardWindow, VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_SECONDARY)
                      );
                    }
                  }
                })
                .finally(() => {
                  setLoading(false);
                });
            }
          },
        },
      ]}
    />
  );

  useMount(() => {
    rtcEngine?.enableAudio(true);
  });

  useUnmount(() => {
    if (whiteboardRef.current) {
      whiteboardRef.current.destroyWindow();
    }
  });

  return (
    <div className="host-menu">
      <Dropdown overlay={createLayerMenu} placement="bottomLeft">
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
          rtcEngine?.emit(ChannelEnum.PlayOrStop, { play: !play });
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
      <CameraSelector
        visible={cameraVisible}
        onCancel={() => {
          setCameraVisible(false);
        }}
        onSuccess={onCameraSelected}
      />
      <ScreenSelector
        visible={screenVisible}
        displays={displayList}
        windows={windowList}
        onCancel={() => {
          setScreenVisible(false);
        }}
        onSuccess={onScreenSelected}
      />
    </div>
  );
};

export default HostMenu;
