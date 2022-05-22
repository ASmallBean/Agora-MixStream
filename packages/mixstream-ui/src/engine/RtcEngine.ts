import AgoraRtcEngine from 'agora-electron-sdk';
import { ChannelMediaOptions, ScreenCaptureConfiguration, VideoFormat } from 'agora-electron-sdk/types/Api/native_type';
import { message } from 'antd';
import { remote } from 'electron';
import EventEmitter from 'eventemitter3';
import { isMacOS } from '../utils';
import { LocalTranscoder } from './LocalTranscoder';
import { DisplayInfo, VIDEO_SOURCE_TYPE, WindowInfo } from './type';

const LOGS_FOLDER = isMacOS() ? `${window.process.env.HOME}/Library/Logs/MixStreamClient` : './log';

export enum RtcEngineEvents {
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
  ADDSTREAM = 'addStream',
  NETWORK_QUALITY_CHANGE = 'networkQualityChange',
}

export class RtcEngine extends EventEmitter {
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

  async joinChannelInit() {
    this._rtcEngine.setChannelProfile(0);
    this._rtcEngine.setClientRole(1);
    this._rtcEngine.enableVideo();
    this._rtcEngine.enableAudio();
    this._rtcEngine.enableLocalAudio(false);
    this._rtcEngine.enableLocalVideo(false);
  }

  private _isJoined = false;

  joinChannel(token: string, channel: string, uid: number): number {
    if (this._isJoined) {
      console.warn('You have joined the channel');
      return 0;
    }
    const code = this._rtcEngine.joinChannel(token, channel, '', uid);
    if (code !== 0) {
      throw new Error(`Failed to join channel with error code: ${code}`);
    }
    this._isJoined = true;
    return code;
  }

  leaveChannel() {
    if (!this._isJoined) {
      return;
    }
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

  release() {
    const code = this._rtcEngine.release();
    if (code !== 0) {
      throw new Error(`Failed to release rtc engine with error code: ${code}`);
    }
    return code;
  }

  enableAudio() {
    let code = this._rtcEngine.enableAudio();
    if (code !== 0) {
      throw new Error(`Failed to enableAudio with error code: ${code}`);
    }
    code = this._rtcEngine.enableLocalAudio(true);
    if (code !== 0) {
      throw new Error(`Failed to enableLocalAudio true with error code: ${code}`);
    }
    return code;
  }

  disableAudio() {
    let code = this._rtcEngine.disableAudio();
    if (code !== 0) {
      throw new Error(`Failed to disableAudio with error code: ${code}`);
    }
    code = this._rtcEngine.enableLocalAudio(false);
    if (code !== 0) {
      throw new Error(`Failed to enableLocalAudio false with error code: ${code}`);
    }
    return code;
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
}
