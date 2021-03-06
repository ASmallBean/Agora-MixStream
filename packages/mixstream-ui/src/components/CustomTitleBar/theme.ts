import { TitleBarTheme } from 'frameless-titlebar/dist/title-bar/typings';

export const titleBarTheme = (visible: boolean): TitleBarTheme => {
  return {
    bar: {
      palette: 'dark',
      height: '32px',
      color: '#fff',
      background: visible ? 'rgb(36, 51, 65)' : 'rgb(36 51 65 / 0%)',
      borderBottom: '',
      inActiveOpacity: 0.6,
      icon: {
        color: '#0372ef',
        width: 18,
        height: 18,
      },
      title: {
        color: 'inherit',
        align: 'center',
        fontFamily: 'inherit',
        fontWeight: 'normal',
      },
      button: {
        maxWidth: 100,
        disabledOpacity: 0.3,
        active: {
          color: '#fff',
          background: '#303030',
        },
        default: {
          color: 'inherit',
          background: 'transparent',
        },
        hover: {
          color: 'inherit',
          background: 'rgba(255,255,255,0.3)',
        },
      },
    },
    controls: {
      border: 'none',
      layout: 'right',
      borderRadius: 0,
      normal: {
        default: {
          color: 'inherit',
          background: 'transparent',
        },
        hover: {
          color: '#fff',
          background: 'rgba(255,255,255,0.3)',
        },
      },
      close: {
        default: {
          color: 'inherit',
          background: 'transparent',
        },
        hover: {
          color: '#fff',
          background: '#e81123',
        },
      },
    },
    menu: {
      palette: 'dark',
      style: 'default',
      item: {
        height: 30,
        disabledOpacity: 0.3,
        default: {
          color: 'inherit',
          background: 'transparent',
        },
        active: {
          color: '#fff',
          background: 'rgb(241, 146, 95)',
        },
      },
      separator: {
        color: '#e1e4e8',
      },
      header: {
        show: true,
        color: '#6a737d',
      },
      accelerator: {
        color: '#6a737d',
      },
      icon: {
        highlight: true,
      },
      list: {
        minWidth: 200,
        maxWidth: 400,
        marginBottom: 10,
        background: '#303030',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        zIndex: 2001,
      },
      overlay: {
        background: 'black',
        opacity: 0.4,
        zIndex: 2000,
      },
      marginRight: 0,
    },
  };
};
