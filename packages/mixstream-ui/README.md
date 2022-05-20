# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).



1. 主播进入【首页页】，输入 username,role,channel 。【加入频道】(后端 创建频道，创建用户信息，创建两路流记录<一路音频流，一路视频流>)
2. 主播进入【频道页】，此时页面空白，没有开始将流推到远端。（因为主播还没有创建流，没有点击【开始】）
3. 主播添加【摄像头图层】，此时获取摄像头流 navigator.mediaDevices.getUserMedia，通过 video 标签展示摄像头画面          （这个地方我们直接写死获取主摄像头吗？这里目前应该是不需要sdk的吧,还是有sdk的接口都已经封装了）
4. 主播添加【共享桌面图层】，弹窗【选择需要分享的窗口】，获取桌面流通过 video 展示。                                      （这个地方的时候是不是也不需要sdk接口，直接用electron就能完成？）
5. 主播添加【白板图层】<< 还没开始研究 >>
6. 将摄像的流、桌面流 通过 startLocalVideoTranscoder 合流然后推到 第一步创建的【视频流记录】。将音频流推到 第一步创建的【音频流记录】
7. 观众进入【首页页】，输入 username,role,channel 。【加入频道】(后端 验证频道信息，创建用户信息)
8. 观众进入【频道页】，请求后端获取频道中对应的 视频流 和 音频流 的记录信息，通过流ID，频道名 去远端拉流展示。
