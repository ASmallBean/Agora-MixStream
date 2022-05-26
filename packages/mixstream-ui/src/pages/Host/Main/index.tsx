import { useEffect } from 'react';
import { bitrateMap, resolutionFormate } from '../../../engine';
import { useEngine } from '../../../hooks/engine';
import { useProfile } from '../../../hooks/profile';
import { useSession } from '../../../hooks/session';
import { useStream } from '../../../hooks/stream';
import { findVideoStreamFromProfile } from '../../../services/api';
import { ChannelEnum } from '../../../utils/channel';
import Layer from '../Layer';
import './index.css';

const HostMain = () => {
  const { rtcEngine } = useEngine();
  const { streams, removeStream, setPlay, resolution, play } = useStream();
  const { profile } = useProfile();
  const { channel } = useSession();

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
    rtcEngine?.on(ChannelEnum.PlayOrStop, handle);
    return () => {
      rtcEngine?.off(ChannelEnum.PlayOrStop, handle);
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
