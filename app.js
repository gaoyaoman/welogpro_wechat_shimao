//app.js
App({
  // siteinfo:require('siteinfo.js'),
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    //更新版本
    // getApp().globalData.api=this.siteinfo.base_url;
    // console.log('this.siteinfo.base_url', this.siteinfo);
    let _this = this;
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      //console.log(res.hasUpdate)
    })
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
      wx.showModal({
        title: '更新提示',
        content: '新版本下载失败',
        showCancel: false
      })
    })
    // 执行微信登录
    //先判断本地是否有sessionKey,没有执行login,有checkSession,过期重新login，未过期则不重新login
    if (wx.getStorageSync('sessionKey')){
      wx.checkSession({
        success: function () {
          //session_key 未过期，并且在本生命周期一直有效
        },
        fail: function () {
          // session_key 已经失效，需要重新执行登录流程
          wx.login({
            success: res => {
              //发送 res.code 到后台换取 openId, sessionKey, unionId
						
              var errMsg = res.errMsg;
              if (errMsg != "login:ok") {
                me.showHint("错误提示", "出错了，请稍后再试试...")
              } else {
                var code = res.code; //（获取code代码）
                wx.request({
                  url: getApp().globalData.api + 'wxuser/login',
                  data: {
                    code: code
                  },
                  header: {
                    'content-type': 'application/json' // 默认值
                  },
                  success: function (res) {
                    wx.setStorageSync('openid', res.data.openid);
                    wx.setStorageSync('sessionKey', res.data.sessionKey);
                  }
                })
              }
            }
          })
        }
      })
    }else{
      _this.Login();
    }
  },
  Login:function(){
    wx.login({
      success: res => {
        //发送 res.code 到后台换取 openId, sessionKey, unionId
        var errMsg = res.errMsg;
        if (errMsg != "login:ok") {
          me.showHint("错误提示", "出错了，请稍后再试试...")
        } 
				else {
          var code = res.code; //（获取code代码）
					console.log(res)
          wx.request({
            url: getApp().globalData.api +'wxuser/login',
            data: {
              code: code
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
							console.log('code res',)
              wx.setStorageSync('openid', res.data.openid);
              wx.setStorageSync('sessionKey', res.data.sessionKey);
            }
          })
        }
      }
    })
  },
  globalData: {
		api:'https://wxss.welogpro.com/jeecg/rest/',
    userInfo: null,
    projectDay:null,
    ifFromMonth:false,
    ifBack:false
    
  }
})

