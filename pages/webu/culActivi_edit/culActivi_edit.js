import Http from "../../../utils/http.js"
Component({
    properties: {
        show: {
            type: Boolean,
            value: false
        },
        selectedid: {
            type: String,
            value: ''
        }
    },
    data: {
        form: {},userInfo:{}
    },
    lifetimes: {
        attached() {
            let userInfo = wx.getStorageSync('user')
            this.setData({
                userInfo:userInfo,
                form:{
                    zhubf : userInfo.role == 'institution' ? userInfo.id:'',
                }
            })
        }
    },
    observers: {
        'show': function (show) {
            if(show){
                this.loadData();
            }
        }
    },

    methods: {
        // 加载数据
        async loadData() {
            if (!this.properties.selectedid) return;
            const res = await Http.get('/culActivi/detail?id=' + this.properties.selectedid);
            if(res.data){
                this.setData({
                    form: res.data || {}
                });
            }else{
                wx.showToast({
                    title: '无数据！',
                    icon: 'none'
                });
                this.triggerEvent('cancel');
            }
        },

        // 取消按钮
        onCancel() {
            this.triggerEvent('cancel');
            this.resetForm();
        },

        // 确定按钮
        async onConfirm() {
             if (!this.data.form.name) {
                wx.showToast({
                    title: '请输入活动名称',
                    icon: 'none'
                });
                return;
            }
            if (!this.data.form.content) {
                wx.showToast({
                    title: '请输入活动内容',
                    icon: 'none'
                });
                return;
            }
            if (!this.data.form.starttime) {
                wx.showToast({
                    title: '请输入活动开始时间',
                    icon: 'none'
                });
                return;
            }
            if (!this.data.form.count0) {
                wx.showToast({
                    title: '请输入限制报名人数',
                    icon: 'none'
                });
                return;
            }
            //保存
            let resp = await Http.post('/webu/culActivi/save', this.data.form)
            if (resp.success) {
                wx.showToast({
                    title: '成功！',
                    icon: 'none'
                });
                //回调
                this.triggerEvent('callback', this.data.form);
                this.resetForm();
            }
        },

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

        // 重置表单
        resetForm() {
            this.setData({
                form: {}
            });
        }
    }
});
