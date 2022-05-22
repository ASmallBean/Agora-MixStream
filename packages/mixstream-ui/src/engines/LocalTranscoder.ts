import {
  LocalTranscoderConfiguration,
  TranscodingVideoStream,
  VideoEncoderConfiguration,
} from 'agora-electron-sdk/types/Api/native_type';
import { DEGRADATION_PREFERENCE, ORIENTATION_MODE, VIDEO_MIRROR_MODE_TYPE, VIDEO_SOURCE_TYPE } from './type';

const defaultLocal: LocalTranscoderConfiguration = {
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
export class LocalTranscoder {
  private _localTranscoderConfig = defaultLocal;

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
