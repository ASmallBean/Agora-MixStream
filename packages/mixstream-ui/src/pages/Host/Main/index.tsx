import { useEffect } from 'react';
import { DisplayInfo, ShareScreenType, VIDEO_SOURCE_TYPE, WindowInfo } from '../../../engine';
import { useEngine } from '../../../hooks/engines';
import { useShareCamera } from '../../../hooks/shareCamera/useShareCamera';
import { useShareScreen } from '../../../hooks/shareScreen/useShareScreen';
import { useStream } from '../../../hooks/stream';
import { ChannelEnum } from '../../../utils/channel';
import { WhiteboardTitle } from '../../Whiteboard';
import Layer, {
  getLayerConfigFromDisplayInfo,
  getLayerConfigFromMediaDeviceInfo,
  getLayerConfigFromWindowInfo,
} from '../Layer';
import { MenuEventEnum } from '../Menu';
import './index.css';

const HostMain = () => {
  const { rtcEngine } = useEngine();
  const { openModal: openShareCameraModal } = useShareCamera();
  const { openModal: openShareScreenModal } = useShareScreen();
  const { streams, addStream } = useStream();

  console.log('🚀 ~ file: index.tsx ~ line 22 ~ HostMain ~ streams', streams);

  useEffect(() => {
    if (!rtcEngine) {
      return;
    }
    const handle = async (event: MenuEventEnum) => {
      switch (event) {
        case MenuEventEnum.CreateCameraLayer:
          if (openShareCameraModal) {
            openShareCameraModal(async (camera) => {
              addStream(getLayerConfigFromMediaDeviceInfo(camera, VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_PRIMARY));
              return;
            });
          }
          break;
        case MenuEventEnum.CreateScreenLayer:
          if (openShareScreenModal) {
            openShareScreenModal(async (type, data) => {
              switch (type) {
                case ShareScreenType.Display:
                  addStream(
                    getLayerConfigFromDisplayInfo(data as DisplayInfo, VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY)
                  );
                  break;
                case ShareScreenType.Window:
                  addStream(
                    getLayerConfigFromWindowInfo(data as WindowInfo, VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY)
                  );
                  break;
              }
            });
          }
          break;
        case MenuEventEnum.CreateWhiteboardLayer:
          const windowInfoList = await rtcEngine.getScreenWindowsInfo();
          if (windowInfoList && windowInfoList.length) {
            const w = windowInfoList.find((v) => {
              return v.name === WhiteboardTitle;
            });
            if (w) {
              addStream(getLayerConfigFromWindowInfo(w, VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_SECONDARY));
            }
          }
          break;
      }
    };
    rtcEngine.on(ChannelEnum.MenuControl, handle);
    return () => {
      rtcEngine.removeListener(ChannelEnum.MenuControl, handle);
    };
  }, [addStream, openShareCameraModal, openShareScreenModal, rtcEngine]);

  return (
    <div className="hostMain">
      {streams.map((v, i) => {
        const key = `${v.deviceId}${v.windowId}${v.sourceType}${v.displayId}${i}`;
        return <Layer key={key} data={v} rtcEngine={rtcEngine}></Layer>;
      })}
    </div>
  );
};

export default HostMain;
