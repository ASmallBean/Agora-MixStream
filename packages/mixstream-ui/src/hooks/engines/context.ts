import { createContext } from 'react';
import { RtcEngine } from '../../services/RtcEngine';

export const EnginesContext = createContext<{
  rtcEngine?: RtcEngine;
}>({});
