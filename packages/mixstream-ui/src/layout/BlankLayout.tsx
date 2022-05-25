import { Spin } from 'antd';
import { FC, PropsWithChildren, useMemo } from 'react';
import CustomTitleBar from '../components/CustomTitleBar';
import { useGlobal } from '../hooks/global/useGlobal';

const BlankLayout: FC<PropsWithChildren<{}>> = ({ children }) => {
  const { titleBar, loading } = useGlobal();
  const loadingCom = useMemo(() => {
    return loading ? (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    ) : (
      <></>
    );
  }, [loading]);
  return (
    <div>
      {loadingCom}
      <CustomTitleBar {...titleBar} />
      {children}
    </div>
  );
};
export default BlankLayout;
