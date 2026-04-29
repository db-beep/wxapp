import Http from "../../../utils/http.js"
Page({
    data: {
        user: null,
        config: getApp().globalData,
        startBtnShow: true,
        praiseBtnShow: true
    },

    async onLoad(options) {
        // 加载数据
        this.loadData(options.id);
        //用户信息
        this.setData({
            user: wx.getStorageSync('user')
        })
    },
    // 热门推荐 跳转
    async goToDetail(e) {
        const id = e.currentTarget.dataset.id;
        // wx.navigateTo({ url: `/pages/homeword_detail_web/homeword_detail_web?id=${id}`});
        this.loadData(id);
    },

    // 加载详情数据
    async loadData(id) {
        let {
            data
        } = await Http.get("/webu/intangibleCultural/detail?id=" + id);
        this.setData({
            detail: data.entity,
            recommends: data.recommends,
            starCount: data.starCount,
            praiseCount: data.praiseCount,
        });
        //查看点赞收藏
        if (this.data.user) {
            await this.hasStar(this.data.detail.id)
        }
    },

    // 切换收藏状态
    async toggleStar() {
        if (!this.data.user) {
            wx.showToast({
                title: '请先登录',icon:'none'
            })
            return;
        }
        const isStar = !this.data.startBtnShow;
        let {success} = await Http.post('/web/star', {action: isStar?'cancelStar':'star', id:this.data.detail.id, entityName:'intangibleCultural', op:'收藏'})
        if(success){
            this.setData({
                startBtnShow: isStar,
                starCount: isStar ? this.data.starCount - 1 : this.data.starCount + 1
            });
            wx.showToast({
                title: isStar ? '已取消收藏' : '收藏成功',
                icon: 'success'
            });
        }else{
            wx.showToast({
                title: '请求失败！',icon:'none'
            })
        }
        
    },

    // 切换点赞状态
    async togglePraise() {
        if (!this.data.user) {
            wx.showToast({
                title: '请先登录',icon:'none'
            })
            return;
        }
        const isPraise = !this.data.praiseBtnShow;
        let {success} = await Http.post('/web/star', {action: isPraise?'cancelStar':'star', id:this.data.detail.id, entityName:'intangibleCultural', op:'点赞'})
        if(success){
            this.setData({
                praiseBtnShow: isPraise,
                praiseCount: isPraise ? this.data.praiseCount - 1 : this.data.praiseCount + 1
            });
            wx.showToast({
                title: isPraise ? '已取消点赞' : '点赞成功',
                icon: 'success'
            });
        }else{
            wx.showToast({
                title: '请求失败！',icon:'none'
            })
        }
    },

    //校验是否收藏点赞
    async hasStar(id) {
        {
            let {
                data
            } = await Http.post('/web/star', {
                action: 'hasStar',
                id,
                entityName: 'intangibleCultural',
                op: '收藏'
            })
            if (data) { //已经收藏了
                this.setData({
                    startBtnShow: false
                });
            } else { //没有收藏
                this.setData({
                    startBtnShow: true
                });
            }
        } {
            let {
                data
            } = await Http.post('/web/star', {
                action: 'hasStar',
                id,
                entityName: 'intangibleCultural',
                op: '点赞'
            })
            if (data) { //已经点赞
                this.setData({
                    praiseBtnShow: false
                });
            } else { //没有点赞
                this.setData({
                    praiseBtnShow: true
                });
            }
        }
    },

    // 下载文件
    downloadFile(e) {
        const url = e.currentTarget.dataset.url;
        wx.downloadFile({
            url: url,
            success(res) {
                console.log(res)
                if (res.statusCode === 200) {
                    wx.openDocument({
                        filePath: res.tempFilePath,
                        success() {},
                        fail(e) {
                            wx.showToast({
                                title: '请在移动端查看',
                                icon: 'none'
                            });
                        }
                    });
                } else {
                    wx.showToast({
                        title: '下载失败',
                        icon: 'none'
                    });
                }
            },
            fail() {
                wx.showToast({
                    title: '下载失败 fail',
                    icon: 'none'
                });
            }
        });
    },

    // 分享功能
    onShareAppMessage() {
        return {
            title: this.data.detail.showtitle, //分享标题
            path: `/pages/intangibleCultural_detail_web/intangibleCultural_detail_web?id=${this.data.detail.id}` //分享路径
        };
    },
    //bool变化  新增修改等页面的显示
    boolChange(e) {
        let key = e.currentTarget.dataset.key;
        let needlogin = e.currentTarget.dataset.needlogin;
        if(needlogin && !this.data.user){
            wx.showToast({
                title: '请先登录',icon:'error'
            })
            return
        }
        let value = this.data[`${key}`]
        value = value ? false : true
        this.setData({
            [`${key}`]: value
        });
    },
    // 滚动到评论区
    scrollToComment() {
        wx.createSelectorQuery()
            .select('#comment-area')
            .boundingClientRect(rect => {
                wx.pageScrollTo({
                    scrollTop: rect.top,
                    duration: 300
                });
            })
            .exec();
    },
});
