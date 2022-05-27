import { LocalTranscoderConfiguration, VideoEncoderConfiguration } from 'agora-electron-sdk/types/Api/native_type';
import { LayerConfig } from '../pages/Host/Layer';
import {
  DEGRADATION_PREFERENCE,
  MEDIA_SOURCE_TYPE,
  ORIENTATION_MODE,
  Resolution,
  VIDEO_MIRROR_MODE_TYPE,
  VIDEO_SOURCE_TYPE,
} from './type';

export const ScreenCaptureFullScreenRect = {
  width: 0,
  height: 0,
  x: 0,
  y: 0,
};

export const bitrateMap: { [key: string]: number } = {
  '1920x1080': 2080,
  '1280x720': 1135,
};

export const bitrateList = Object.keys(bitrateMap);

export function resolutionFormate(resolution: string): Resolution {
  const result = resolution.split('x');
  if (result && result.length === 2) {
    return {
      width: Number(result[0]),
      height: Number(result[1]),
    };
  }
  return {
    width: 0,
    height: 0,
  };
}

export const resolutionMap: { [key: string]: Resolution } = {
  '1920x1080': {
    width: 1920,
    height: 1080,
  },
  '1280x720': {
    width: 1280,
    height: 720,
  },
  '640x360': {
    width: 640,
    height: 360,
  },
};

// setupLocalView 和 TranscodingConfig 中的source type不一致
const video2MediaMap: { [key: number]: number } = {
  [VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_PRIMARY]: MEDIA_SOURCE_TYPE.PRIMARY_CAMERA_SOURCE,
  [VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_SECONDARY]: MEDIA_SOURCE_TYPE.SECONDARY_CAMERA_SOURCE,
  [VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY]: MEDIA_SOURCE_TYPE.PRIMARY_SCREEN_SOURCE,
  [VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_SECONDARY]: MEDIA_SOURCE_TYPE.SECONDARY_SCREEN_SOURCE,
};

export const videoSource2MediaSource = (videoSourceType: VIDEO_SOURCE_TYPE) => {
  return video2MediaMap[videoSourceType];
};

export function layer2TranscodingConfig(
  layers: LayerConfig[],
  options?: Partial<VideoEncoderConfiguration>
): LocalTranscoderConfiguration {
  console.log('🚀 ~ layers', layers);
  const outputStreams = layers.map((v) => {
    const { sourceType, x, y, width, height, zOrder } = v;
    return {
      sourceType: videoSource2MediaSource(sourceType),
      x,
      y,
      width,
      height,
      zOrder,
      remoteUserUid: 0,
      imageUrl: '',
      alpha: 1,
      mirror: true,
    };
  });

  const result: LocalTranscoderConfiguration = {
    streamCount: outputStreams.length,
    videoInputStreams: outputStreams,
    videoOutputConfiguration: {
      codecType: 1,
      bitrate: 2080,
      width: 1920,
      height: 1080,
      frameRate: 15,
      minBitrate: 520,
      orientationMode: ORIENTATION_MODE.ORIENTATION_MODE_ADAPTIVE,
      degradationPreference: DEGRADATION_PREFERENCE.MAINTAIN_QUALITY,
      mirrorMode: VIDEO_MIRROR_MODE_TYPE.VIDEO_MIRROR_MODE_AUTO,
      ...options,
    } as any,
  };
  return result;
}
