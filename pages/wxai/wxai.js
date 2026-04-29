import Http from "../../utils/http.js"
Page({
    data: {
      messages: [],
      inputText: '',
      isAiTyping: false,
      toView: '',
      msgIdCounter: 0,
      userInfo:null
    },
    //下拉刷新
    async onPullDownRefresh() {
        await this.onLoad()
        wx.stopPullDownRefresh(); // 关闭刷新动画
    },
    async onLoad() {
        console.log('ai page')
        const res = await Http.get('/webu/personal');
        if (res.data && res.data.user) {
            this.setData({
                userInfo: res.data.user,
            });
            this.fetchChatMessages();
        }else{
            wx.showToast({
              title: '请先登录!',
              icon:'error'
            })
        }
    },
  
    // 获取历史消息
    async fetchChatMessages() {
      try {
        const res = await Http.get('/messages')
        const history = res.data || [];
        const messages = [];
        
        if (history.length === 0) {
          messages.push({
            id: this.data.msgIdCounter++,
            type: 'assistant',
            content: '你好，我是AI小助手呀，请随时提问！'
          });
        } else {
          history.forEach(msg => {
            if (msg && msg.msg && msg.type) {
              const type = msg.type === 'user' ? 'user' : 'assistant';
              // 小程序中简单处理，实际项目中可引入markdown解析库
              const content = type === 'assistant' 
                ? this.parseMarkdown(msg.msg) 
                : (msg.msg);
                
              messages.push({
                id: this.data.msgIdCounter++,
                type,
                content
              });
            }
          });
        }
        
        this.setData({ 
          messages,
          toView: `msg-${messages[messages.length - 1].id}`
        });
      } catch (error) {
        console.error('获取历史消息失败:', error);
        this.setData({
          messages: [{
            id: this.data.msgIdCounter++,
            type: 'assistant',
            content: '你好，我是AI小助手呀，请随时提问！'
          }]
        });
      }
    },
  
    // 发送消息
    async sendMessage() {
      console.log(1111)
      const message = this.data.inputText.trim();
      if (!message || this.data.isAiTyping) return;
  
      // 添加用户消息
      const userMsg = {
        id: this.data.msgIdCounter++,
        type: 'user',
        content: message
      };
      
      this.setData({
        messages: [...this.data.messages, userMsg],
        inputText: '',
        isAiTyping: true,
        toView: `msg-${userMsg.id}`
      });
  
      // 请求AI响应
      try {
        const response = await Http.post(`/chat0?message=${encodeURIComponent(message)}`)
        let msg = ''
        if(!response.success){
            msg = response.message
        }else{
            msg = response.data
        }
        // 添加AI消息容器
        const aiMsg = {
          id: this.data.msgIdCounter++,
          type: 'assistant',
          content: this.parseMarkdown(msg)
        };
        
        this.setData({
          messages: [...this.data.messages, aiMsg],
          isAiTyping: false,
          toView: `msg-${aiMsg.id}`
        });
      } catch (error) {
        console.error('请求出错:', error);
        this.setData({
          messages: [...this.data.messages, {
            id: this.data.msgIdCounter++,
            type: 'assistant',
            content: '<p style="color: red">抱歉，处理您的请求时出错了</p>'
          }],
          isAiTyping: false
        });
      } finally {
        this.setData({ isAiTyping: false });
        this.scrollToBottom();
      }
    },
  
    // 输入框内容变化
    handleInput(e) {
      this.setData({
        inputText: e.detail.value
      });
    },
  
    // 滚动到底部
    scrollToBottom() {
      this.setData({
        toView: `msg-${this.data.messages[this.data.messages.length - 1].id}`
      });
    },
  
    // 简单的Markdown解析
    parseMarkdown(text) {
        if(!text || typeof text != 'string'){
            return text
        }
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
    },
  
    // 延迟函数
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  });
  