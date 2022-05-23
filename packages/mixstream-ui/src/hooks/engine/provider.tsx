import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnmount } from 'react-use';
import { RtcEngineControl } from '../../engine';
import { findVideoStreamFromProfile } from '../../services/api';
import { ChannelEnum } from '../../utils/channel';
import { useProfile } from '../profile';
import { useSession } from '../session';
import { EnginesContext } from './context';

export const EnginesProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [rtcEngine, setRtcEngine] = useState<RtcEngineControl>();
  const { profile } = useProfile();
  const session = useSession();
  const navigator = useNavigate();

  useEffect(() => {
    const stream = findVideoStreamFromProfile(profile);
    const channel = session?.channel;
    if (!stream || !session || !channel || rtcEngine) {
      return;
    }
    const { appId } = stream;
    const engine = RtcEngineControl.singleton(appId);
    engine.engineInit();
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
