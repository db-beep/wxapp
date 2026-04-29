import Http from "../../utils/http.js"
Component({
    properties: {
        // 传入的选中值，字符串形式如 "1,2,3"
        value: {
            type: String,
            value: '',
            observer: function (newVal) {
                this.updateCheckedValues(newVal);
            }
        },
        // 获取选项的API地址
        api: {
            type: String,
            value: ''
        },
        //标签的字段名
        labelField: {
            type: String,
            value: 'label'
        },
        //值的字段名
        valueField: {
            type: String,
            value: 'id'
        },
    },

    data: {
        options: [], // 选项列表
        checkedValues: [], // 当前选中的值数组
        loading: false, // 加载状态
        error: null // 错误信息
    },

    lifetimes: {
        attached: function () {
            // 组件挂载时，如果有API地址则加载选项
            if (this.data.api) {
                this.loadOptions(this.data.api);
            }

            // 初始化选中值
            this.updateCheckedValues(this.data.value);
        }
    },

    methods: {
        // 加载选项数据
        loadOptions: async function (apiUrl) {
            this.setData({
                loading: true,
                error: null
            });
            let {
                data,
                success
            } = await Http.get(apiUrl)
            if (success) {
                this.setData({
                    options: data,
                    loading: false
                });
            } else {
                this.setData({
                    error: '获取数据错误',
                    loading: false
                });
            }
        },

        // 更新选中值数组
        updateCheckedValues: function (valueStr) {
            const values = valueStr ? valueStr.split(',') : [];
            this.setData({
                checkedValues: values
            });
        },

        // 多选框变化事件
        onChange: function (event) {
            const valueStr = event.detail.join(',');

            // 更新内部状态
            this.setData({
                checkedValues: event.detail
            });

            // 触发外部事件，传递字符串形式的值
            this.triggerEvent('change', valueStr);
        }
    }
});