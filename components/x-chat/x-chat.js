import Http from "../../utils/http.js";
Component({
    properties: {
        show: {
            type: Boolean,
            value: false
        },
        rid: {
            type: String,
            value: ''
        },
        rtype: {
            type: String,
            value: ''
        },
        rname: {
            type: String,
            value: ''
        }
    },

    data: {
        msgData: [],
        inputValue: '',
        user: {},
        toView: '',
        timer: null,
        rnameShow:'TA',
        mynameShow:'我',
    },

    observers: {
        'show,rid,rtype':function(){
            this.init()
        },
        'rname':function(rname){
            this.setData({
                rnameShow:rname.length > 2 ? rname.substring(0,2) : rname
            });
        }
    },

    lifetimes: {
        attached() {
            // 获取用户信息
            const user = wx.getStorageSync('user') || {};
            this.setData({
                user
            });
        },
        detached() {
            // 组件卸载时清除定时器
            if (this.data.timer) {
                clearInterval(this.data.timer);
            }
        }
    },

    methods: {
        init(){
            if(!this.data.initing){
                this.setData({
                    initing:true
                })
                if (this.properties.show) {
                    this.loadMessages();
                    this.setData({
                        msgData:[],
                        toView: ''
                    });
                    // 停止轮询
                    if (this.data.timer) {
                        clearInterval(this.data.timer);
                        this.data.timer = null;
                    }
                    // 开始轮询消息
                    this.data.timer = setInterval(() => {
                        this.loadMessages();
                    }, 3000);
                } else {
                    // 停止轮询
                    if (this.data.timer) {
                        clearInterval(this.data.timer);
                        this.data.timer = null;
                    }
                }
                this.setData({
                    initing:false
                })
            }
        },
        // 加载消息
        async loadMessages() {
            if (!this.properties.rid || !this.properties.rtype) return;
            let res = await Http.post('/wechat', {
                action: 'receive',
                rid: this.properties.rid,
                rtype: this.properties.rtype
            })
            if (res.code === 200) {
                const newData = res.data || [];
                const oldData = this.data.msgData;
                // 只添加新消息
                if (newData.length > oldData.length) {
                    this.setData({
                        msgData: newData,
                        toView: `msg-${newData.length - 1}`
                    });
                }
            }
        },

        // 发送消息
        async sendMessage() {
            if (!this.data.inputValue.trim()) return;
            let res = await Http.post('/wechat', {
                action: 'send',
                rid: this.properties.rid,
                rtype: this.properties.rtype,
                content: this.data.inputValue
            })
            if (res.code === 200) {
                // 清空输入框
                this.setData({
                    inputValue: ''
                });

                // 重新加载消息
                this.loadMessages();
            }
        },

        // 输入框变化
        onInputChange(e) {
            this.setData({
                inputValue: e.detail.value
            });
        },

        // 关闭聊天框
        onClose() {
            this.triggerEvent('close');
        }
    }
});