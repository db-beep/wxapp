// pages/homework-list/homework-list.js
const app = getApp();
import Http from "../../../utils/http.js"

Page({
    data: {
        isExpanded: false,
        showExpandBtn: false,
        config: getApp().globalData,
        // 页面数据
        respData: {},
        form: {},
        // 加载状态
        loading: false
    },

    //下拉刷新
    async onPullDownRefresh() {
        this.setData({
            form: {}
        }) //清空搜索栏
        await this.loadData()
        wx.stopPullDownRefresh(); // 关闭刷新动画
    },
    async onLoad() {
        this.checkFilterHeight();
        this.setData({
            userInfo: wx.getStorageSync('user')
                                            })
        this.loadData();
    },

    // 加载数据
    async loadData() {
        this.setData({
            loading: true
        }); //显示加载中
        try {
            const res = await Http.get('/webu/intangibleCultural/list-web', this.data.form);
            if(res.success){
                this.setData({
                    respData: res.data || {}
                });
                // 外键发布机构
                if (res.data && res.data.fabjgFrnList) {
                    const fabjgFrnList = [{id: '',name: '全部'}, ...res.data.fabjgFrnList];
                    this.setData({fabjgFrnList});
                }
                wx.showToast({
                    title: '加载成功',
                    icon: 'success',
                    duration: 500
                });
            }
        } catch (error) {
            wx.showToast({
                title: '加载失败，请重试',
                icon: 'none'
            });
        } finally {
            this.setData({
                loading: false
            });
        }
    },

    valueChange(e) {
        let key = e.currentTarget.dataset.key;
        let value = ''
        if (typeof e.detail == 'object') {
            if (typeof e.detail.value == 'object') {
                //下拉框传过来的value是一个对象,默认就取字段id为值
                value = e.detail.value.id
            } else {
                // 日期
                value = e.detail.value
            }
        } else {
            value = e.detail
        }
        this.setData({
            [`${key}`]: value
        });
    },

    // 跳转到详情页
    goToDetail(e) {
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/webu/intangibleCultural_detail_web/intangibleCultural_detail_web?id=` + id
        });
    },
    // 检查筛选条件高度
    checkFilterHeight() {
        const query = wx.createSelectorQuery().in(this);
        query.select('.filter-container').boundingClientRect((rect) => {
            if (rect) {
                // 如果高度超过300rpx，则显示展开按钮
                if (rect.height > 90) { // 300rpx ≈ 150px
                    this.setData({
                        showExpandBtn: true,
                        isExpanded: false // 默认收起
                    });
                } else {
                    this.setData({
                        showExpandBtn: false,
                        isExpanded: true // 如果高度不够，则展开
                    });
                }
            }
        }).exec();
    },

    // 切换展开状态
    toggleExpand() {
        this.setData({
            isExpanded: !this.data.isExpanded
        });
    },
});
