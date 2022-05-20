import { notification } from 'antd';
import axios from 'axios';

declare const API_HOST: string;

// 白名单内错误不通知
const whiteUrl: string[] = [];

const codeMessage: { [key: number]: string } = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  405: '请求方法不被允许。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

const request = axios.create({
  baseURL: `${API_HOST}/api`,
  timeout: 1000 * 30,
  withCredentials: true,
});

request.interceptors.response.use((response) => {
  const {
    status,
    statusText,
    config: { url },
  } = response;

  if (status >= 400) {
    const errorText = codeMessage[status] || statusText;
    if (url && !whiteUrl.includes(url)) {
      notification.error({
        message: `请求错误 ${status}: ${url}`,
        description: errorText,
      });
    }
  }

  return response;
});

export default request;
