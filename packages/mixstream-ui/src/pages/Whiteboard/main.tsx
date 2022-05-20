import { createFastboard, Fastboard, FastboardApp } from '@netless/fastboard-react';
import React, { useEffect, useRef, useState } from 'react';
import { useProfile } from '../../hooks/profile';

const WhiteboardMain = () => {
  const [app, setApp] = useState<FastboardApp>();
  const appInstance = useRef<FastboardApp>();
  const { profile } = useProfile();
  useEffect(() => {
    if (profile && !appInstance.current) {
      createFastboard({
        sdkConfig: {
          appIdentifier: profile.whiteboard.appIdentifier,
          region: 'cn-hz',
        },
        joinRoom: {
          uid: profile.id,
          uuid: profile.whiteboard.uuid,
          roomToken: profile.whiteboard.token,
        },
        managerConfig: {
          cursor: true,
        },
      }).then((app) => {
        appInstance.current = app;
        setApp(app);
      });
    }

    return () => {
      if (appInstance.current) {
        appInstance.current.destroy();
      }
    };
  }, [profile]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Fastboard app={app} />
    </div>
  );
};

export default WhiteboardMain;
