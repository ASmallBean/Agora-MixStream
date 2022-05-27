import { FC, PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { bitrateList, VIDEO_SOURCE_TYPE } from '../../engine';
import { LayerConfig } from '../../pages/Host/Layer';
import { WhiteboardTitle } from '../../pages/Whiteboard';
import { StreamContext } from './context';

export const StreamProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [streams, setStreams] = useState<LayerConfig[]>([]);
  const [resolution, setResolution] = useState(bitrateList[0]);
  const [play, setPlay] = useState(false);
  const [audio, setAudio] = useState(true);
  const shareScreen = useMemo(() => {
    return streams.filter((v) => v.sourceType >= 2).length < 2;
  }, [streams]);

  const whiteboardSharing = useMemo(() => {
    return streams.some((v) => v.name === WhiteboardTitle);
  }, [streams]);

  const shareCamera = useMemo(() => {
    return streams.filter((v) => v.sourceType < 2).length < 2;
  }, [streams]);

  const freeScreenCaptureSource = useMemo(() => {
    const arr = streams.filter((v) => v.sourceType >= 2);
    if (arr.length === 2) {
      return null;
    }
    return arr.some((v) => v.sourceType === 2) ? 3 : 2;
  }, [streams]);

  const freeCameraCaptureSource = useMemo(() => {
    const arr = streams.filter((v) => v.sourceType <= 2);
    if (arr.length === 2) {
      return null;
    }
    return arr.some((v) => v.sourceType === 0) ? 1 : 0;
  }, [streams]);

  console.log('🖥 freeScreenCaptureSource', freeScreenCaptureSource);
  console.log('📹 freeCameraCaptureSource', freeCameraCaptureSource);

  const addStream = useCallback((data: LayerConfig) => {
    setStreams((pre) => {
      const item = pre.find((v) => v.sourceType === data.sourceType);
      // 当前流通道没有被占用
      if (!item) {
        return [...pre, data];
      }
      const typeArr = pre.map((v) => v.sourceType);
      // 当前流通道没被占用，查找有没有空闲通道，有则自动分配
      switch (item.sourceType) {
        case VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_PRIMARY:
          if (!typeArr.includes(VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_SECONDARY)) {
            data.sourceType = VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_SECONDARY;
            return [...pre, data];
          }
          break;
        case VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_SECONDARY:
          if (!typeArr.includes(VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_PRIMARY)) {
            data.sourceType = VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_PRIMARY;
            return [...pre, data];
          }
          break;
        case VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY:
          if (!typeArr.includes(VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_SECONDARY)) {
            data.sourceType = VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_SECONDARY;
            return [...pre, data];
          }
          break;
        case VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_SECONDARY:
          if (!typeArr.includes(VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY)) {
            data.sourceType = VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY;
            return [...pre, data];
          }
          break;
      }
      return pre;
    });
  }, []);

  const removeStream = useCallback((type: LayerConfig['sourceType']) => {
    setStreams((pre) => {
      return pre.filter((v) => v.sourceType !== type);
    });
  }, []);

  const updateStreams = useCallback((type: LayerConfig['sourceType'], data: Partial<LayerConfig>) => {
    setStreams((pre) => {
      return pre.map((v) => {
        if (v.sourceType !== type) {
          return v;
        }
        return {
          ...v,
          ...data,
        };
      });
    });
  }, []);

  const updateResolution = useCallback((data: string) => {
    setResolution(data);
  }, []);

  return (
    <StreamContext.Provider
      value={{
        play,
        setPlay,
        audio,
        setAudio,
        resolution,
        updateResolution,
        streams,
        addStream,
        removeStream,
        updateStreams,
        shareCamera,
        shareScreen,
        whiteboardSharing,
        freeCameraCaptureSource,
        freeScreenCaptureSource,
      }}
    >
      {children}
    </StreamContext.Provider>
  );
};
