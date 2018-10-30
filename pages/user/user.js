// pages/user/user.js
let App=getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phoneNumber:null,
    avatarUrl:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this=this;
    if(!!wx.getStorageSync('phoneNumber')){
      _this.setData({
        phoneNumber: wx.getStorageSync('phoneNumber')
      })
    }
    if (!!wx.getStorageSync('avatarUrl')) {
      _this.setData({
        avatarUrl: wx.getStorageSync('avatarUrl')
      })
    } 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this=this;
    if (!!wx.getStorageSync('avatarUrl')) {
      _this.setData({
        avatarUrl: wx.getStorageSync('avatarUrl')
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  //自定义方法：
  //注销登陆
  logout:function(){
    wx.removeStorageSync('openid');
    wx.removeStorageSync('sessionKey');
    wx.removeStorageSync('phoneNumber');
    wx.removeStorageSync('avatarUrl');
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
    wx.navigateBack();
  }
})