import { createContext, Dispatch, SetStateAction } from 'react';
import { LayerConfig } from '../../pages/Host/Layer';

export interface StreamContextProps {
  shareCamera: boolean;
  shareScreen: boolean;
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
}

export const StreamContext = createContext<StreamContextProps>({
  shareScreen: false,
  shareCamera: false,
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
});
