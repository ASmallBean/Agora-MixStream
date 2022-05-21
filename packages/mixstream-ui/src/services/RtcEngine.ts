import AgoraRtcEngine from 'agora-electron-sdk';
import {
  ChannelMediaOptions,
  LocalTranscoderConfiguration,
  ScreenCaptureConfiguration,
  TranscodingVideoStream,
  VideoEncoderConfiguration,
  VideoFormat,
} from 'agora-electron-sdk/types/Api/native_type';
import { message } from 'antd';
import { remote } from 'electron';
import EventEmitter from 'eventemitter3';
import { isMacOS } from '../utils';
import {
  DEGRADATION_PREFERENCE,
  DisplayInfo,
  ORIENTATION_MODE,
  VIDEO_MIRROR_MODE_TYPE,
  VIDEO_SOURCE_TYPE,
  WindowInfo,
} from './type';

const LOGS_FOLDER = isMacOS() ? `${window.process.env.HOME}/Library/Logs/MixStreamClient` : './log';

export const DEFAULT_RECT = { x: 0, y: 0, height: 0, width: 0 };

export enum RtcEngineEvents {
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
  ADDSTREAM = 'addStream',
  NETWORK_QUALITY_CHANGE = 'networkQualityChange',
}

export const ScreenCaptureFullScreenRect = {
  width: 0,
  height: 0,
  x: 0,
  y: 0,
};

export class RtcEngine extends EventEmitter {
  private static instance: RtcEngine;

  static singleton(appId: string) {
    if (!this.instance) {
      this.instance = new RtcEngine(appId);
    }
    return this.instance;
  }

  private _rtcEngine: AgoraRtcEngine;

  localTranscoder = new LocalTranscoder();

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
      this.emit(RtcEngineEvents.ADDSTREAM, { uid, connId, elapsed });
    });
    this._rtcEngine.on('networkQuality', (_uid, up, down) => {
      this.emit(RtcEngineEvents.NETWORK_QUALITY_CHANGE, { up, down });
    });
  }

  async init() {
    this._rtcEngine.setChannelProfile(0);
    this._rtcEngine.setClientRole(1);
    this._rtcEngine.enableVideo();
    this._rtcEngine.enableAudio();
    this._rtcEngine.enableLocalAudio(false);
    this._rtcEngine.enableLocalVideo(false);
  }

  private _isJoined = false;

  joinChannel(token: string, channel: string, uid: number) {
    if (this._isJoined) {
      return;
    }
    const code = this._rtcEngine.joinChannel(token, channel, '', uid);
    if (code !== 0) {
      throw new Error(`Failed to join channel with error code: ${code}`);
    }
    this._isJoined = true;

    const data: any = {
      publishCameraTrack: false,
      publishAudioTrack: false,
      publishScreenTrack: false,
      publishCustomAudioTrack: false,
      publishCustomVideoTrack: false,
      publishEncodedVideoTrack: false,
      publishMediaPlayerAudioTrack: false,
      publishMediaPlayerVideoTrack: false,
      autoSubscribeAudio: false,
      autoSubscribeVideo: false,
      publishTrancodedVideoTrack: true,
      clientRoleType: 1,
      channelProfile: 0,
      publishMediaPlayerId: 0,
      defaultVideoStreamType: 0,
      enableAudioRecordingOrPlayout: true,
      publishSecondaryCameraTrack: false,
      publishTertiaryCameraTrack: false,
      publishQuaternaryCameraTrack: false,
      publishSecondaryScreenTrack: false,
      publishCustomAudioSourceId: 0,
      publishCustomAudioTrackEnableAec: false,
      publishDirectCustomAudioTrack: false,
      publishCustomAudioTrackAec: false,
      audienceLatencyLevel: 2,
    };
    return this.updateChannelMediaOptions(data);
  }

  leaveChannel() {
    const code = this._rtcEngine.leaveChannel();
    if (code !== 0) {
      throw new Error(`Failed to leave channel with error code: ${code}`);
    }
    this._isJoined = false;
    return code;
  }

  updateChannelMediaOptions(data: ChannelMediaOptions) {
    const code = this._rtcEngine.updateChannelMediaOptions(data);
    if (code !== 0) {
      throw new Error(`Failed to updateChannelMediaOptions with error code: ${code}`);
    }
    return code;
  }

  startLocalVideoTranscoder() {
    const config = this.localTranscoder.getConfig();
    let code = this._rtcEngine.startLocalVideoTranscoder(config);
    if (code !== 0) {
      throw new Error(`Failed to startLocalVideoTranscoder with error code: ${code}`);
    }
    return code;
  }
  stopLocalVideoTranscoder() {
    let code = this._rtcEngine.stopLocalVideoTranscoder();
    if (code !== 0) {
      throw new Error(`Failed to stopLocalVideoTranscoder with error code: ${code}`);
    }
    return code;
  }

  updateLocalTranscoderConfiguration() {
    const config = this.localTranscoder.getConfig();
    const code = this._rtcEngine.updateLocalTranscoderConfiguration(config);
    if (code !== 0) {
      throw new Error(`Failed to updateLocalTranscoderConfiguration with error code: ${code}`);
    }
    return code;
  }

  async subscribe(uid: number, channelId: string, attachEl: HTMLElement): Promise<number> {
    console.log('🚀 subscribe ~ uid', uid);
    const code = this._rtcEngine.setupRemoteView(uid, channelId, attachEl, { append: false });
    if (code !== 0) {
      throw new Error(`Failed to setupRemoteView with error code: ${code}`);
    }
    console.log('订阅成功');
    return code;
  }

  async release() {
    const code = this._rtcEngine.release();
    if (code !== 0) {
      throw new Error(`Failed to release rtc engine with error code: ${code}`);
    }
    return code;
  }

  startAudio() {
    const code = this._rtcEngine.enableAudio();
    console.log('🚀 ~ file: RtcEngine.ts ~ line 204 ~ RtcEngine ~ startAudio ~ code', code);
    if (code !== 0) {
      return code;
    }
    return this._rtcEngine.enableLocalAudio(true);
  }

  stopAudio() {
    const code = this._rtcEngine.disableAudio();
    if (code !== 0) {
      return code;
    }
    return this._rtcEngine.enableLocalAudio(false);
  }

  setupLocalViewAndPreview(type: number, deviceId: number, attachEl: HTMLElement, sourceType: VIDEO_SOURCE_TYPE) {
    console.log(`🚀 ~ setupLocalView type:${type}  deviceId:${deviceId}`);
    const code = this._rtcEngine.setupLocalView(type, deviceId, attachEl, { append: false });
    if (code !== 0) {
      throw new Error(`Failed to setupLocalView with error code: ${code}`);
    }
    return this.startPreview(sourceType);
  }

  startPreview(sourceType: VIDEO_SOURCE_TYPE) {
    console.log('🚀 ~ startPreview sourceType:', sourceType);
    const code = this._rtcEngine.startPreview(sourceType);
    if (code !== 0) {
      throw new Error(`Failed to startPreview with error code: ${code}`);
    }
    return code;
  }

  async getScreenDisplaysInfo() {
    return this._rtcEngine.getScreenDisplaysInfo() as DisplayInfo[];
  }

  async getScreenWindowsInfo() {
    return this._rtcEngine.getScreenWindowsInfo() as WindowInfo[];
  }

  publishOrUnpublish(audio?: boolean, video?: boolean) {
    this._rtcEngine.enableLocalAudio(!!audio);
    this._rtcEngine.enableLocalVideo(!!video);
  }

  hasScreenPermissions() {
    const hasPermissions = remote.systemPreferences.getMediaAccessStatus('screen');
    const flat = hasPermissions === 'denied';
    if (flat) {
      message.error('No Screen Recording Permissions');
    }
    return !flat;
  }

  startCameraCapture(type: VIDEO_SOURCE_TYPE, deviceId: string, option?: Partial<VideoFormat>): number {
    this._rtcEngine.enableVideo();
    this._rtcEngine.enableLocalVideo(true);
    const isPrimary = type === VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_PRIMARY;
    const config = {
      deviceId: deviceId,
      format: {
        width: 1280,
        height: 720,
        fps: 5,
        ...option,
      },
      // @ts-ignore 这个参数是sdk漏掉的，不写的话c++会参数类型报错
      cameraDirection: 0,
    };
    const code = isPrimary
      ? this._rtcEngine.startPrimaryCameraCapture(config)
      : this._rtcEngine.startSecondaryCameraCapture(config);

    if (code !== 0) {
      throw new Error(`Failed to camera startPrimaryCameraCapture with error code: ${code}`);
    }
    return code;
  }

  startScreenCapture(type: VIDEO_SOURCE_TYPE, config: ScreenCaptureConfiguration) {
    if (!this.hasScreenPermissions()) {
      return;
    }
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
}

export class LocalTranscoder {
  private _localTranscoderConfig: LocalTranscoderConfiguration = {
    streamCount: 0,
    videoInputStreams: [],
    videoOutputConfiguration: {
      codecType: 1,
      width: 1920,
      height: 1080,
      frameRate: 15,
      bitrate: 2080,
      minBitrate: 2080,
      orientationMode: ORIENTATION_MODE.ORIENTATION_MODE_ADAPTIVE,
      degradationPreference: DEGRADATION_PREFERENCE.MAINTAIN_QUALITY,
      mirrorMode: VIDEO_MIRROR_MODE_TYPE.VIDEO_MIRROR_MODE_AUTO,
    } as any,
  };

  getConfig() {
    console.log('🚀 ~ file: _localTranscoderConfig ~ config', this._localTranscoderConfig);
    return this._localTranscoderConfig;
  }

  createVideoInputStreamConfig(data: Partial<TranscodingVideoStream>): TranscodingVideoStream {
    return {
      sourceType: VIDEO_SOURCE_TYPE.VIDEO_SOURCE_UNKNOWN,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      zOrder: 1,
      remoteUserUid: 0,
      imageUrl: '',
      alpha: 1,
      mirror: true,
      ...data,
    };
  }

  addVideoInputStream(inputStream: TranscodingVideoStream) {
    const isExistIndex = this.isExistVideoInputStream(inputStream.sourceType);
    // 如果存在相同类型的输入流，则替换
    if (this.isExistVideoInputStream(inputStream.sourceType) >= 0) {
      this._localTranscoderConfig.videoInputStreams[isExistIndex] = inputStream;
      return;
    }
    const count = this._localTranscoderConfig.videoInputStreams.push(inputStream);
    this._localTranscoderConfig.streamCount = count;
  }

  removeVideoInputStreamBySourceType(type: VIDEO_SOURCE_TYPE) {
    const arr = this._localTranscoderConfig.videoInputStreams.filter((v) => v.sourceType !== type);
    this._localTranscoderConfig.videoInputStreams = arr;
    this._localTranscoderConfig.streamCount = arr.length;
  }

  isExistVideoInputStream(type: VIDEO_SOURCE_TYPE) {
    return this._localTranscoderConfig.videoInputStreams.findIndex((v) => v.sourceType === type);
  }

  setVideoOutputConfiguration(data: Partial<VideoEncoderConfiguration>) {
    this._localTranscoderConfig.videoOutputConfiguration = {
      ...this._localTranscoderConfig.videoOutputConfiguration,

      ...data,
    };
  }
}
