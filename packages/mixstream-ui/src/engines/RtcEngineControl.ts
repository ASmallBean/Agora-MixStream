import { ScreenCaptureConfiguration } from 'agora-electron-sdk/types/Api/native_type';
import { LocalTranscoder } from './LocalTranscoder';
import { RtcEngine } from './RtcEngine';
import { DisplayInfo, WindowInfo } from './type';

export const ScreenCaptureFullScreenRect = {
  width: 0,
  height: 0,
  x: 0,
  y: 0,
};

export const DEFAULT_RECT = { x: 0, y: 0, height: 0, width: 0 };

export class RtcEngineControl extends RtcEngine {
  private static instance: RtcEngineControl;

  static singleton(appId: string) {
    if (!this.instance) {
      this.instance = new RtcEngineControl(appId);
    }
    return this.instance;
  }

  localTranscoder = new LocalTranscoder();

  constructor(appId: string) {
    super(appId);
    return;
  }

  joinChannelWithPublishTrancodedVideoTrack(token: string, channel: string, uid: number) {
    const code = this.joinChannel(token, channel, uid);
    if (code !== 0) {
      return;
    }
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
