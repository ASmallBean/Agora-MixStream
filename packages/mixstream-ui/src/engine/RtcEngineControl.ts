import {
  LocalTranscoderConfiguration,
  ScreenCaptureConfiguration,
  VideoEncoderConfiguration,
} from 'agora-electron-sdk/types/Api/native_type';
import { LayerConfig } from '../pages/Host/Layer';
import { ScreenCaptureFullScreenRect, videoSource2MediaSource } from './const';
import { RtcEngine } from './RtcEngine';
import {
  ChannelInfo,
  DEGRADATION_PREFERENCE,
  DisplayInfo,
  ORIENTATION_MODE,
  VIDEO_MIRROR_MODE_TYPE,
  WindowInfo,
} from './type';

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

    code = this.joinChannelWithMediaOptions(token, channel, uid, {
      publishTrancodedVideoTrack: true,
      autoSubscribeVideo: true,
      autoSubscribeAudio: true,
    });
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
      regionRect: ScreenCaptureFullScreenRect,
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
}
