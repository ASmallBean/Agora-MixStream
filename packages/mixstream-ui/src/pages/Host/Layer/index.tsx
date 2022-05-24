import { ScreenCaptureConfiguration } from 'agora-electron-sdk/types/Api/native_type';
import { FC, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Item, ItemParams, Menu, useContextMenu } from 'react-contexify';
import { useMount } from 'react-use';
import {
  DisplayInfo,
  getResolutionSize,
  RtcEngineControl,
  ScreenCaptureFullScreenRect,
  VideoDeviceInfo,
  VIDEO_SOURCE_TYPE,
  WindowInfo,
} from '../../../engine';
import { useStream } from '../../../hooks/stream';
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
  frameRate: number;
  bitrate: number;
  width: number;
  height: number;
  x: number;
  y: number;
  origin: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
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
  const { updateStreams, resolution } = useStream();

  // 布局存储的是百分比
  const [layout, setLayout] = useState({
    width: 100,
    height: 100,
    left: 0,
    top: 0,
    zIndex: 100,
  });

  const styles = useMemo(() => {
    const { width, height, left, top, zIndex } = layout;
    return {
      width: `${width}%`,
      height: `${height}%`,
      left: `${left}%`,
      top: `${top}%`,
      zIndex,
    };
  }, [layout]);

  // 换算图层在合图的时候的布局数据
  useEffect(() => {
    const { width: resolutionWidth, height: resolutionHeight } = getResolutionSize(resolution);
    const { width: layoutWidth, height: layoutHeight, left, top, zIndex } = layout;
    const x = (resolutionWidth * left) / 100;
    const y = (resolutionHeight * top) / 100;
    const width = (resolutionWidth * layoutWidth) / 100;
    const height = (resolutionHeight * layoutHeight) / 100;
    updateStreams(data.sourceType, {
      width,
      height,
      x,
      y,
      zOrder: zIndex,
    });
  }, [data.sourceType, layout, resolution, updateStreams]);

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
        const {
          origin: { width, height },
          sourceType,
          deviceId,
        } = layerConfig;
        setLayout((pre) => {
          // 这里的计算是为了让画布中图层和源的高宽比保持一致,高宽最大值不能超过一定值
          switch (
            sourceType // 这个版本通过 VIDEO_SOURCE_TYPE 判断是第一个摄像头还是第二个
          ) {
            case VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_PRIMARY: // 左边
              return {
                width: 20,
                height: 20,
                left: 80,
                top: 0,
                zIndex: 61,
              };
            case VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_SECONDARY: // 右边
              return {
                width: 20,
                height: 20,
                left: 0,
                top: 0,
                zIndex: 60,
              };
            default:
              return {
                ...pre,
                width: 50,
                height: 50,
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
        const dID = sourceType === VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_PRIMARY ? 0 : 1;
        return rtcEngine.setupLocalViewWithStartPreview(0, dID, dom, sourceType);
      }
      return -999;
    },
    [rtcEngine]
  );

  // 渲染共享屏幕
  const setupScreenLocalView = useCallback(
    async (dom: HTMLDivElement, layerConfig: LayerConfig) => {
      if (rtcEngine && dom) {
        const {
          origin: { width, height },
          sourceType,
          displayId,
          isCaptureWindow,
          windowId,
          frameRate,
          bitrate,
        } = layerConfig;
        setLayout((pre) => {
          // 这里的计算是为了让画布中图层和源的高宽比保持一致,高宽最大值不能超过一定值
          switch (
            sourceType // 这个版本通过 VIDEO_SOURCE_TYPE判断是白板还是窗口
          ) {
            case VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY: // 窗口 满屏
              return {
                width: 100,
                height: 100,
                left: 0,
                top: 0,
                zIndex: 40,
              };
            case VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_SECONDARY: // 白板
              return {
                width: 50,
                height: 50,
                left: 0,
                top: 50,
                zIndex: 50,
              };
            default:
              return {
                ...pre,
                width: 50,
                height: 50,
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
        const dID = sourceType === VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY ? 0 : 1;
        return rtcEngine.setupLocalViewWithStartPreview(3, dID, dom, sourceType);
      }
      return -999;
    },
    [rtcEngine]
  );

  useMount(() => {
    if (domRef.current && data) {
      if (data.sourceType >= 2) {
        setupScreenLocalView(domRef.current, data);
      } else {
        setupCameraLocalView(domRef.current, data);
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
      style={styles}
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
  const { id, width, height, x, y } = data.displayId;
  return {
    type: LayerType.SCREEN,
    displayId: id,
    sourceType,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    isCaptureWindow: false,
    windowId: 0,
    deviceId: '',
    frameRate: 5,
    bitrate: 0,
    zOrder: 50,
    origin: {
      width,
      height,
      x,
      y,
    },
    ...options,
  };
};
export const getLayerConfigFromWindowInfo = (
  data: WindowInfo,
  sourceType: VIDEO_SOURCE_TYPE,
  options?: Partial<LayerConfig>
): LayerConfig => {
  const { width, height, x, y } = data;
  return {
    type: LayerType.SCREEN,
    sourceType,
    isCaptureWindow: true,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    deviceId: '',
    windowId: data.windowId,
    displayId: 0,
    zOrder: 50,
    frameRate: 5,
    bitrate: 0,
    origin: {
      width,
      height,
      x,
      y,
    },
    ...options,
  };
};

export const getLayerConfigFromMediaDeviceInfo = (
  data: VideoDeviceInfo & Pick<LayerConfig, 'width' | 'height'>,
  sourceType: VIDEO_SOURCE_TYPE,
  options?: Partial<LayerConfig>
): LayerConfig => {
  const { deviceid, width, height } = data;
  return {
    type: LayerType.CAMERA,
    deviceId: deviceid,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    sourceType,
    isCaptureWindow: false,
    windowId: 0,
    displayId: 0,
    zOrder: 50,
    frameRate: 5,
    bitrate: 0,
    origin: {
      width,
      height,
      x: 0,
      y: 0,
    },
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
