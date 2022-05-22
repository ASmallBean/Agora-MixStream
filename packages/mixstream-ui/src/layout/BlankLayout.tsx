import { FC, PropsWithChildren } from 'react';
import CustomTitleBar from '../components/CustomTitleBar';
import { useGlobal } from '../hooks/global/useGlobal';

const BlankLayout: FC<PropsWithChildren<{}>> = ({ children }) => {
  const { titleBar } = useGlobal();
  return (
    <div>
      <CustomTitleBar {...titleBar} />
      {children}
    </div>
  );
};
export default BlankLayout;
