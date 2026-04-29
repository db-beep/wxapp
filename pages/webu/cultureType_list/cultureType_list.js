// pages/homework-list/homework-list.js
const app = getApp();
import Http from "../../../utils/http.js"

Page({
    data: {
        isExpanded: false,
        showExpandBtn: false,
        config: getApp().globalData,
        form: {}, //查询表单
        showRecords: [], //记录
        pager: {
            total: 0,
            current: 0,
            size: 10
        }, //分页
        loading: false, // 加载状态
        userInfo: null, //用户信息
    },
    async onLoad() {
        this.setData({
            userInfo: wx.getStorageSync('user')
        })
        this.checkFilterHeight();
        this.loadData();
    },
    //下拉刷新
    async onPullDownRefresh() {
        this.setData({
            form: {},
            showRecords: [],
            pager: {
                total: 0,
                current: 0,
                size: 10
            },
        }) //清空搜索栏
        await this.loadData()
        wx.stopPullDownRefresh(); // 关闭刷新动画
    },
    // 上拉加载更多
    async onReachBottom() {
        await this.loadData()
    },
    //点击查询
    async queryData() {
        this.setData({
            showRecords: [],
            pager: {
                total: 0,
                current: 0,
                size: 10
            }
        })
        await this.loadData()
    },
    // 加载数据
    async loadData() {
        //防抖
        if (this.data.loading) {
            return
        }
        //加载完毕，则提示
        if (this.data.showRecords.length > 0 && this.data.showRecords.length >= this.data.pager.total) {
            wx.showToast({
                title: '到底了~',
                icon: 'none'
            })
            return
        }
        //显示加载中
        this.setData({
            loading: true
        });
        try {
            let quertData = Object.assign({}, this.data.form)
            quertData.current = this.data.pager.current + 1
            quertData.size = this.data.pager.size
            const res = await Http.get('/webu/cultureType/list', quertData);
            if (res.success) {
                let showRecords = this.data.showRecords.concat(res.data.records)
                this.setData({
                    pager: res.data || {},
                    showRecords: showRecords
                });
                wx.showToast({
                    title: '加载成功',
                    icon: 'success',
                    duration: 500
                });
            }
        } catch (error) {
            console.log(error)
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



    //============================================================
    //编辑页
    async handleEdit(e) {
        let id = e.currentTarget.dataset.id;
        this.setData({
            selectedid: id,
            showEdit: true
        })
    },
    //详情页
    async handleDetail(e) {
        let id = e.currentTarget.dataset.id;
        this.setData({
            selectedid: id,
            showDetail: true
        })

    },
    async handleDel(e) {
        let id = e.currentTarget.dataset.id;
        wx.showModal({
            title: '提示',
            content: '确定要删除吗？',
            success: async (res) => {  // 使用箭头函数
                if (res.confirm) {
                    let {success} = await Http.post('/webu/cultureType/delete?id=' + id)
                    if(success){
                        await this.queryData();
                        wx.showToast({
                            title: '删除成功',
                            icon: 'none'
                        });
                    }
                }
            }
        });
    },
    //新增修改回调
    async callback(e) {
        this.setData({
            showAdd: false,
            showEdit: false,
        })
        await this.queryData();
    },
    //============================================================

    //输入框值的变化
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

    //bool变化  新增修改等页面的显示
    boolChange(e) {
        let key = e.currentTarget.dataset.key;
        let value = this.data[`${key}`]
        value = value ? false : true
        this.setData({
            [`${key}`]: value
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
