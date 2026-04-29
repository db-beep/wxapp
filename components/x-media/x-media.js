Component({
    properties: {
        // 完整文件URL
        fileUrl: {
            type: String,
            value: ''
        },
        imgStyle:{
            type: String,
            value: 'width: 200rpx;height: auto;'
        },
    },

    data: {
        innerUrl:'',
        isDownloading: false,
        extractedFileName: ''
    },

    observers: {
        'fileUrl': function (fileUrl) {
            let BaseFileUrl = getApp().globalData.fileUrl;
            this.setData({
                innerUrl:BaseFileUrl + fileUrl
            })
        }
    },
    methods: {
        
        // 预览图片
        previewImage(e) {
            const url = e.currentTarget.dataset.url;
            wx.previewImage({
                urls: [url],
                current: url
            });
        },

        // 下载文件
        downloadFile(e) {
            const url = e.currentTarget.dataset.url;
            if (this.data.isDownloading) return;
            
            this.setData({ isDownloading: true });
            
            wx.downloadFile({
                url: url,
                success: (res) => {
                    if (res.statusCode === 200) {
                        wx.openDocument({
                            filePath: res.tempFilePath,
                            success: () => {
                                wx.showToast({
                                    title: '打开成功',
                                    icon: 'success'
                                });
                            },
                            fail: (err) => {
                                wx.showToast({
                                    title: '请在移动端查看',
                                    icon: 'none'
                                });
                                console.error('打开文档失败:', err);
                            }
                        });
                    } else {
                        wx.showToast({
                            title: '下载失败',
                            icon: 'none'
                        });
                    }
                },
                fail: (err) => {
                    wx.showToast({
                        title: '下载失败',
                        icon: 'none'
                    });
                    console.error('下载文件失败:', err);
                },
                complete: () => {
                    this.setData({ isDownloading: false });
                }
            });
        }
    }
});
