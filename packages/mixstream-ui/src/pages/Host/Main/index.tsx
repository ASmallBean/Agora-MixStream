import { useEffect } from 'react';
import { bitrateMap, resolutionFormate, VIDEO_SOURCE_TYPE } from '../../../engine';
import { useEngine } from '../../../hooks/engine';
import { useProfile } from '../../../hooks/profile';
import { useSession } from '../../../hooks/session';
import { useStream } from '../../../hooks/stream';
import { findVideoStreamFromProfile } from '../../../services/api';
import { ChannelEnum } from '../../../utils/channel';
import { WhiteboardTitle } from '../../Whiteboard';
import Layer, { getLayerConfigFromWindowInfo } from '../Layer';
import { MenuEventEnum } from '../Menu';
import './index.css';

const HostMain = () => {
  const { rtcEngine } = useEngine();
  const { streams, addStream, removeStream, setPlay, resolution, play } = useStream();
  const { profile } = useProfile();
  const { channel } = useSession();

  useEffect(() => {
    if (!rtcEngine) {
      return;
    }
    const handle = async (event: MenuEventEnum) => {
      switch (event) {
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
  }, [addStream, rtcEngine]);

  useEffect(() => {
    const handle = (data: { play: boolean }) => {
      const { play } = data;
      if (rtcEngine) {
        let code;
        if (play) {
          const stream = findVideoStreamFromProfile(profile);
          if (!stream || !channel) {
            return;
          }
          const { token, uid } = stream;
          const options = resolutionFormate(resolution);
          code = rtcEngine.play({ token, channel, uid }, streams, { bitrate: bitrateMap[resolution], ...options });
        } else {
          // 停止推流
          code = rtcEngine.stop();
        }
        if (code === 0) {
          setPlay(play);
        }
      }
    };
    rtcEngine?.on(ChannelEnum.PlayChannel, handle);
    return () => {
      rtcEngine?.off(ChannelEnum.PlayChannel, handle);
    };
  }, [channel, profile, resolution, rtcEngine, setPlay, streams]);

  useEffect(() => {
    const options = resolutionFormate(resolution);
    if (play) {
      rtcEngine?.updateLocalTranscoderOutVideoConfig(streams, { bitrate: bitrateMap[resolution], ...options });
    }
  }, [play, resolution, rtcEngine, streams]);

  return (
    <div className="hostMain">
      {streams.map((v, i) => {
        const key = `${v.deviceId}${v.windowId}${v.sourceType}${v.displayId}${i}`;
        return <Layer key={key} data={v} rtcEngine={rtcEngine} remove={removeStream}></Layer>;
      })}
    </div>
  );
};

export default HostMain;
