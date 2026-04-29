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
        form: {}
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
            const res = await Http.get('/fankui/detail?id=' + this.properties.selectedid);
            this.setData({
                form: res.data || {}
            });
        },

            showInstitution(e){
                let id = e.currentTarget.dataset.id;
                this.setData({
                    showInstitutionId: id,
                    showInstitution: true
                })
            },
            showUser(e){
                let id = e.currentTarget.dataset.id;
                this.setData({
                    showUserId: id,
                    showUser: true
                })
            },

        // 取消按钮
        onCancel() {
            this.triggerEvent('cancel');
        },

        //bool变化  页面的显示
        boolChange(e) {
            let key = e.currentTarget.dataset.key;
            let value = this.data[`${key}`]
            value = value ? false : true
            this.setData({
                [`${key}`]: value
            });
        }
    }
});
