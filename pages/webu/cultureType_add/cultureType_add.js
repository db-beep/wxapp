import Http from "../../../utils/http.js"
Component({
    properties: {
        show: {
            type: Boolean,
            value: false,
            observer: function(show) {
                if(show){
                    this.updateParam();
                }
            }
        },
        param:{
            type:String,
            value:''
        }
    },
    data: {
        form: {}, userInfo:{}
    },
    lifetimes: {
        attached() {
            let userInfo = wx.getStorageSync('user')
            let form = {
            }
            this.setData({
                userInfo:userInfo,
                form:form
            })
        }
    },
    methods: {
        updateParam(){
            let form = this.data.form
            // 合并参数
            if(this.properties.param){
                let paramObj = JSON.parse(this.properties.param)
                Object.assign(form,paramObj)
            }
            this.setData({
                form:form
            })
        },
        // 取消按钮
        onCancel() {
            this.triggerEvent('cancel');
        },
        // 确定按钮
        async onConfirm() {
            if (!this.data.form.name) {
                wx.showToast({
                    title: '请输入非遗类型名',
                    icon: 'none'
                });
                return;
            }
            //保存
            let resp =await Http.post(`/webu/cultureType/save`,this.data.form)
            if(resp.success){
                wx.showToast({title: resp.message, icon: 'none'});
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
                form:{}
            });
        }
    }
});
