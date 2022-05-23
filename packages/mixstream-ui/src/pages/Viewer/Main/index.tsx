import { useEffect, useRef } from 'react';
import { RtcEngineEvents } from '../../../engine';
import { useEngine } from '../../../hooks/engine';
import { useProfile } from '../../../hooks/profile';
import { useSession } from '../../../hooks/session';
import './index.css';

const ViewerMain = () => {
  const { rtcEngine } = useEngine();
  const videoRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();
  const session = useSession();

  useEffect(() => {
    if (!rtcEngine) {
      return;
    }
    const handle = (data: { connId: { channelId: string; localUid: number }; uid: number }) => {
      const { connId, uid } = data;
      if (videoRef.current && uid && connId?.channelId) {
        rtcEngine.subscribe(uid, connId.channelId, videoRef.current);
      }
    };
    rtcEngine.on(RtcEngineEvents.ADD_STREAM, handle);
    return () => {
      rtcEngine.off('addStream', handle);
    };
  }, [profile, rtcEngine, session?.channel]);

  return (
    <div className="viewer-main">
      <div className="video" ref={videoRef}></div>
    </div>
  );
};

export default ViewerMain;
