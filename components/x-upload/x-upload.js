import Http from "../../utils/http.js"
Component({
    properties: {
      // 外部传入的文件名（用于双向绑定）
      filename: {
        type: String,
        value: '',
        observer: function(newVal) {
          // 当外部filename变化时更新内部状态
          this.setData({
            currentFilename: newVal
          });
        }
      },
      // 是否可编辑
      editable: {
        type: Boolean,
        value: true
      }
    },
  
    data: {
      currentFilename: '', // 当前文件名
      uploading: false,    // 上传状态
      progress: 0          // 上传进度
    },
  
    methods: {
      // 选择文件
      chooseFile() {
        if (!this.data.editable) return;
        
        wx.chooseImage({
          count: 1,
          success: (res) => {
            const tempFilePaths = res.tempFilePaths;
            this.uploadFile(tempFilePaths[0]);
          }
        });
      },
  
      // 上传文件
      uploadFile(filePath) {
        this.setData({ uploading: true, progress: 0 });
        
        // 调用封装的Http.upload方法
        Http.upload(filePath, {
          onProgressUpdate: (res) => {
            // 更新上传进度
            this.setData({
              progress: res.progress
            });
          }
        })
        .then(res => {
          // 上传成功，获取后端返回的fileid
          const fileid = res.data.data;
          // 更新组件状态
          this.setData({
            currentFilename: fileid,
            uploading: false,
            progress: 100
          });
          
          // 通知父组件更新filename
          this.triggerEvent('change', fileid);
          
          wx.showToast({
            title: '上传成功',
            icon: 'success'
          });
        })
        .catch(err => {
          console.error('上传失败:', err);
          this.setData({ uploading: false });
          
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          });
        });
      },
  
      // 删除文件
      deleteFile() {
        if (!this.data.editable) return;
        
        this.setData({
          currentFilename: ''
        });
        
        // 通知父组件清空filename
        this.triggerEvent('change', '');
      }
    }
  });
  