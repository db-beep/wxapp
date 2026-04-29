Component({
    properties: {
      // 当前值（时间戳或日期字符串）
      value: {
        type: null,
        value: '',
        observer: function(newVal) {
          this.updateDisplayValue(newVal);
        }
      },
      // 选择器类型：date 或 datetime
      type: {
        type: String,
        value: 'date'
      },
      // 占位文本
      placeholder: {
        type: String,
        value: '请选择日期'
      },
      // 标题
      title: {
        type: String,
        value: '选择日期'
      },
      // 最小日期（时间戳）
      minDate: {
        type: Number,
        value: new Date(1990, 0, 1).getTime()
      },
      // 最大日期（时间戳）
      maxDate: {
        type: Number,
        value: new Date(2050, 11, 31).getTime()
      },
      // 是否禁用
      disabled: {
        type: Boolean,
        value: false
      },
      // 是否必填
      required: {
        type: Boolean,
        value: false
      }
    },
  
    data: {
      showPicker: false,
      displayValue: '',
      currentValue: Date.now()
    },
  
    lifetimes: {
      attached() {
        // 初始化当前值
        this.updateDisplayValue(this.data.value);
        this.setData({
          currentValue: this.data.value ? this.parseToTimestamp(this.data.value) : Date.now()
        });
      }
    },
  
    methods: {
      // 显示选择器
      showPicker() {
        if (this.data.disabled) return;
        this.setData({
          showPicker: true,
          currentValue: this.data.value ? this.parseToTimestamp(this.data.value) : Date.now()
        });
      },
  
      // 确认选择
      onConfirm(e) {
        const timestamp = e.detail;
        const formattedValue = this.formatDate(timestamp);
        
        this.setData({
          showPicker: false,
          displayValue: formattedValue
        });
        
        // 触发 change 事件，返回格式化后的日期字符串
        this.triggerEvent('change', { value: formattedValue, timestamp });
      },
  
      // 取消选择
      onCancel() {
        this.setData({
          showPicker: false,
          displayValue:''
        });
        this.triggerEvent('change', { value: '' });
      },
  
      // 更新显示值
      updateDisplayValue(value) {
        if (!value) {
          this.setData({ displayValue: '' });
          return;
        }
        const formattedValue = this.formatDate(this.parseToTimestamp(value));
        this.setData({ displayValue: formattedValue });
      },
  
      // 将各种日期格式转换为时间戳
      parseToTimestamp(value) {
        if (typeof value === 'number') {
          return value;
        }
        
        if (typeof value === 'string') {
          // 处理 YYYY-MM-DD 或 YYYY-MM-DD HH:mm 格式
          if (value.includes(' ')) {
            return new Date(value.replace(/-/g, '/')).getTime();
          }
          return new Date(value.replace(/-/g, '/')).getTime();
        }
        
        return Date.now();
      },
  
      // 格式化日期
      formatDate(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        if (this.data.type === 'datetime') {
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${year}-${month}-${day} ${hours}:${minutes}:00`;
        }
        
        return `${year}-${month}-${day}`;
      }
    }
  });
  