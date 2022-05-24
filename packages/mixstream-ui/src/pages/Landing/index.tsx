import { Button, Form, Input, message, Select } from 'antd';
import { RoleType } from 'mixstream-shared';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'react-use';
import { createProfile, createSession } from '../../services/api';
import './index.css';
import { JoinSessionParams } from './interfaces';

const Landing = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [form] = Form.useForm<JoinSessionParams>();
  const [fromValue, setFromValue] = useLocalStorage<Partial<JoinSessionParams>>('loading-form', {});

  const handleFinish = async () => {
    const value = await form.validateFields();
    setFromValue(value);
    const { channel, username, role } = value;

    const sessionRequest = await createSession({ channel });
    if (sessionRequest.status >= 400) {
      message.error(sessionRequest.statusText);
      return;
    }
    const {
      data: { id: sessionId },
    } = sessionRequest;

    const profileRequest = await createProfile(sessionId, { username, role });
    if (profileRequest.status >= 400) {
      message.error(sessionRequest.statusText);
      return;
    }
    const {
      data: { id: profileId },
    } = profileRequest;

    switch (role) {
      case RoleType.HOST:
        navigate(`/host/session/${sessionId}/profile/${profileId}`);
        break;
      case RoleType.NORMAL:
        navigate(`/viewer/session/${sessionId}/profile/${profileId}`);
        break;
    }
  };

  return (
    <div className="landing-page">
      <div className="landing-from">
        <Form<JoinSessionParams>
          form={form}
          name="landing"
          initialValues={fromValue}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          onFinish={handleFinish}
        >
          <Form.Item
            label={intl.formatMessage({ id: 'landing.label.channel' })}
            name="channel"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'landing.validate.channel.required',
                }),
              },
              {
                min: 6,
                max: 12,
                message: intl.formatMessage({
                  id: 'landing.validate.channel.maxAndMin',
                }),
              },
              {
                pattern: /^[a-zA-Z0-9]+$/,
                message: intl.formatMessage({
                  id: 'landing.validate.channel.pattern',
                }),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: 'landing.label.name' })}
            name="username"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'landing.validate.name.required',
                }),
              },
              {
                min: 3,
                message: intl.formatMessage({
                  id: 'landing.validate.name.min',
                }),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: 'landing.label.role' })}
            name="role"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'landing.validate.role.required',
                }),
              },
            ]}
          >
            <Select>
              <Select.Option value={RoleType.HOST}>
                {intl.formatMessage({ id: 'landing.role.options.host' })}
              </Select.Option>
              <Select.Option value={RoleType.NORMAL}>
                {intl.formatMessage({ id: 'landing.role.options.viewer' })}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 8 }}>
            <Button type="primary" htmlType="submit" block>
              {intl.formatMessage({ id: 'landing.button.join' })}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Landing;
