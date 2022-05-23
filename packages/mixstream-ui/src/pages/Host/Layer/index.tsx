import { ScreenCaptureConfiguration } from 'agora-electron-sdk/types/Api/native_type';
import { FC, useCallback, useId, useMemo, useRef, useState } from 'react';
import { Item, ItemParams, Menu, useContextMenu } from 'react-contexify';
import { useMount, useWindowSize } from 'react-use';
import {
  DisplayInfo,
  RtcEngineControl,
  ScreenCaptureFullScreenRect,
  VideoDeviceInfo,
  VIDEO_SOURCE_TYPE,
  WindowInfo,
} from '../../../engine';
import './index.css';

export enum LayerType {
  CAMERA,
  SCREEN,
}
export interface LayerConfig {
  type: LayerType;
  sourceType: VIDEO_SOURCE_TYPE;

  deviceId: string; // 摄像头的id
  zOrder: number; // default: 300
  isCaptureWindow: boolean; // 用来区分 LayerType.SCREEN 是窗口还是显示器
  windowId: number;
  displayId: number;
  x: number;
  y: number;
  frameRate: number;
  bitrate: number;
  width: number;
  height: number;
}

interface LayerProps {
  className?: string;
  data: LayerConfig;
  rtcEngine?: RtcEngineControl;
  remove: (config: LayerConfig['sourceType']) => void;
}

// 画布固定宽高比 16:9，高:80vw 宽45vw

const Layer: FC<LayerProps> = ({ className, rtcEngine, data, remove }) => {
  const uid = useId();
  const domRef = useRef<HTMLDivElement>(null);
  const { width: windowWidth } = useWindowSize();
  const [config, setConfig] = useState(data);
  const canvasSize = useMemo(() => {
    return {
      width: windowWidth * 0.8, // 80vw
      height: windowWidth * 0.45, // 45vw
    };
  }, [windowWidth]);

  const [layout, setLayout] = useState({
    width: canvasSize.width,
    height: canvasSize.height,
    left: 0,
    top: 0,
    zIndex: 100,
  });

  const { show } = useContextMenu({
    id: uid,
  });

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    show(event, {
      props: {
        key: 'value',
      },
    });
  };

  // 渲染摄像头
  const setupCameraLocalView = useCallback(
    async (dom: HTMLDivElement, layerConfig: LayerConfig) => {
      if (rtcEngine && dom) {
        const { width, height, x, y, sourceType, zOrder, deviceId } = layerConfig;
        setLayout((pre) => {
          // 这里的计算是为了让画布中图层和源的高宽比保持一致,高宽最大值不能超过一定值
          switch (
            sourceType // 这个版本通过 VIDEO_SOURCE_TYPE 判断是第一个摄像头还是第二个
          ) {
            case VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY: // 左边
              return {
                ...computeEquidistantSize(
                  { width, height },
                  { maxWidth: canvasSize.width, maxHeight: canvasSize.height }
                ),
                left: 0,
                top: 0,
                zIndex: 101,
              };
            case VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_SECONDARY: // 右边
              return {
                ...computeEquidistantSize(
                  { width, height },
                  { maxWidth: canvasSize.width * 0.2, maxHeight: canvasSize.height * 0.2 }
                ),
                left: 0,
                top: canvasSize.width * 0.8,
                zIndex: 101,
              };
            default:
              return {
                ...pre,
                ...computeEquidistantSize(
                  { width, height },
                  { maxWidth: canvasSize.width * 0.5, maxHeight: canvasSize.height * 0.5 }
                ),
              };
          }
        });
        let code;
        code = rtcEngine.startCameraCapture(sourceType, deviceId, {
          width,
          height,
        });
        if (code !== 0) {
          return code;
        }
        const videoInputConfig = rtcEngine.localTranscoder.createVideoInputStreamConfig({
          sourceType,
          x,
          y,
          width,
          height,
          zOrder,
        });
        rtcEngine.localTranscoder.addVideoInputStream(videoInputConfig);
        const dID = sourceType === VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_PRIMARY ? 0 : 1;
        return rtcEngine.setupLocalViewAndPreview(0, dID, dom, sourceType);
      }
      return -999;
    },
    [canvasSize.height, canvasSize.width, rtcEngine]
  );

  // 渲染共享屏幕
  const setupScreenLocalView = useCallback(
    async (dom: HTMLDivElement, layerConfig: LayerConfig) => {
      if (rtcEngine && dom) {
        const { width, height, x, y, sourceType, zOrder, displayId, isCaptureWindow, windowId, frameRate, bitrate } =
          layerConfig;
        setLayout((pre) => {
          // 这里的计算是为了让画布中图层和源的高宽比保持一致,高宽最大值不能超过一定值
          switch (
            sourceType // 这个版本通过 VIDEO_SOURCE_TYPE判断是白板还是窗口
          ) {
            case VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY: // 窗口 满屏
              return {
                ...computeEquidistantSize(
                  { width, height },
                  { maxWidth: canvasSize.width, maxHeight: canvasSize.height }
                ),
                left: 0,
                top: 0,
                zIndex: 98,
              };
            case VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_SECONDARY: // 白板
              return {
                ...computeEquidistantSize(
                  { width, height },
                  { maxWidth: canvasSize.width * 0.5, maxHeight: canvasSize.height * 0.5 }
                ),
                left: 0,
                top: canvasSize.height * 0.5,
                zIndex: 99,
              };
            default:
              return {
                ...pre,
                ...computeEquidistantSize(
                  { width, height },
                  { maxWidth: canvasSize.width * 0.5, maxHeight: canvasSize.height * 0.5 }
                ),
              };
          }
        });

        const screenCaptureConfig: ScreenCaptureConfiguration = {
          isCaptureWindow: isCaptureWindow,
          displayId: displayId,
          windowId: windowId,
          params: {
            width: width,
            height: height,
            frameRate: frameRate,
            bitrate: bitrate,
          },
          screenRect: ScreenCaptureFullScreenRect,
          regionRect: ScreenCaptureFullScreenRect,
        };

        let code;
        code = rtcEngine.startScreenCapture(sourceType, screenCaptureConfig);
        if (code !== 0) {
          return code;
        }
        const videoInputConfig = rtcEngine.localTranscoder.createVideoInputStreamConfig({
          sourceType,
          x,
          y,
          width,
          height,
          zOrder,
        });
        rtcEngine.localTranscoder.addVideoInputStream(videoInputConfig);
        const dID = sourceType === VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY ? 0 : 1;
        return rtcEngine.setupLocalViewAndPreview(3, dID, dom, sourceType);
      }
      return -999;
    },
    [canvasSize.height, canvasSize.width, rtcEngine]
  );

  useMount(() => {
    if (domRef.current && config) {
      console.log(`🚀  useEffectOnce ~ config ${uid}`, config);
      if (config.sourceType >= 2) {
        setupScreenLocalView(domRef.current, config);
      } else {
        setupCameraLocalView(domRef.current, config);
      }
    }
  });

  const handleItemRemove = useCallback(
    (item: ItemParams) => {
      const { event, props } = item;
      console.log(event, props);
      event.preventDefault();
      remove(data.sourceType);
    },
    [data.sourceType, remove]
  );
  return (
    <div
      className={`layer container ${className ? className : ''}`}
      style={layout}
      onContextMenu={handleContextMenu}
      ref={domRef}
    >
      <Menu id={uid}>
        <Item onClick={handleItemRemove}>删除</Item>
      </Menu>
    </div>
  );
};
export default Layer;

export const getLayerConfigFromDisplayInfo = (
  data: DisplayInfo,
  sourceType: VIDEO_SOURCE_TYPE,
  options?: Partial<LayerConfig>
): LayerConfig => {
  const { id, ...rest } = data.displayId;
  return {
    type: LayerType.SCREEN,
    displayId: id,
    sourceType,
    ...rest,
    isCaptureWindow: false,
    windowId: 0,
    deviceId: '',
    frameRate: 5,
    bitrate: 0,
    zOrder: 300,
    ...options,
  };
};
export const getLayerConfigFromWindowInfo = (
  data: WindowInfo,
  sourceType: VIDEO_SOURCE_TYPE,
  options?: Partial<LayerConfig>
): LayerConfig => {
  return {
    type: LayerType.SCREEN,
    sourceType,
    isCaptureWindow: true,
    x: data.x,
    y: data.y,
    width: data.width,
    height: data.height,
    deviceId: '',
    windowId: data.windowId,
    displayId: 0,
    zOrder: 300,
    frameRate: 5,
    bitrate: 0,
    ...options,
  };
};

export const getLayerConfigFromMediaDeviceInfo = (
  data: VideoDeviceInfo,
  sourceType: VIDEO_SOURCE_TYPE,
  options?: Partial<LayerConfig>
): LayerConfig => {
  return {
    type: LayerType.CAMERA,
    deviceId: data.deviceid,
    x: 0,
    y: 0,
    width: 300,
    height: 200,
    sourceType,
    isCaptureWindow: false,
    windowId: 0,
    displayId: 0,
    zOrder: 300,
    frameRate: 5,
    bitrate: 0,
    ...options,
  };
};

// 在不超过设定高宽最大值的提前下，等比缩放高宽
function computeEquidistantSize(
  data: { width: number; height: number },
  options: { maxWidth: number; maxHeight: number }
) {
  const { width, height } = data;
  const { maxWidth, maxHeight } = options;
  const ratio = width / height;
  const maxRatio = maxWidth / maxHeight;

  const result = { width: maxWidth, height: maxHeight };
  if (ratio < maxRatio) {
    result.width = maxHeight * ratio;
    result.height = maxHeight;
  }
  if (ratio > maxRatio) {
    result.width = maxWidth;
    result.height = maxWidth / ratio;
  }
  return result;
}
