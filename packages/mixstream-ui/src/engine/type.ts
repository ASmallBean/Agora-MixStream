export interface WindowInfo {
  windowId: number;
  name: string;
  ownerName: string;
  width: number;
  height: number;
  x: number;
  y: number;
  originWidth: number;
  originHeight: number;
  processId: number;
  currentProcessId: number;
  image: Uint16Array;
}

export interface DisplayInfo {
  displayId: DisplayID;
  width: number;
  height: number;
  x: number;
  y: number;
  isMain: boolean;
  isActive: boolean;
  isBuiltin: boolean;
  image: Uint16Array;
}

export interface DisplayID {
  x: number;
  y: number;
  width: number;
  height: number;
  id: number;
}
export enum ShareScreenType {
  Display = 'display',
  Window = 'window',
}

export interface VideoDeviceInfo {
  deviceid: string;
  devicename: string;
}
/**
 * Video source types definition.
 **/
export enum VIDEO_SOURCE_TYPE {
  /** Video captured by the camera.
   */
  VIDEO_SOURCE_CAMERA_PRIMARY = 0,
  VIDEO_SOURCE_CAMERA = 0,
  /** Video captured by the secondary camera.
   */
  VIDEO_SOURCE_CAMERA_SECONDARY = 1,
  /** Video for screen sharing.
   */
  VIDEO_SOURCE_SCREEN_PRIMARY = 2,
  VIDEO_SOURCE_SCREEN = 2,
  /** Video for secondary screen sharing.
   */
  VIDEO_SOURCE_SCREEN_SECONDARY = 3,
  /** Not define.
   */
  VIDEO_SOURCE_CUSTOM = 4,
  /** Video for media player sharing.
   */
  VIDEO_SOURCE_MEDIA_PLAYER = 5,
  /** Video for png image.
   */
  VIDEO_SOURCE_RTC_IMAGE_PNG = 6,
  /** Video for png image.
   */
  VIDEO_SOURCE_RTC_IMAGE_JPEG = 7,
  /** Video for png image.
   */
  VIDEO_SOURCE_RTC_IMAGE_GIF = 8,
  /** Remote video received from network.
   */
  VIDEO_SOURCE_REMOTE = 9,
  /** Video for transcoded.
   */
  VIDEO_SOURCE_TRANSCODED = 10,
  /** Video captured by the tertiary camera.
   */
  VIDEO_SOURCE_CAMERA_TERTIARY = 11,
  /** Video captured by the quaternary camera.
   */
  VIDEO_SOURCE_CAMERA_QUATERNARY = 12,
  VIDEO_SOURCE_UNKNOWN = 100,
}

/**
 * Video mirror mode types.
 */
export enum VIDEO_MIRROR_MODE_TYPE {
  /**
   * (Default) 0: The mirror mode determined by the SDK.
   */
  VIDEO_MIRROR_MODE_AUTO = 0,
  /**
   * 1: Enable the mirror mode.
   */
  VIDEO_MIRROR_MODE_ENABLED = 1,
  /**
   * 2: Disable the mirror mode.
   */
  VIDEO_MIRROR_MODE_DISABLED = 2,
}

/**
 * Video output orientation modes.
 */
export enum ORIENTATION_MODE {
  /**
   * 0: (Default) Adaptive mode.
   *
   * In this mode, the output video always follows the orientation of the captured video.
   * - If the captured video is in landscape mode, the output video is in landscape mode.
   * - If the captured video is in portrait mode, the output video is in portrait mode.
   */
  ORIENTATION_MODE_ADAPTIVE = 0,
  /**
   * 1: Landscape mode.
   *
   * In this mode, the output video is always in landscape mode. If the captured video is in portrait
   * mode, the video encoder crops it to fit the output. Applies to scenarios where the receiver
   * cannot process the rotation information, for example, CDN live streaming.
   */
  ORIENTATION_MODE_FIXED_LANDSCAPE = 1,
  /**
   * 2: Portrait mode.
   *
   * In this mode, the output video is always in portrait mode. If the captured video is in landscape
   * mode, the video encoder crops it to fit the output. Applies to scenarios where the receiver
   * cannot process the rotation information, for example, CDN live streaming.
   */
  ORIENTATION_MODE_FIXED_PORTRAIT = 2,
}
export enum DEGRADATION_PREFERENCE {
  /**
   * 0: (Default) Degrade the frame rate and keep resolution to guarantee the video quality.
   */
  MAINTAIN_QUALITY = 0,
  /**
   * 1: Degrade resolution in order to maintain framerate.
   */
  MAINTAIN_FRAMERATE = 1,
  /**
   * 2: Maintain resolution in video quality control process. Under limited bandwidth, degrade video quality first and then degrade frame rate.
   */
  MAINTAIN_BALANCED = 2,
  /**
   * 3: Degrade framerate in order to maintain resolution.
   */
  MAINTAIN_RESOLUTION = 3,
  /**
   * 4: Disable VQC adjustion.
   */
  DISABLED = 100,
}
