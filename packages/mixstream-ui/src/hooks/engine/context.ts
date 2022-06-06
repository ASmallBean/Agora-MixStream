import { createContext } from 'react';
import { RtcEngine } from '../../engine';

export const EnginesContext = createContext<{
  rtcEngine?: RtcEngine;
}>({});
