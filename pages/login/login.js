import Http from "../../utils/http.js"
Page({
    data: {
        // 应用配置
        sysName: getApp().globalData.sysName,
        copyRight: '© wx 小程序设计',
        // 登录表单数据
        username: '',
        password: '',
        usertype: '',
        usertypeLabel: '',
        captcha: '',
        codeImg: '',
        captchaKey: '',
        loginLoading: false,

        // 注册表单数据
        showRegister: false,
        regUsername: '',
        regPassword: '',
        regPassword2: '',
        regUsertype: '',
        regUsertypeLabel: '',
        registerLoading: false,

        // 角色选择器
        showRolePicker: false,
        showRegRolePicker: false,
        roleColumns: getApp().globalData.sysRole
    },

    onLoad() {
        // 初始化角色默认值
        const lastRole = this.data.roleColumns[this.data.roleColumns.length - 1];
        this.setData({
            usertype: lastRole.value,
            usertypeLabel: lastRole.text,
            regUsertype: lastRole.value,
            regUsertypeLabel: lastRole.text
        });

        // 获取验证码
        this.getCode();
    },

    // 获取验证码
    async getCode() {
        try {
            const res = await Http.get("/captcha", {}, {
                isLoading: false
            })
            if (res.data && res.data.captcha) {
                this.setData({
                    captchaKey: res.data.captchaKey,
                    codeImg: 'data:image/png;base64,' + res.data.captcha
                });
            } else {
                wx.showToast({
                    title: '验证码获取失败',
                    icon: 'none'
                });
            }
        } catch (error) {
            wx.showToast({
                title: '网络错误',
                icon: 'none'
            });
        }
    },

    // 登录
    async login() {
        if (!this.validateLoginForm()) return;

        this.setData({
            loginLoading: true
        });

        try {
            const res = await Http.get('/login', {
                username: this.data.username,
                password: this.data.password,
                usertype: this.data.usertype,
                captcha: this.data.captcha,
                captchaKey: this.data.captchaKey
            });
            if (res.code === 200) {
                // 保存用户信息和token
                wx.setStorageSync('user', res.data.user);
                wx.setStorageSync('token', res.data.token);
                wx.showToast({
                    title: '登录成功',
                    icon: 'success',
                    duration: 1000
                });
                setTimeout(function () {
                    //获取登录之前访问的页面，继续访问此页
                    let loginUrl = wx.getStorageSync('loginUrl')
                    if (loginUrl) {
                        wx.redirectTo({
                            url: "/"+loginUrl,
                        })
                    } else {
                        wx.reLaunch({
                            url: '/pages/personal/personal'
                        });
                    }
                }, 800)
            } else {
                this.setData({
                    captcha: ''
                })
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 1000
                });
                this.getCode();
            }
        } finally {
            this.setData({
                loginLoading: false
            });
        }
    },

    // 注册
    async register() {
        if (!this.validateRegisterForm()) return;

        this.setData({
            registerLoading: true
        });

        try {
            const res = await Http.post('/register', {
                username: this.data.regUsername,
                password: this.data.regPassword,
                usertype: this.data.regUsertype
            });

            if (res.code === 200) {
                wx.showToast({
                    title: '注册成功',
                    icon: 'success'
                });

                // 关闭注册弹窗，重置表单
                this.setData({
                    showRegister: false,
                    regUsername: '',
                    regPassword: '',
                    regPassword2: ''
                });

                // 刷新验证码
                this.getCode();
            } else {
                wx.showToast({
                    title: res.message || '注册失败',
                    icon: 'none'
                });
            }
        } catch (error) {
            wx.showToast({
                title: '网络错误',
                icon: 'none'
            });
        } finally {
            this.setData({
                registerLoading: false
            });
        }
    },

    // 表单验证
    validateLoginForm() {
        if (!this.data.username) {
            wx.showToast({
                title: '请输入用户名',
                icon: 'none'
            });
            return false;
        }

        if (!this.data.password) {
            wx.showToast({
                title: '请输入密码',
                icon: 'none'
            });
            return false;
        }

        if (!this.data.captcha) {
            wx.showToast({
                title: '请输入验证码',
                icon: 'none'
            });
            return false;
        }

        return true;
    },

    validateRegisterForm() {
        if (!this.data.regUsername) {
            wx.showToast({
                title: '请输入用户名',
                icon: 'none'
            });
            return false;
        }

        if (!this.data.regPassword) {
            wx.showToast({
                title: '请输入密码',
                icon: 'none'
            });
            return false;
        }

        if (this.data.regPassword !== this.data.regPassword2) {
            wx.showToast({
                title: '两次密码不一致',
                icon: 'none'
            });
            return false;
        }

        return true;
    },

    // 输入框事件处理
    onUsernameChange(e) {
        this.setData({
            username: e.detail
        });
    },

    onPasswordChange(e) {
        this.setData({
            password: e.detail
        });
    },

    onCaptchaChange(e) {
        this.setData({
            captcha: e.detail
        });
    },

    onRegUsernameChange(e) {
        this.setData({
            regUsername: e.detail
        });
    },

    onRegPasswordChange(e) {
        this.setData({
            regPassword: e.detail
        });
    },

    onRegPassword2Change(e) {
        this.setData({
            regPassword2: e.detail
        });
    },

    // 角色选择
    onRoleConfirm(e) {
        const {
            value,
            text
        } = e.detail.value;
        this.setData({
            usertype: value,
            usertypeLabel: text,
            showRolePicker: false
        });
    },

    onRegRoleConfirm(e) {
        const {
            value,
            text
        } = e.detail.value;
        this.setData({
            regUsertype: value,
            regUsertypeLabel: text,
            showRegRolePicker: false
        });
    },


    showRegister(e) {
        this.setData({
            showRegister: true
        })
    },
    hideRegister(e) {
        this.setData({
            showRegister: false
        })
    },
    showRegRolePicker() {
        this.setData({
            showRegRolePicker: true
        })
    },
    hideRegRolePicker() {
        this.setData({
            showRegRolePicker: false
        })
    },
    showRolePicker() {
        this.setData({
            showRolePicker: true
        })
    },
    hideRolePicker() {
        this.setData({
            showRolePicker: false
        })
    },

    goBack() {
        wx.navigateBack()
    }
});