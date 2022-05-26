import AgoraRtcEngine from 'agora-electron-sdk';
import {
  ChannelMediaOptions,
  LocalTranscoderConfiguration,
  RtcConnection,
  ScreenCaptureConfiguration,
  VideoFormat,
} from 'agora-electron-sdk/types/Api/native_type';
import { message } from 'antd';
import { remote } from 'electron';
import EventEmitter from 'eventemitter3';
import { isMacOS } from '../utils';
import { DeviceInfo, DisplayInfo, VIDEO_SOURCE_TYPE, WindowInfo } from './type';

const LOGS_FOLDER = isMacOS() ? `${window.process.env.HOME}/Library/Logs/MixStreamClient` : './log';

export enum RtcEngineEvents {
  ADD_STREAM = 'addStream',
  NETWORK_QUALITY_CHANGE = 'networkQualityChange',
  VIDEO_DEVICE_STATE_CHANGED = 'videoDeviceStateChanged',
}

export class RtcEngine extends EventEmitter {
  private _rtcEngine: AgoraRtcEngine;

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
    this._rtcEngine.on('remoteVideoStats', (data) => {
      console.log('🚀 ~ file: RtcEngine.ts ~ line 45 ~ RtcEngine ~ this._rtcEngine.on ~ data', data);
    });
    this._rtcEngine.on('remoteVideoTransportStats', (data) => {
      console.log('🚀 ~ file: RtcEngine.ts ~ line 45 ~ RtcEngine ~ this._rtcEngine.on ~ data', data);
    });
    this._rtcEngine.on('remoteVideoStateChanged', (data) => {
      console.log('🚀 ~ file: RtcEngine.ts ~ line 45 ~ RtcEngine ~ this._rtcEngine.on ~ data', data);
    });
    this._rtcEngine.on('videoDeviceStateChanged', (deviceId, deviceType, deviceState) => {
      this.emit(RtcEngineEvents.VIDEO_DEVICE_STATE_CHANGED, { deviceId, deviceType, deviceState });
    });
  }

  async engineInit() {
    this._rtcEngine.setChannelProfile(0);
    this._rtcEngine.setClientRole(1);
    this._rtcEngine.enableAudio();
    this._rtcEngine.enableLocalAudio(false);
    this._rtcEngine.enableVideo();
    this._rtcEngine.enableLocalVideo(false);
  }

  joinChannel(token: string, channel: string, uid: number): number {
    const code = this._rtcEngine.joinChannel(token, channel, '', uid);
    if (code !== 0) {
      throw new Error(`Failed to join channel with error code: ${code}`);
    }
    return code;
  }

  joinChannelEx(token: string, connection: RtcConnection, options?: ChannelMediaOptions): number {
    const code = this._rtcEngine.joinChannelEx(token, connection, options || {});
    if (code !== 0) {
      throw new Error(`Failed to joinChannelEx with error code: ${code}`);
    }
    return code;
  }

  joinChannelWithMediaOptions(token: string, channelId: string, userId: number, options: ChannelMediaOptions): number {
    const code = this._rtcEngine.joinChannelWithMediaOptions(token, channelId, userId, options || {});
    if (code !== 0) {
      throw new Error(`Failed to joinChannelWithMediaOptions with error code: ${code}`);
    }
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
    const code = this._rtcEngine.leaveChannel();
    if (code !== 0) {
      throw new Error(`Failed to leave channel with error code: ${code}`);
    }
    return code;
  }

  startLocalVideoTranscoder(config: LocalTranscoderConfiguration) {
    console.log('🚀 ~ RtcEngine ~ startLocalVideoTranscoder ~ config', config);
    let code = this._rtcEngine.startLocalVideoTranscoder(config);
    if (code !== 0) {
      throw new Error(`Failed to startLocalVideoTranscoder with error code: ${code}`);
    }
    return code;
  }

  stopLocalVideoTranscoder() {
    console.log('🚀 ~  stopLocalVideoTranscoder');
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
    console.log('🚀 subscribe', {
      uid,
      channelId,
    });
    const code = this._rtcEngine.setupRemoteView(uid, channelId, attachEl, { append: false });
    if (code !== 0) {
      throw new Error(`Failed to setupRemoteView with error code: ${code}`);
    }
    return code;
  }

  setupLocalView(type: number, deviceId: number, attachEl: HTMLElement) {
    const code = this._rtcEngine.setupLocalView(type, deviceId, attachEl, { append: false });
    if (code !== 0) {
      throw new Error(`Failed to setupLocalView with error code: ${code}`);
    }
    return code;
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

  enableAudio(status: boolean) {
    const code = this._rtcEngine.enableLocalAudio(status);
    if (code !== 0) {
      throw new Error(`Failed to enableLocalAudio with error code: ${code}`);
    }
    status ? this._rtcEngine.enableAudio() : this._rtcEngine.disableAudio();
    return code;
  }

  publishOrUnpublish(options: { audio?: boolean; video?: boolean }) {
    const { audio, video } = options;
    let code;
    if (audio !== undefined) {
      code = this._rtcEngine.enableLocalAudio(audio);
      audio ? this._rtcEngine.enableAudio() : this._rtcEngine.disableAudio();
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

  hasScreenPermissions() {
    const hasPermissions = remote.systemPreferences.getMediaAccessStatus('screen');
    const flat = hasPermissions === 'denied';
    if (flat) {
      message.error('No Screen Recording Permissions');
    }
    return !flat;
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

  stopScreenCapture(type: VIDEO_SOURCE_TYPE): number {
    const isPrimary = type === VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY;
    const code = isPrimary ? this._rtcEngine.stopPrimaryScreenCapture() : this._rtcEngine.stopSecondaryScreenCapture();
    if (code !== 0) {
      throw new Error(`Failed to camera stopScreenCapture with error code: ${code}`);
    }
    return code;
  }
}
