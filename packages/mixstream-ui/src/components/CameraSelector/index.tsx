import { Modal, Select } from 'antd';
import { FC, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

export interface CameraSelectorProps {
  onCancel: () => void;
  onOk: (device: MediaDeviceInfo) => void;
  visible: boolean;
}
const { Option } = Select;

const CameraSelector: FC<CameraSelectorProps> = (props) => {
  const intl = useIntl();
  const { onCancel, onOk, visible } = props;
  const [deviceId, setDeviceId] = useState('');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const handleOk = () => {
    const data = devices.find((v) => v.deviceId === deviceId);
    if (data && onOk) {
      onOk(data);
    }
  };

  const handleChange = (value: string) => {
    setDeviceId(value);
  };

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((deviceInfo) => {
      const data = deviceInfo.filter((v) => v.kind === 'videoinput');
      setDevices(data);
      if (data && data.length) {
        setDeviceId(data[0].deviceId);
      }
    });
  }, []);

  return (
    <Modal
      wrapClassName="camera-selector"
      title={intl.formatMessage({ id: `modal.camera.selector.title` })}
      okText={intl.formatMessage({ id: `modal.camera.selector.ok` })}
      visible={visible}
      onOk={handleOk}
      okButtonProps={{ disabled: !deviceId }}
      width={450}
      onCancel={onCancel}
    >
      <Select value={deviceId} onChange={handleChange}>
        {devices.map((item) => {
          return (
            <Option key={item.deviceId} value={item.deviceId}>
              {item.label}
            </Option>
          );
        })}
      </Select>
    </Modal>
  );
};

export default CameraSelector;
