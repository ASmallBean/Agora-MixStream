import { createContext, Dispatch, SetStateAction } from 'react';
import { bitrates, VIDEO_SOURCE_TYPE } from '../../engine';
import { LayerConfig } from '../../pages/Host/Layer';

export interface StreamContextProps {
  audio: boolean;
  setAudio: Dispatch<SetStateAction<boolean>>;
  play: boolean;
  setPlay: Dispatch<SetStateAction<boolean>>;
  whiteboard: boolean;
  setWhiteboard: Dispatch<SetStateAction<boolean>>;
  streams: LayerConfig[];
  resolution: string;

  updateResolution: (data: string) => void;
  addStream: (data: LayerConfig) => void;
  removeStream: (sourceType: LayerConfig['sourceType']) => void;
  updateStreams: (sourceType: LayerConfig['sourceType'], data: Partial<LayerConfig>) => void;
  shareCamera: boolean;
  shareScreen: boolean;
  shareWhiteboard: boolean;
  freeCameraCaptureSource: VIDEO_SOURCE_TYPE | null;
  freeScreenCaptureSource: VIDEO_SOURCE_TYPE | null;
}

export const StreamContext = createContext<StreamContextProps>({
  play: false,
  setPlay: () => {},
  audio: true,
  setAudio: () => {},
  whiteboard: false,
  setWhiteboard: () => {},
  resolution: bitrates[0],
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
