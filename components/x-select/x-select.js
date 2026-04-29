import Http from "../../utils/http.js"
Component({
    properties: {
        //值
        value: {
            type: String,
            value: ''
        },
        placeholder: {
            type: String,
            value: '请选择'
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
        //传入组件的数据
        columns: {
            type: Array,
            value: []
        },
        //数据url （自动加载）
        url:{
            type: String,
            value: ''
        },
        disabled:{
            type: Boolean,
            value: false
        }
    },

    data: {
        show: false,
        displayValue: '',
        innerColumns:[]
    },
    lifetimes: {
        attached() {
            // 组件初始化时加载数据
            if (this.properties.url) {
                this.loadData();
            }
        }
    },

    observers: {
        'value': function (value) {
            this.updateSetValue()
        },
        'columns': function (columns) {
            this.setData({
                innerColumns:columns
            })
            this.updateSetValue()
        }
    },

    methods: {
        // 从URL加载数据
        async loadData() {
            let url = this.properties.url;
            if (!url) return;
            try {
                // 使用Http.get获取数据
                let { data } = await Http.get(url);
                // 验证数据是否为数组
                if (Array.isArray(data)) {
                    let emptyOption = {}
                    emptyOption[this.properties.labelField] = '请选择'
                    emptyOption[this.properties.valueField] = ''
                    this.setData({
                        innerColumns:[emptyOption,...data]
                    })
                    this.updateSetValue()
                } else {
                    console.error('返回数据格式错误，期望数组格式');
                }
            } catch (error) {
                console.error('加载数据失败:', error);
            }
        },

        updateSetValue(){
            let columns = this.data.innerColumns
            let value = this.properties.value
            // 根据value找到对应的text
            if (columns.length > 0) {
                const selectedItem = columns.find(item => item[this.properties.valueField] === value);
                if(selectedItem){
                    this.setData({
                        displayValue: selectedItem ? selectedItem[this.properties.labelField] : ''
                    });
                }
            }
        },

        showPicker() {
            this.setData({
                show: true
            });
        },

        onConfirm(e) {
            const value = e.detail.value;
            this.setData({
                show: false
            });
            this.triggerEvent('change', {
                value
            });
        },

        onCancel() {
            this.setData({
                show: false
            });
        }
    }
});