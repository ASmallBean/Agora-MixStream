import { ConfigProvider } from 'antd';
import { Locale } from 'antd/lib/locale-provider';
import enUS from 'antd/lib/locale/en_US';
import zhCN from 'antd/lib/locale/zh_CN';
import React, { FC, PropsWithChildren } from 'react';
import { IntlProvider } from 'react-intl';
import enUSMessages from '../../i18n/enUS';
import zhCNMessages from '../../i18n/zhCN';

const LOCALES: { [key: string]: Locale } = {
  'en-US': enUS,
  'zh-CN': zhCN,
};

const LOCALE_MESSAGES: { [key: string]: any } = {
  'en-US': enUSMessages,
  'zh-CN': zhCNMessages,
};

const Language: FC<PropsWithChildren<{}>> = ({ children }) => {
  const { language } = navigator;
  const locale = LOCALES[language] ?? enUS;
  const localMessages = LOCALE_MESSAGES[language] ?? enUSMessages;
  return (
    <ConfigProvider locale={locale}>
      <IntlProvider locale={language} messages={localMessages}>
        {children}
      </IntlProvider>
    </ConfigProvider>
  );
};

export default Language;
