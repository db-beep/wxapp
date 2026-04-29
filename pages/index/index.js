import Http from "../../utils/http.js"
import * as echarts from "../../components/ec-canvas/echarts.min.js"
Page({
    //下拉刷新
    async onPullDownRefresh() {
        await this.onLoad()
        wx.stopPullDownRefresh(); // 关闭刷新动画
    },
    //初始化
    async onLoad() {
        let {
            data
        } = await Http.get("/welcome?n=4");
        //公告内容
        let notices = data.notices;
        let announcementStr = "";
        for (let i = 0; i < notices.length; i++) {
            let notice = notices[i]
            announcementStr += notice.title + ' : ' + notice.content + '🐟 🐟 🐟';
        }
        this.setData({
            announcement: announcementStr,
            intangibleCulturalHotList: data.intangibleCulturalHotList,
            newsHotList: data.newsHotList,
        })
        this.loadEcharts();
    },

    //数据
    data: {
        config: getApp().globalData,
        // 导航按钮
        navButtons: [
            {name: '非遗文化科普',url: '/pages/webu/intangibleCultural_list_web/intangibleCultural_list_web'},
            {name: '非遗资讯',url: '/pages/webu/news_list_web/news_list_web'},
        ],
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

    // 页面跳转函数
    navigateTo(e) {
        const url = e.currentTarget.dataset.url;
        wx.navigateTo({
            url: url
        });
    },

    // 跳转到详情页
    goToDetail(e) {
        const id = e.currentTarget.dataset.id;
        const type = e.currentTarget.dataset.type;
        wx.navigateTo({
            url: `/pages/webu/${ type}_detail_web/${ type}_detail_web?id=${ id}`
        });
    },

    async loadEcharts() {
        let data = await Http.post("/hello");
        if (!data.success || data.data.length == 0) {
            return
        }

        // 处理统计数据
        let statisticData = data.data.filter(e => e.type === 'n').map(e => ({
            name: e.name,
            value: e.value
        }));

        // 处理图表数据,同VUE
        let echartsList = data.data
            .filter(e => ['line', 'bar', 'pie'].includes(e.type))
            .map(e => {
                const item = {name: e.name};
                if (e.type === 'line' || e.type === 'bar') {
                    item.option = {
                        xAxis: {
                            data: e.names,
                            axisLabel: {
                                rotate: 45,
                                interval: 0
                            }
                        },
                        yAxis: {},
                        series: [{
                            type: e.type,
                            data: e.values,
                            label: {
                                show: true,
                                position: 'top',
                                formatter: '{c}'
                            }
                        }]
                    };
                } else if (e.type === 'pie') {
                    item.option = {
                        series: [{
                            type: 'pie',
                            data: e.values.map((value, idx) => ({
                                name: e.names[idx],
                                value: value
                            })),
                            label: {
                                show: true,
                                formatter: '{b}: {c} ({d}%)'
                            },
                            itemStyle: {
                                color: (params) => {
                                    const colors = [
                                        '#C1232B', '#e3ee0d', '#1ad02a', '#132ee0',
                                        '#12d7d0', '#4015c2', '#9c16b9', '#d37408',
                                        '#203b12', '#9eece5', '#d397d7', '#561812'
                                    ];
                                    return colors[params.dataIndex % colors.length];
                                }
                            }
                        }]
                    };
                }
                return item;
            });

        //转小程序
        let ecInfos = []
        for(let i = 0 ; i < echartsList.length ; i++){
            let item = echartsList[i]
            let ecInfo = {name:item.name}
            ecInfo.ec = {
                onInit: function initChart(canvas, width, height, dpr) {
                    const chart = echarts.init(canvas, null, {
                        width: width,
                        height: height,
                        devicePixelRatio: dpr
                    });
                    canvas.setChart(chart);
                    chart.setOption(item.option);
                    return chart;
                }
            }
            ecInfos.push(ecInfo)
        }
        this.setData({
            ls:data.data.length,
            statisticData,
            ecInfos
        })
    }

});
