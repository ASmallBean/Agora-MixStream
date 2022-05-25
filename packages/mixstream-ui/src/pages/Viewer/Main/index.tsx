import { useEffect, useRef } from 'react';
import { RtcEngineEvents } from '../../../engine';
import { useEngine } from '../../../hooks/engine';
import { useProfile } from '../../../hooks/profile';
import { useSession } from '../../../hooks/session';
import { findVideoStreamFromProfile } from '../../../services/api';
import './index.css';

const ViewerMain = () => {
  const { rtcEngine } = useEngine();
  const videoRef = useRef<HTMLDivElement>(null);
  const { channel } = useSession();
  const { profile } = useProfile();

  useEffect(() => {
    if (!rtcEngine) {
      return;
    }
    const stream = findVideoStreamFromProfile(profile);
    if (!stream) {
      return;
    }
    const { token, uid } = stream;
    console.log('🚀 用户信息 ', { token, uid, channel });
    const handle = (data: { connId: { channelId: string; localUid: number }; uid: number }) => {
      console.log('🚀 add stream handle ~ data', data);
      const { connId, uid } = data;
      if (videoRef.current && uid && connId?.channelId) {
        rtcEngine.subscribe(uid, connId.channelId, videoRef.current);
      }
    };
    rtcEngine.on(RtcEngineEvents.ADD_STREAM, handle);
    return () => {
      rtcEngine.off('addStream', handle);
    };
  }, [rtcEngine, channel, profile]);

  return (
    <div className="viewer-main">
      <div className="video" ref={videoRef}></div>
    </div>
  );
};

export default ViewerMain;
