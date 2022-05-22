import { Modal } from 'antd';
import cls from 'classnames';
import { FC, useState } from 'react';
import { useIntl } from 'react-intl';
import { DisplayInfo, ShareScreenType, WindowInfo } from '../../engine';
import './index.css';

export interface ScreenSelectorHandler {
  (type: ShareScreenType.Window, data: WindowInfo): void;
  (type: ShareScreenType.Display, data: DisplayInfo): void;
}

interface RenderItemProps {
  checked: boolean;
  image: string;
  name: string;
  onClick?: () => void;
}

const RenderItem: FC<RenderItemProps> = (props) => {
  const { checked, image, name, onClick } = props;

  const clickHandle = () => {
    onClick && onClick();
    return;
  };

  return (
    <div
      className={cls({
        item: 1,
        checked,
      })}
      onClick={clickHandle}
    >
      <div className="thumbnail">
        <img src={image} alt="display" />
      </div>
      <div className="name">{name}</div>
    </div>
  );
};

export interface ScreenSelectorProps {
  visible: boolean;
  displays: DisplayInfo[];
  windows: WindowInfo[];
  onOk: ScreenSelectorHandler;
  onCancel: () => void;
}

export const ScreenSelector: FC<ScreenSelectorProps> = (props) => {
  const { visible, onOk, onCancel, displays, windows } = props;
  const intl = useIntl();
  const [selectedInfo, setSelectedInfo] = useState<{ id: number; type: ShareScreenType }>();

  const handleOk = () => {
    if (!selectedInfo) {
      return;
    }
    switch (selectedInfo.type) {
      case ShareScreenType.Display:
        const displayData = displays.find((v) => v.displayId.id === selectedInfo.id);
        displayData && onOk(selectedInfo.type, displayData);
        break;
      case ShareScreenType.Window:
        const windowData = windows.find((v) => v.windowId === selectedInfo.id);
        windowData && onOk(selectedInfo.type, windowData);
        break;
    }
  };

  return (
    <Modal
      wrapClassName="screen-selector"
      title={intl.formatMessage({ id: `modal.screen.selector.title` })}
      okText={intl.formatMessage({ id: `modal.screen.selector.ok` })}
      visible={visible}
      onOk={handleOk}
      okButtonProps={{ disabled: !selectedInfo }}
      width={833}
      onCancel={onCancel}
    >
      <div className="list">
        {displays.map((item, index) => {
          const { id } = item.displayId;
          const checked = !!selectedInfo?.id && id === selectedInfo?.id;
          const name = `${intl.formatMessage({ id: 'modal.screen.selector.tab.display' })} ${index + 1}`;
          return (
            <RenderItem
              key={`${id}-${index}`}
              name={name}
              image={URL.createObjectURL(new Blob([item.image]))}
              checked={checked}
              onClick={() => {
                setSelectedInfo({ type: ShareScreenType.Display, id });
              }}
            />
          );
        })}
        {windows.map((item, index) => {
          const id = item.windowId;
          const checked = !!selectedInfo?.id && id === selectedInfo?.id;
          return (
            <RenderItem
              key={`${id}-${index}`}
              name={item.name}
              image={URL.createObjectURL(new Blob([item.image]))}
              checked={checked}
              onClick={() => {
                setSelectedInfo({ type: ShareScreenType.Window, id });
              }}
            />
          );
        })}
      </div>
    </Modal>
  );
};
