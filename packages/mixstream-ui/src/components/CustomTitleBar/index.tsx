import { remote } from 'electron';
import TitleBar from 'frameless-titlebar';
import { FC, useEffect, useMemo, useState } from 'react';
import './index.css';
import { titleBarTheme } from './theme';

const currentWindow = remote.getCurrentWindow();
const platform = remote.process.platform;

interface CustomTitleBarProps {
  title?: string;
  visible?: boolean;
}

const CustomTitleBar: FC<CustomTitleBarProps> = ({ title, visible = true }) => {
  const [maximized, setMaximized] = useState(currentWindow.isMaximized());

  const them = useMemo(() => {
    return titleBarTheme(visible);
  }, [visible]);

  useEffect(() => {
    const onMaximized = () => setMaximized(true);
    const onRestore = () => setMaximized(false);
    currentWindow.on('maximize', onMaximized);
    currentWindow.on('unmaximize', onRestore);
    return () => {
      currentWindow.removeListener('maximize', onMaximized);
      currentWindow.removeListener('unmaximize', onRestore);
    };
  }, []);

  const handleMaximize = () => {
    if (maximized) {
      currentWindow.restore();
    } else {
      currentWindow.maximize();
    }
  };

  return (
    <div className="title-bar">
      <TitleBar
        currentWindow={currentWindow}
        platform={platform as any} // win32, darwin, linux
        onClose={() => currentWindow.close()}
        onMinimize={() => currentWindow.minimize()}
        onMaximize={handleMaximize}
        onDoubleClick={handleMaximize}
        disableMinimize={false}
        disableMaximize={false}
        maximized={maximized}
        title={title}
        theme={them}
        menu={[
          {
            id: 'new',
            label: 'New',
            disabled: true,
            hidden: false,
            submenu: [],
            type: 'normal',
            click: (menu, browser, e) => {
              console.log(1);
            },
          },
        ]}
      ></TitleBar>
    </div>
  );
};

export default CustomTitleBar;
