import Http from "../../utils/http.js"
Page({
    data: {
        config: getApp().globalData,
        userInfo: {
            avatar: '',
            username: 'customer',
            name: '游客'
        },

        stars: [],
        // 按钮配置数据
        entryButtons: [
        {text: '全部非遗文化科普',icon: 'photo-o',url: '/pages/webu/intangibleCultural_list_web/intangibleCultural_list_web'},
        {text: '全部非遗资讯',icon: 'photo-o',url: '/pages/webu/news_list_web/news_list_web'},
        {text: '非遗传承活动列表',icon: 'newspaper-o',extclass: 'entry-bg2',url: '/pages/webu/culActivi_list/culActivi_list'},
        {text: '非遗文化类型列表',icon: 'newspaper-o',extclass: 'entry-bg2',url: '/pages/webu/cultureType_list/cultureType_list'},
                        {icon: 'apps-o',text: '非遗活动报名信息',extclass: 'entry-bg3',url: '/pages/webu/baom_list/baom_list'},
                {icon: 'apps-o',text: '反馈与建议信息',extclass: 'entry-bg3',url: '/pages/webu/fankui_list/fankui_list'},
                {icon: 'apps-o',text: '公告信息',extclass: 'entry-bg3',url: '/pages/webu/notice_list/notice_list'},
                ]
    },

    //下拉刷新
    async onPullDownRefresh() {
        await this.loadUserInfo()
        wx.stopPullDownRefresh(); // 关闭刷新动画
    },
    onLoad() {
        this.loadUserInfo();
    },

    // 加载用户信息
    async loadUserInfo(e) {
        const res = await Http.get('/webu/personal');
        if (res.data && res.data.user) {
            this.setData({
                userInfo: res.data.user,
                stars: res.data.stars
            });
            wx.setStorageSync('user', res.data.user)
        }
        //如果是回调函数则触发
        if(e){
            this.boolChange(e)
        }
    },

    // 跳转到收藏详情
    navigateToDetail(e) {
        const {id, type} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/${type}_detail/${type}_detail?id=${id}`
        });
    },

    // 跳转到其他页面
    navigateTo(e) {
        const url = e.currentTarget.dataset.url;
        wx.navigateTo({
            url
        });
    },
    logout(){
        wx.removeStorageSync('token')
        wx.removeStorageSync('user')
        this.setData({
            userInfo:{
                avatar: '',
                username: 'customer',
                name: '游客',
            },
            stars:[]
        })
    },
    
    // 分享功能
    onShareAppMessage() {
      return {
        title: getApp().globalData.sysName,//分享标题
        path: `/pages/index/index`//分享路径
      };
    },
    //bool变化
    boolChange(e) {
        let key = e.currentTarget.dataset.key;
        let value = this.data[`${key}`]
        value = value ? false : true
        this.setData({
            [`${key}`]: value
        });
    },
    goToMsg(){
        wx.switchTab({
            url:'/pages/messages/messages'
        })
    }
});
