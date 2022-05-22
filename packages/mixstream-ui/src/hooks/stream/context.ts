import { createContext, Dispatch, SetStateAction } from 'react';
import { LayerConfig } from '../../pages/Host/Layer';

export interface StreamContextProps {
  audio: boolean;
  setAudio: Dispatch<SetStateAction<boolean>>;
  play: boolean;
  setPlay: Dispatch<SetStateAction<boolean>>;
  whiteboard: boolean;
  setWhiteboard: Dispatch<SetStateAction<boolean>>;
  streams: LayerConfig[];
  resolution: number;

  updateResolution: (data: number) => void;
  addStream: (data: LayerConfig) => void;
  removeStream: (data: LayerConfig['sourceType']) => void;
  updateStreams: (type: LayerConfig['sourceType'], data: LayerConfig) => void;
  shareCamera: boolean;
  shareScreen: boolean;
  shareWhiteboard: boolean;
}

export const StreamContext = createContext<StreamContextProps>({
  play: false,
  setPlay: () => {},
  audio: false,
  setAudio: () => {},
  whiteboard: false,
  setWhiteboard: () => {},
  resolution: 1000,
  updateResolution: () => {},
  streams: [],
  addStream: () => {},
  removeStream: () => {},
  updateStreams: () => {},
  shareWhiteboard: false,
  shareScreen: false,
  shareCamera: false,
});
