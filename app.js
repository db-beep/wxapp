// app.js
App({
    globalData: {
        sysName: "悦动非遗传承之家",
        baseUrl: "http://localhost:8080",
        fileUrl: "http://localhost:8080/file/downloadById?fileid=",
        //系统用户角色信息
        sysRole:[
                            {text: '用户',value: 'user'},
                    ]
    },
    onLaunch: function () {
        // 监听小程序初始化
        console.log('onLaunch: 当小程序初始化完成时，会触发 onLaunch')
    },
    onShow: function (options) {
        // 监听小程序的显示
        console.log('onShow: 当小程序启动，或从后台进入前台显示')
    },
    onHide: function () {
        // 监听小程序的隐藏
        console.log('onHide: 小程序从前台进入后台')
    }
})
