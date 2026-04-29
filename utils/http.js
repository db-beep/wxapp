
// 创建 WxRequest 类，采用类的方式进行封装会让方法更具有复用性，也可以方便进行添加新的属性和方法
class WxRequest {

    get(url, data = {}, config = {}) {
        return this.request(Object.assign({url,data,method: 'GET'}, config))
    }

    post(url, data = {}, config = {}) {
        return this.request(Object.assign({url,data,method: 'POST'}, config))
    }


    // 新增文件上传方法
    upload(filePath, config = {}) {
        // 构建上传配置
        const uploadConfig = {
            url: this.defaults.baseURL + '/file/upload', // 固定上传路径
            filePath: filePath,
            name: 'file', // 与后端@RequestParam("file")对应
            ...config
        }

        // 合并默认配置
        const mergedOptions = {
            ...this.defaults,
            ...uploadConfig
        }

        // 应用请求拦截器
        const finalOptions = this.interceptors.request(mergedOptions)

        return new Promise((resolve, reject) => {
            wx.uploadFile({
                ...finalOptions,
                success: (res) => {
                    // 解析后端返回的JSON数据
                    let responseData
                    try {
                        responseData = JSON.parse(res.data)
                    } catch (e) {
                        responseData = res.data
                    }

                    // 构造统一响应对象
                    const response = {
                        data: responseData,
                        statusCode: res.statusCode
                    }

                    // 应用响应拦截器
                    const processedRes = this.interceptors.response({
                        response: response,
                        isSuccess: true,
                        config: finalOptions
                    });
                    resolve(processedRes)
                },
                fail: (err) => {
                    const processedErr = this.interceptors.response({
                        response: err,
                        isSuccess: false,
                        config: finalOptions
                    });
                    reject(processedErr)
                }
            })
        })
    }

    // 定义拦截器对象，包含请求拦截器和响应拦截器方法，方便在请求或响应之前进行处理。
    interceptors = {
        // 请求拦截器
        request: (config) => config,
        // 响应拦截器
        response: (response) => response
    }

    defaults = {
        baseURL: '', // 请求基准地址
        url: '', // 开发者服务器接口地址
        data: null, // 请求参数
        method: 'GET', // 默认请求方法
        // 请求头
        header: {
            'Content-type': 'application/json' // 设置数据的交互格式
        },
        timeout: 60000, // 小程序默认超时时间是 60000，一分钟
    }

    constructor(params = {}) {
        this.defaults = Object.assign({}, this.defaults, params)
    }

    request(options) {
        // 设置完整URL
        options.url = this.defaults.baseURL + options.url

        // 合并配置
        const mergedOptions = {
            ...this.defaults,
            ...options
        }

        // 应用请求拦截器
        const finalOptions = this.interceptors.request(mergedOptions)

        return new Promise((resolve, reject) => {
            wx.request({
                ...finalOptions,
                success: (res) => {
                    res = res.data
                    const processedRes = this.interceptors.response({
                        response: res,
                        isSuccess: true,
                        config: finalOptions
                    });
                    resolve(processedRes)
                },
                fail: (err) => {
                    const processedErr = this.interceptors.response({
                        response: err,
                        isSuccess: false,
                        config: finalOptions
                    });
                    reject(processedErr)
                }
            })
        })
    }

}

const instance = new WxRequest({
    baseURL: getApp().globalData.baseUrl
})

// 请求拦截器
instance.interceptors.request = (config) => {
    // 从本地获取 token
    if (wx.getStorageSync('token')) {
        // 如果存在 token ，则添加请求头
        config.header['token'] = wx.getStorageSync('token')
    }
    return config
}

// 响应拦截器
instance.interceptors.response = ({response, isSuccess, config}) => {
    // 处理下载请求的特殊逻辑
    if (config && config.isDownload) {
        if (response.data.statusCode === 200) {
            return response // 下载成功，返回包含tempFilePath的对象
        } else {
            wx.showToast({
                title: '下载失败!',
                icon: 'error',
                duration: 1500,
                mask: true
            })
            return Promise.reject(response)
        }
    }

    // 处理普通请求和上传请求
    if (!isSuccess) {
        wx.showToast({
            title: '网络异常!', // 提示的内容
            icon: 'error',   // 提示图标
            duration: 1500,	 // 提示的延迟时间
            mask: true		 // 是否显示透明蒙层，防止触摸穿
        })
        // 如果请求错误，将错误的结果返回出去
        return response
    }

    // 处理业务状态码
    if(response.code === 500){
        wx.showToast({
            title: response.message + "!!",
            icon: 'none',
            duration: 1500,
            mask: true
        })
    }
    else if(response.code === 302){
        wx.showToast({
            title: response.message,
            icon: 'error',
            duration: 1500,
            mask: true
        })
        //不要重定向
        if(config.noRedirect){
            return response
        }
        wx.setStorageSync('user', null)
        setTimeout(function(){
            if(config.url.indexOf('/webu/personal') != -1){
                wx.navigateTo({url: '/pages/login/login'})
            }else{
                //设置登录成功后跳转的路径
                const pages = getCurrentPages();
                if (pages.length > 0) {
                    const currentPage = pages[pages.length - 1].route;
                    wx.setStorageSync('loginUrl', currentPage)
                }
                wx.redirectTo({url: '/pages/login/login'}) //销毁当前页面
            }
        },800)
    }
    return response
}

export default instance
