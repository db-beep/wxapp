import Http from "../../utils/http.js"
Component({
    properties: {
        // 当前选中的值
        value: {
            type: String,
            value: ''
        },
        //传入组件的数据
        columns: {
            type: Array,
            value: []
        },
        // 数据源URL
        url: {
            type: String,
            value: ''
        },
        // 标签字段名
        labelField: {
            type: String,
            value: 'name'
        },
        // 值字段名
        valueField: {
            type: String,
            value: 'id'
        },
        // 是否显示"全部"选项
        showAll: {
            type: Boolean,
            value: true
        },
        // "全部"选项的标签
        allLabel: {
            type: String,
            value: '全部'
        }
    },

    data: {
        // 数据源列表
        list: [],
        // 加载状态
        loading: false
    },

    lifetimes: {
        attached() {
            this.loadData();
        }
    },
    observers: {
        'url': function (url) {
            this.loadData();
        },
        'columns': function (columns) {
            this.setData({
                list:columns
            })
        }
    },

    methods: {
        // 加载数据
        async loadData() {
            if (!this.properties.url) return;
            this.setData({
                loading: true
            });
            try {
                const res = await Http.get(this.properties.url);
                this.setData({
                    list: res.data || []
                });
            } catch (error) {
                console.error('加载数据失败:', error);
                this.setData({
                    list: []
                });
            } finally {
                this.setData({
                    loading: false
                });
            }
        },

        // 值变化事件
        handleChange(e) {
            const value = e.detail;
            this.triggerEvent('change', {
                value
            });
        }
    },

});