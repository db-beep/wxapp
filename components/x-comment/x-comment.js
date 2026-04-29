import Http from "../../utils/http.js"
Component({
    properties: {
        ctid: {
            type: String,
            value: '',
            observer: function (newVal, oldVal) {
                console.log('newVal')
                console.log(newVal)
                if (newVal) {
                    this.init(newVal);
                }
            }
        },
        ctype: {
            type: String,
            value: ''
        }
    },

    data: {
        userInfo: null,
        listData: [],
        myMsg: [],
        content: '',
        avatarColors: [
            '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
            '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
            '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
            '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
            '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
            '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
            '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
            '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
            '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
            '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'
        ]
    },

    lifetimes: {
        attached: function () {
            // 获取用户信息
            try {
                const userInfo = wx.getStorageSync('user');
                if (userInfo) {
                    this.setData({
                        userInfo: userInfo
                    });
                }
            } catch (e) {
                console.error('获取用户信息失败', e);
            }
        }
    },

    methods: {
        // 初始化评论数据
        init: async function (id) {
            // 请求评论数据
            let res = await Http.get('/userComment2/action?ctid=' + id)
            if (res.data) {
                // 为每条评论添加头像颜色和文字
                const comments = res.data.map((item, index) => {
                    const colorIndex = index % this.data.avatarColors.length;
                    return {
                        ...item,
                        avatarColor: this.data.avatarColors[colorIndex],
                        avatarText: item.username.substring(0, 2)
                    };
                });
                this.setData({
                    listData: comments
                });
            }
        },

        // 输入框内容变化
        onContentInput: function (e) {
            this.setData({
                content: e.detail.value
            });
        },

        // 发表评论
        publish: async function () {
            console.log(this.properties.id)
            if (!this.data.content) {
                wx.showToast({
                    title: '评论不可为空哦！',
                    icon: 'none'
                });
                return;
            }
            if (!this.data.userInfo || !this.data.userInfo.id) {
                wx.showToast({
                    title: '请先登录',
                    icon: 'none'
                });
                return;
            }
            let data = await Http.post('/userComment2/action?ctid=' + this.properties.ctid +
                `&content=${this.data.content}&type=${this.properties.ctype}`)
            if (data.success) {
                // 添加到我的评论列表
                this.setData({
                    myMsg: [...this.data.myMsg, this.data.content],
                    content: ''
                });

                wx.showToast({
                    title: '评论成功',
                    icon: 'success'
                });
            } else {
                wx.showToast({
                    title: res.message || '评论失败',
                    icon: 'none'
                });
            }
        },

    }
});