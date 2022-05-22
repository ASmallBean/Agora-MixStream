import { createContext, Dispatch, SetStateAction } from 'react';
import { VIDEO_SOURCE_TYPE } from '../../engine';
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
  removeStream: (sourceType: LayerConfig['sourceType']) => void;
  updateStreams: (sourceType: LayerConfig['sourceType'], data: LayerConfig) => void;
  shareCamera: boolean;
  shareScreen: boolean;
  shareWhiteboard: boolean;
  freeCameraCaptureSource: VIDEO_SOURCE_TYPE | null;
  freeScreenCaptureSource: VIDEO_SOURCE_TYPE | null;
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
  freeCameraCaptureSource: null,
  freeScreenCaptureSource: null,
});
