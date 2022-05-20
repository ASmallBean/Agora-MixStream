import { ScreenCaptureConfiguration } from 'agora-electron-sdk/types/Api/native_type';
import { FC, useCallback, useId, useMemo, useRef, useState } from 'react';
import { Item, ItemProps, Menu, Separator, Submenu, useContextMenu } from 'react-contexify';
import { useMount, useWindowSize } from 'react-use';
import { RtcEngine, ScreenCaptureFullScreenRect } from '../../../services/RtcEngine';
import { DisplayInfo, VIDEO_SOURCE_TYPE, WindowInfo } from '../../../services/type';
import './index.css';

export interface LayerConfig {
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
  rtcEngine?: RtcEngine;
}

// 画布固定宽高比 16:9，高:80vw 宽45vw

const Layer: FC<LayerProps> = ({ className, rtcEngine, data }) => {
  const uid = useId();
  const [config, setConfig] = useState(data);
  const { width: windowWidth } = useWindowSize();
  const domRef = useRef<HTMLDivElement>(null);
  const initMaxSize = useMemo(() => {
    return Math.floor(windowWidth * 0.4 + 1);
  }, [windowWidth]);

  const [size, setSize] = useState({ width: initMaxSize, height: initMaxSize });

  const { show } = useContextMenu({
    id: uid,
  });

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    console.log('🚀 ~ file: main.tsx ~ line 213 ~ handleContextMenu ~ event', event);
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
        setSize((pre) => {
          // 这里的计算是为了让画布中图层和源的高宽比保持一致,高宽最大值不能超过一定值
          return computeEquidistantSize({ width: layerConfig.width, height: layerConfig.height }, { max: pre.width });
        });
        const code = await rtcEngine.startCameraCapture(layerConfig.sourceType, layerConfig.deviceId, {
          width: layerConfig.width,
          height: layerConfig.height,
        });
        if (code !== 0) {
          return code;
        }
        const videoInputConfig = rtcEngine.localTranscoder.createVideoInputStreamConfig({
          sourceType: layerConfig.sourceType,
          x: layerConfig.x,
          y: layerConfig.y,
          width: layerConfig.width,
          height: layerConfig.height,
          zOrder: layerConfig.zOrder,
        });
        rtcEngine.localTranscoder.addVideoInputStream(videoInputConfig);
        const deviceId = layerConfig.sourceType === VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_PRIMARY ? 0 : 1;
        return await rtcEngine.setupLocalView(0, deviceId, dom);
      }
      return -999;
    },
    [rtcEngine]
  );

  // 渲染共享屏幕
  const setupScreenLocalView = useCallback(
    async (dom: HTMLDivElement, layerConfig: LayerConfig) => {
      if (rtcEngine && dom) {
        setSize((pre) => {
          // 这里的计算是为了让画布中图层和源的高宽比保持一致
          return computeEquidistantSize({ width: layerConfig.width, height: layerConfig.height }, { max: pre.width });
        });
        const screenCaptureConfig: ScreenCaptureConfiguration = {
          isCaptureWindow: layerConfig.isCaptureWindow,
          displayId: layerConfig.displayId,
          windowId: layerConfig.windowId,
          params: {
            width: layerConfig.width,
            height: layerConfig.height,
            frameRate: layerConfig.frameRate,
            bitrate: layerConfig.bitrate,
          },
          screenRect: ScreenCaptureFullScreenRect,
          regionRect: ScreenCaptureFullScreenRect,
        };

        const code = rtcEngine.startScreenCapture(layerConfig.sourceType, screenCaptureConfig);
        if (code !== 0) {
          return code;
        }
        const videoInputConfig = rtcEngine.localTranscoder.createVideoInputStreamConfig({
          sourceType: layerConfig.sourceType,
          x: layerConfig.x,
          y: layerConfig.y,
          width: layerConfig.width,
          height: layerConfig.height,
          zOrder: layerConfig.zOrder,
        });
        rtcEngine.localTranscoder.addVideoInputStream(videoInputConfig);
        const deviceId = layerConfig.sourceType === VIDEO_SOURCE_TYPE.VIDEO_SOURCE_SCREEN_PRIMARY ? 0 : 1;
        return await rtcEngine.setupLocalView(3, deviceId, dom);
      }
      return -999;
    },
    [rtcEngine]
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

  const handleItemClick: ItemProps['onClick'] = ({ event, props }) => console.log(event, props);
  return (
    <div
      className={`layer container ${className ? className : ''}`}
      style={size}
      onContextMenu={handleContextMenu}
      ref={domRef}
    >
      <Menu id={uid}>
        <Item onClick={handleItemClick}>Item 1</Item>
        <Item onClick={handleItemClick}>Item 2</Item>
        <Separator />
        <Item disabled>Disabled</Item>
        <Separator />
        <Submenu label="Foobar">
          <Item onClick={handleItemClick}>Sub Item 1</Item>
          <Item onClick={handleItemClick}>Sub Item 2</Item>
        </Submenu>
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
  return {
    sourceType,
    x: data.displayId.x,
    y: data.displayId.y,
    width: data.displayId.height,
    height: data.displayId.width,
    isCaptureWindow: false,
    windowId: 0,
    displayId: data.displayId.id,
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
  data: MediaDeviceInfo,
  sourceType: VIDEO_SOURCE_TYPE,
  options?: Partial<LayerConfig>
): LayerConfig => {
  return {
    deviceId: data.deviceId,
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

function computeEquidistantSize(data: { width: number; height: number }, options: { max: number }) {
  const { width, height } = data;
  const { max } = options;
  if (width > height) {
    return {
      width: max,
      height: (height * max) / width,
    };
  }
  return {
    width: (width * max) / height,
    height: max,
  };
}
