import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnmount } from 'react-use';
import { findVideoStreamFromProfile } from '../../services/api';
import { RtcEngine } from '../../services/RtcEngine';
import { ChannelEnum } from '../../utils/channel';
import { useProfile } from '../profile';
import { useSession } from '../session';
import { EnginesContext } from './context';

export const EnginesProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [rtcEngine, setRtcEngine] = useState<RtcEngine>();
  const { profile } = useProfile();
  const session = useSession();
  const navigator = useNavigate();

  useEffect(() => {
    const cameraStream = findVideoStreamFromProfile(profile);
    const channel = session?.channel;
    if (!cameraStream || !session || !channel || rtcEngine) {
      return;
    }
    const { appId, token, uid } = cameraStream;
    const engine = RtcEngine.singleton(appId);
    engine.joinChannelInit();
    engine.storeInfo(token, channel, uid);
    setRtcEngine(engine);
  }, [profile, session, rtcEngine]);

  useEffect(() => {
    if (!rtcEngine) {
      return;
    }
    const handle = () => {
      rtcEngine.leaveChannel();
      navigator('/');
    };
    rtcEngine.on(ChannelEnum.QuitChannel, handle);
    return () => {
      rtcEngine.off(ChannelEnum.QuitChannel, handle);
    };
  }, [navigator, rtcEngine]);

  useUnmount(async () => {
    await rtcEngine?.leaveChannel();
    await rtcEngine?.release();
  });

  return (
    <EnginesContext.Provider
      value={{
        rtcEngine,
      }}
    >
      {children}
    </EnginesContext.Provider>
  );
};
