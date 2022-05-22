import { createContext } from 'react';
import { RtcEngineControl } from '../../engines';

export const EnginesContext = createContext<{
  rtcEngine?: RtcEngineControl;
}>({});
