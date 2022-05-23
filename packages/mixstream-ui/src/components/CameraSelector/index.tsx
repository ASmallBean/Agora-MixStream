import { Form, Modal, Select } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { resolutionMap, RtcEngineEvents, VideoDeviceInfo } from '../../engine';
import { useEngine } from '../../hooks/engine';
import { useStream } from '../../hooks/stream';
import './index.css';

export interface CameraSelectorProps {
  onCancel: () => void;
  onOk: (device: VideoDeviceInfo, resolution: { width: number; height: number }) => void;
  visible: boolean;
}
const { Option } = Select;

const resolutionOptions = Object.keys(resolutionMap).map((v) => ({ label: v, value: v }));

interface CameraForm {
  deviceId: string;
  resolution: string;
}

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 },
};

const CameraSelector: FC<CameraSelectorProps> = (props) => {
  const { onCancel, onOk, visible } = props;
  const intl = useIntl();
  const { rtcEngine } = useEngine();
  const { freeCameraCaptureSource } = useStream();
  const domRef = useRef<HTMLDivElement>(null);
  const [form] = Form.useForm<CameraForm>();
  const [devices, setDevices] = useState<VideoDeviceInfo[]>([]);

  const handleOk = async () => {
    const value = await form.validateFields();
    const { deviceId, resolution } = value;
    const data = devices.find((v) => v.deviceid === deviceId);
    if (data && onOk) {
      onOk(data, resolutionMap[resolution]);
    }
  };

  const renderCameraHandle = useCallback(async () => {
    if (domRef.current && rtcEngine && freeCameraCaptureSource !== null) {
      const value = await form.validateFields();
      const { deviceId, resolution } = value;
      rtcEngine.startCameraCapture(freeCameraCaptureSource, deviceId, resolutionMap[resolution]);
      rtcEngine.setupLocalViewWithStartPreview(
        0,
        freeCameraCaptureSource === 0 ? 0 : 1,
        domRef.current,
        freeCameraCaptureSource
      );
    }
  }, [form, freeCameraCaptureSource, rtcEngine]);

  useEffect(() => {
    if (!rtcEngine) {
      return;
    }
    const list = rtcEngine.getVideoDevices();
    setDevices(list);
    if (visible) {
      if (list.length) {
        const deviceId = form.getFieldValue('deviceId');
        if (deviceId === '' || !list.some((v) => v.deviceid === deviceId)) {
          form.setFieldsValue({ deviceId: list[0].deviceid, resolution: resolutionOptions[0].value });
        }
      }
      form.submit();
      return;
    }
  }, [form, rtcEngine, visible]);

  useEffect(() => {
    const handle = () => {
      if (rtcEngine) {
        setDevices(rtcEngine.getVideoDevices());
      }
    };
    rtcEngine?.on(RtcEngineEvents.VIDEO_DEVICE_STATE_CHANGED, handle);
    return () => {
      rtcEngine?.off(RtcEngineEvents.VIDEO_DEVICE_STATE_CHANGED, handle);
    };
  }, [rtcEngine]);

  return (
    <Modal
      wrapClassName="camera-selector"
      title={intl.formatMessage({ id: `modal.camera.selector.title` })}
      okText={intl.formatMessage({ id: `modal.camera.selector.ok` })}
      visible={visible}
      onOk={handleOk}
      width={550}
      onCancel={onCancel}
    >
      <div className="camera-container" ref={domRef}></div>
      <Form form={form} name="camera" onFinish={renderCameraHandle}>
        <FormItem label={intl.formatMessage({ id: 'modal.camera.selector.device' })} name="deviceId" {...formLayout}>
          <Select onChange={renderCameraHandle}>
            {devices.map((item) => {
              return (
                <Option key={item.deviceid} value={item.deviceid}>
                  {item.devicename}
                </Option>
              );
            })}
          </Select>
        </FormItem>
        <FormItem
          label={intl.formatMessage({ id: 'modal.camera.selector.resolution' })}
          name="resolution"
          {...formLayout}
        >
          <Select onChange={renderCameraHandle}>
            {resolutionOptions.map((item) => {
              return (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              );
            })}
          </Select>
        </FormItem>
      </Form>
    </Modal>
  );
};

export default CameraSelector;
