import Http from "../../utils/http.js"

Page({
    data: {
        user: null,
        chatList: [],
        fullPath: '',

        showChat: false,
        rid: '',
        rtype: '',
        rname: ''
    },

    onLoad(options) {
        // 获取当前用户信息
        this.setData({
            fullPath: `/${this.__route__}`
        })
    },

    async onShow() {
        console.log("show")
        const res = await Http.get('/webu/personal', {}, {
            noRedirect: true
        });
        if (res.data && res.data.user) {
            this.setData({
                user: res.data.user
            });
            wx.setStorageSync('user', res.data.user)
            // 获取聊天列表
            this.getChatList()
        }
    },

    onUnload() {
        // 清除定时器
        if (this.timer) {
            clearTimeout(this.timer)
        }
    },

    // 获取聊天列表
    async getChatList() {
        // 只有当前页面显示才去获取聊天列表
        const pages = getCurrentPages()
        const currentPage = pages[pages.length - 1]
        if (currentPage.route === this.data.fullPath.substring(1)) {
            try {
                const res = await Http.get('/wechat')
                if (res.data) {
                    console.log(`与${res.data.length}人有聊天记录`)
                    if (res.data.length > 0) {
                        for (let i = 0; i < res.data.length; i++) {
                            if (res.data[i].hisName && res.data[i].hisName.length >= 2) {
                                res.data[i].hisName2 = res.data[i].hisName.substring(0, 2)
                            } else {
                                res.data[i].hisName2 = res.data[i].hisName
                            }
                        }
                    }
                    this.setData({
                        chatList: res.data
                    })
                }
            } catch (error) {
                console.error('获取聊天列表失败:', error)
            }
        }

        // 轮询获取消息列表
        this.timer = setTimeout(() => {
            this.getChatList()
        }, 5000)
    },

    // 关闭聊天
    onChatClose() {
        this.setData({
            showChat: false
        })
    },
    // 打开聊天
    chatDetail(e) {
        const {
            rid,
            rtype,
            hisname
        } = e.currentTarget.dataset
        this.setData({
            showChat: true,
            rid,
            rtype,
            rname: hisname
        })
    }
})