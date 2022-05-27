import AgoraRtcEngine from 'agora-electron-sdk';
import {
  ChannelMediaOptions,
  LocalTranscoderConfiguration,
  ScreenCaptureConfiguration,
  VideoEncoderConfiguration,
  VideoFormat,
} from 'agora-electron-sdk/types/Api/native_type';
import EventEmitter from 'eventemitter3';
import { LayerConfig } from '../pages/Host/Layer';
import { isMacOS } from '../utils';
import { layer2TranscodingConfig, ScreenCaptureFullScreenRect } from './const';
import { ChannelInfo, DeviceInfo, DisplayInfo, VIDEO_SOURCE_TYPE, WindowInfo } from './type';

const LOGS_FOLDER = isMacOS() ? `${window.process.env.HOME}/Library/Logs/MixStreamClient` : './log';

export enum RtcEngineEvents {
  ADD_STREAM = 'addStream',
  NETWORK_QUALITY_CHANGE = 'networkQualityChange',
  VIDEO_DEVICE_STATE_CHANGED = 'videoDeviceStateChanged',
}

export class RtcEngine extends EventEmitter {
  private static instance: RtcEngine;

  private _rtcEngine: AgoraRtcEngine;

  private _isJoinedChannel = false;

  static singleton(appId: string) {
    if (!this.instance) {
      this.instance = new RtcEngine(appId);
    }
    return this.instance;
  }

  constructor(appId: string) {
    super();
    this._rtcEngine = new AgoraRtcEngine();
    this._rtcEngine.initialize(appId, 1, {
      filePath: `${LOGS_FOLDER}/agora_rtc_sdk.log`,
      level: 1,
      fileSizeInKB: 2048,
    });
    this.bindEvents();
  }

  private bindEvents() {
    this._rtcEngine.on('addStream', (connId: number, uid: number, elapsed: number) => {
      this.emit(RtcEngineEvents.ADD_STREAM, { uid, connId, elapsed });
    });
    this._rtcEngine.on('networkQuality', (_uid, up, down) => {
      this.emit(RtcEngineEvents.NETWORK_QUALITY_CHANGE, { up, down });
    });

    this._rtcEngine.on('videoDeviceStateChanged', (deviceId, deviceType, deviceState) => {
      this.emit(RtcEngineEvents.VIDEO_DEVICE_STATE_CHANGED, { deviceId, deviceType, deviceState });
    });
  }

  async engineInit(
    options: { enableAudio: boolean; enableVideo: boolean } = { enableVideo: false, enableAudio: false }
  ) {
    this._rtcEngine.setChannelProfile(0);
    this._rtcEngine.setClientRole(1);
    this._rtcEngine.enableAudio();
    this._rtcEngine.enableLocalAudio(options.enableAudio);
    this._rtcEngine.enableVideo();
    this._rtcEngine.enableLocalVideo(options.enableVideo);
  }

  joinChannelWithMediaOptions(
    token: string,
    channelId: string,
    userId: number,
    options: ChannelMediaOptions = {}
  ): number {
    if (this._isJoinedChannel) {
      return 0;
    }
    const code = this._rtcEngine.joinChannelWithMediaOptions(token, channelId, userId, options || {});
    if (code !== 0) {
      throw new Error(`Failed to joinChannelWithMediaOptions with error code: ${code}`);
    }
    this._isJoinedChannel = true;
    return code;
  }

  updateChannelMediaOptions(data: ChannelMediaOptions) {
    const code = this._rtcEngine.updateChannelMediaOptions(data);
    if (code !== 0) {
      throw new Error(`Failed to updateChannelMediaOptions with error code: ${code}`);
    }
    return code;
  }

  leaveChannel() {
    if (!this._isJoinedChannel) {
      return 0;
    }
    const code = this._rtcEngine.leaveChannel();
    if (code !== 0) {
      throw new Error(`Failed to leave channel with error code: ${code}`);
    }
    this._isJoinedChannel = false;
    return code;
  }

  startLocalVideoTranscoder(config: LocalTranscoderConfiguration) {
    console.log('🚀 startLocalVideoTranscoder ~ config', config);
    let code = this._rtcEngine.startLocalVideoTranscoder(config);
    if (code !== 0) {
      throw new Error(`Failed to startLocalVideoTranscoder with error code: ${code}`);
    }
    return code;
  }

  stopLocalVideoTranscoder() {
    console.log('🚀 stopLocalVideoTranscoder');
    let code = this._rtcEngine.stopLocalVideoTranscoder();
    if (code !== 0) {
      throw new Error(`Failed to stopLocalVideoTranscoder with error code: ${code}`);
    }
    return code;
  }

  updateLocalTranscoderConfiguration(config: LocalTranscoderConfiguration) {
    console.log('🚀  updateLocalTranscoderConfiguration ~ config', config);
    const code = this._rtcEngine.updateLocalTranscoderConfiguration(config);
    if (code !== 0) {
      throw new Error(`Failed to updateLocalTranscoderConfiguration with error code: ${code}`);
    }
    return code;
  }

  async subscribe(uid: number, channelId: string, attachEl: HTMLElement): Promise<number> {
    const code = this._rtcEngine.setupRemoteView(uid, channelId, attachEl, { append: false });
    if (code !== 0) {
      throw new Error(`Failed to setupRemoteView with error code: ${code}`);
    }
    console.log('🚀  subscribe ~ uid', uid);
    return code;
  }

  setupLocalView(type: number, deviceId: number, attachEl: HTMLElement) {
    const code = this._rtcEngine.setupLocalView(type, deviceId, attachEl, { append: false });
    if (code !== 0) {
      throw new Error(`Failed to setupLocalView with error code: ${code}`);
    }
    return code;
  }

  publishOrUnpublish(options: { audio?: boolean; video?: boolean }) {
    const { audio, video } = options;
    let code;
    if (audio !== undefined) {
      code = this._rtcEngine.enableLocalAudio(audio);
      // audio ? this._rtcEngine.enableAudio() : this._rtcEngine.disableAudio();
      if (code !== 0) {
        throw new Error(`Failed to enableLocalAudio with error code: ${code}`);
      }
    }
    if (video !== undefined) {
      code = this._rtcEngine.enableLocalVideo(!!video);
      if (code !== 0) {
        throw new Error(`Failed to enableLocalVideo with error code: ${code}`);
      }
    }
    return code;
  }

  startCameraCapture(type: VIDEO_SOURCE_TYPE, deviceId: string, option?: Partial<VideoFormat>): number {
    const isPrimary = type === VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_PRIMARY;
    const config = {
      deviceId: deviceId,
      format: {
        width: 1280,
        height: 720,
        fps: 10,
        ...option,
      },
      // @ts-ignore 这个参数是sdk漏掉的，不写的话c++会参数类型报错
      cameraDirection: 0,
    };
    const code = isPrimary
      ? this._rtcEngine.startPrimaryCameraCapture(config)
      : this._rtcEngine.startSecondaryCameraCapture(config);

    if (code !== 0) {
      throw new Error(
        `Failed to screen share ${
          isPrimary ? 'startPrimaryCameraCapture' : 'startSecondaryCameraCapture'
        } with error code: ${code}.`
      );
    }
    return code;
  }

  stopCameraCapture(type: VIDEO_SOURCE_TYPE): number {
    const isPrimary = type === VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_PRIMARY;
    const code = isPrimary ? this._rtcEngine.stopPrimaryCameraCapture() : this._rtcEngine.stopSecondaryCameraCapture();
    if (code !== 0) {
      throw new Error(`Failed to camera stopCameraCapture with error code: ${code}`);
    }
    return code;
  }

  startScreenCapture(type: VIDEO_SOURCE_TYPE, config: ScreenCaptureConfiguration) {
    const isPrimary = type === VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY;
    let code = isPrimary
      ? this._rtcEngine.startPrimaryScreenCapture(config)
      : this._rtcEngine.startSecondaryScreenCapture(config);
    if (code !== 0) {
      throw new Error(
        `Failed to screen share ${
          isPrimary ? 'startPrimaryScreenCapture' : 'startSecondaryScreenCapture'
        } with error code: ${code}.`
      );
    }
    return code;
  }

  stopScreenCapture(type: VIDEO_SOURCE_TYPE): number {
    const isPrimary = type === VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY;
    const code = isPrimary ? this._rtcEngine.stopPrimaryScreenCapture() : this._rtcEngine.stopSecondaryScreenCapture();
    if (code !== 0) {
      throw new Error(`Failed to camera stopScreenCapture with error code: ${code}`);
    }
    return code;
  }

  beginPlay(channelInfo: ChannelInfo, layers: LayerConfig[], options?: Partial<VideoEncoderConfiguration>) {
    if (this._isJoinedChannel) {
      return -999;
    }
    const { token, channel, uid } = channelInfo;

    const config = layer2TranscodingConfig(layers, options);
    let code = this.startLocalVideoTranscoder(config);
    if (code !== 0) {
      return;
    }

    code = this.joinChannelWithMediaOptions(token, channel, uid, {
      publishTrancodedVideoTrack: true,
    });
    if (code === 0) {
      this._isJoinedChannel = true;
    }
    return code;
  }

  stopPlay() {
    let code = this.stopLocalVideoTranscoder();
    if (code !== 0) {
      return code;
    }
    return this.leaveChannel();
  }

  updateLocalTranscoderOutVideoConfig(layers: LayerConfig[], options?: Partial<VideoEncoderConfiguration>) {
    if (this._isJoinedChannel) {
      const config = layer2TranscodingConfig(layers, options);
      this.updateLocalTranscoderConfiguration(config);
    }
  }

  getVideoDevices() {
    return this._rtcEngine.getVideoDevices() as DeviceInfo[];
  }

  async getScreenDisplaysInfo() {
    return this._rtcEngine.getScreenDisplaysInfo() as DisplayInfo[];
  }

  async getScreenWindowsInfo() {
    return this._rtcEngine.getScreenWindowsInfo() as WindowInfo[];
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
}
