import { Form, message, Modal, Select } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { FC, useCallback, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { DeviceInfo, resolutionMap, VIDEO_SOURCE_TYPE } from '../../engine';
import { useEngine } from '../../hooks/engine';
import { useStream } from '../../hooks/stream';
import './index.css';

export interface CameraSelectorProps {
  onCancel: () => void;
  onSuccess: (device: DeviceInfo, resolution: { width: number; height: number }) => void;
  visible: boolean;
  devices: DeviceInfo[];
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
  const { onCancel, onSuccess, visible, devices } = props;
  const intl = useIntl();
  const { rtcEngine } = useEngine();
  const { freeCameraCaptureSource } = useStream();
  const domRef = useRef<HTMLDivElement>(null);
  const [form] = Form.useForm<CameraForm>();

  const onSelectedHandle = async () => {
    const value = await form.validateFields();
    const { deviceId, resolution } = value;
    const data = devices.find((v) => v.deviceid === deviceId);
    if (data && onSuccess) {
      onSuccess(data, resolutionMap[resolution]);
    }
  };

  const renderHandle = useCallback(async () => {
    if (domRef.current && rtcEngine && freeCameraCaptureSource !== null) {
      const value = await form.validateFields();
      const { deviceId, resolution } = value;
      rtcEngine.startCameraCapture(freeCameraCaptureSource, deviceId, resolutionMap[resolution]);
      rtcEngine.setupLocalView(
        0,
        freeCameraCaptureSource === VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_PRIMARY ? 0 : 1,
        domRef.current
      );
    }
  }, [form, freeCameraCaptureSource, rtcEngine]);

  useEffect(() => {
    if (visible && devices && devices.length) {
      const defaultDevice = devices[0].deviceid;
      form.setFieldsValue({ deviceId: defaultDevice, resolution: resolutionOptions[0].value });
      form.submit();
      return;
    }
  }, [devices, form, visible]);

  useEffect(() => {
    if (visible) {
      if (!devices || devices.length === 0) {
        message.warn(intl.formatMessage({ id: 'modal.camera.selector.error.device' }));
        return;
      }
    }
  }, [devices, intl, visible]);

  return (
    <Modal
      wrapClassName="camera-selector"
      title={intl.formatMessage({ id: `modal.camera.selector.title` })}
      okText={intl.formatMessage({ id: `modal.camera.selector.ok` })}
      visible={visible}
      onOk={onSelectedHandle}
      width={550}
      onCancel={onCancel}
    >
      <div className="camera-container" ref={domRef}></div>
      <Form form={form} name="camera" onFinish={renderHandle}>
        <FormItem label={intl.formatMessage({ id: 'modal.camera.selector.device' })} name="deviceId" {...formLayout}>
          <Select onChange={renderHandle}>
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
          <Select onChange={renderHandle}>
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
