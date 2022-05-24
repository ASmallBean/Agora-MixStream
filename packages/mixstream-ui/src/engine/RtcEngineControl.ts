import {
  LocalTranscoderConfiguration,
  ScreenCaptureConfiguration,
  VideoEncoderConfiguration,
} from 'agora-electron-sdk/types/Api/native_type';
import { LayerConfig } from '../pages/Host/Layer';
import { RtcEngine } from './RtcEngine';
import {
  DEGRADATION_PREFERENCE,
  DisplayInfo,
  MEDIA_SOURCE_TYPE,
  ORIENTATION_MODE,
  VIDEO_MIRROR_MODE_TYPE,
  VIDEO_SOURCE_TYPE,
  WindowInfo,
} from './type';

export const ScreenCaptureFullScreenRect = {
  width: 0,
  height: 0,
  x: 0,
  y: 0,
};

export interface Resolution {
  width: number;
  height: number;
}

interface ChannelInfo {
  token: string;
  channel: string;
  uid: number;
}

export const bitrateMap: { [key: string]: number } = {
  '1920x1080': 2080,
  '1280x720': 1135,
};

export const bitrates = Object.keys(bitrateMap);

export function getResolutionSize(resolution: string) {
  const resule = resolution.split('x');
  return {
    width: Number(resule[0]),
    height: Number(resule[1]),
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

export const DEFAULT_RECT = { x: 0, y: 0, height: 0, width: 0 };

const joinChannelOptions: any = {
  publishTrancodedVideoTrack: true,
};

export class RtcEngineControl extends RtcEngine {
  private static instance: RtcEngineControl;

  static singleton(appId: string) {
    if (!this.instance) {
      this.instance = new RtcEngineControl(appId);
    }
    return this.instance;
  }

  constructor(appId: string) {
    super(appId);
    return;
  }

  private _isJoinedChannel = false;

  play(channelInfo: ChannelInfo, layers: LayerConfig[], options?: Partial<VideoEncoderConfiguration>) {
    if (this._isJoinedChannel) {
      return -999;
    }
    const { token, channel, uid } = channelInfo;

    const config = this.layer2TranscodingConfig(layers, options);
    let code = this.startLocalVideoTranscoder(config);
    if (code !== 0) {
      return;
    }

    code = this.joinChannelWithMediaOptions(token, channel, uid, joinChannelOptions);
    if (code === 0) {
      this._isJoinedChannel = true;
    }
    return code;
  }

  stop() {
    let code = this.stopLocalVideoTranscoder();
    if (code !== 0) {
      return code;
    }
    return this.leaveTransCoderChannel();
  }

  leaveTransCoderChannel() {
    if (!this._isJoinedChannel) {
      return 0;
    }
    const code = this.leaveChannel();
    if (code === 0) {
      this._isJoinedChannel = false;
    }
    return code;
  }

  updateLocalTranscoderOutVideoConfig(layers: LayerConfig[], options?: Partial<VideoEncoderConfiguration>) {
    if (this._isJoinedChannel) {
      const config = this.layer2TranscodingConfig(layers, options);
      this.updateLocalTranscoderConfiguration(config);
    }
  }

  async getScreenCaptureConfigByDisplay(data: DisplayInfo): Promise<ScreenCaptureConfiguration> {
    const {
      displayId: { id, ...screenRect },
    } = data;
    return {
      isCaptureWindow: false,
      displayId: id,
      screenRect: screenRect,
      windowId: 0,
      params: {
        width: screenRect.width,
        height: screenRect.height,
        frameRate: 15,
        bitrate: 2000,
      },
      regionRect: screenRect,
    };
  }

  async getScreenCaptureConfigByWindow(data: WindowInfo): Promise<ScreenCaptureConfiguration> {
    const { windowId, width, height, x, y } = data;
    const rect = { width, height, x, y };
    return {
      isCaptureWindow: true,
      displayId: 0,
      screenRect: rect,
      windowId: windowId,
      params: {
        width: width,
        height: height,
        frameRate: 15,
        bitrate: 2000,
      },
      regionRect: DEFAULT_RECT,
    };
  }

  layer2TranscodingConfig(
    layers: LayerConfig[],
    options?: Partial<VideoEncoderConfiguration>
  ): LocalTranscoderConfiguration {
    console.log('🚀 ~ layers', layers);
    const outputStreams = layers.map((v) => {
      const { sourceType, x, y, width, height, zOrder } = v;
      return {
        sourceType: sourceTypeMap[sourceType],
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
}

const sourceTypeMap: { [key: number]: number } = {
  [VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_PRIMARY]: MEDIA_SOURCE_TYPE.PRIMARY_CAMERA_SOURCE,
  [VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_SECONDARY]: MEDIA_SOURCE_TYPE.SECONDARY_CAMERA_SOURCE,
  [VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY]: MEDIA_SOURCE_TYPE.PRIMARY_SCREEN_SOURCE,
  [VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_SECONDARY]: MEDIA_SOURCE_TYPE.SECONDARY_SCREEN_SOURCE,
};
