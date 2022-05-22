import { Form, Modal, Select } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { resolutionMap } from '../../engine';
import { useEngine } from '../../hooks/engine';
import { useStream } from '../../hooks/stream';
import './index.css';

export interface CameraSelectorProps {
  onCancel: () => void;
  onOk: (device: MediaDeviceInfo, resolution: { width: number; height: number }) => void;
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
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const handleOk = async () => {
    const value = await form.validateFields();
    const { deviceId, resolution } = value;
    const data = devices.find((v) => v.deviceId === deviceId);
    if (data && onOk) {
      onOk(data, resolutionMap[resolution]);
    }
  };

  const handleChange = useCallback(async () => {
    if (domRef.current && rtcEngine && freeCameraCaptureSource !== null) {
      const value = await form.validateFields();
      const { deviceId, resolution } = value;
      rtcEngine.startCameraCapture(freeCameraCaptureSource, deviceId, resolutionMap[resolution]);
      rtcEngine.setupLocalViewAndPreview(
        0,
        freeCameraCaptureSource === 0 ? 0 : 1,
        domRef.current,
        freeCameraCaptureSource
      );
    }
  }, [form, freeCameraCaptureSource, rtcEngine]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    navigator.mediaDevices.enumerateDevices().then((deviceInfo) => {
      const data = deviceInfo.filter((v) => v.kind === 'videoinput');
      setDevices(data);
      console.log('🚀 ~ file: index.tsx ~ line 66 ~ navigator.mediaDevices.enumerateDevices ~ data', data);
      if (data && data.length) {
        form.setFieldsValue({ deviceId: data[0].deviceId, resolution: resolutionOptions[0].value });
        handleChange();
      }
    });
  }, [form, handleChange, visible]);

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
      <Form form={form} name="camera">
        <FormItem label={intl.formatMessage({ id: 'modal.camera.selector.device' })} name="deviceId" {...formLayout}>
          <Select onChange={handleChange}>
            {devices.map((item) => {
              return (
                <Option key={item.deviceId} value={item.deviceId}>
                  {item.label}
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
          <Select onChange={handleChange}>
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
