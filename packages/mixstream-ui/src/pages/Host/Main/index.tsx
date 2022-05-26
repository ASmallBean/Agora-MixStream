import { useEffect } from 'react';
import { bitrateMap, resolutionFormate } from '../../../engine';
import { useEngine } from '../../../hooks/engine';
import { useStream } from '../../../hooks/stream';
import Layer from '../Layer';
import './index.css';

const HostMain = () => {
  const { rtcEngine } = useEngine();
  const { streams, removeStream, resolution, play } = useStream();

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
