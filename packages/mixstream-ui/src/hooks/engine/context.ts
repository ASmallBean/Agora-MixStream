import { createContext } from 'react';
import { RtcEngineControl } from '../../engine';

export const EnginesContext = createContext<{
  rtcEngine?: RtcEngineControl;
}>({});
