let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    if (!!App.globalData.userInfo) {
      _this.setData({
        avatarUrl: App.globalData.userInfo.avatarUrl
      })
    }
  },

  /**
   * 授权成功 跳转回原页面
   */
  navigateBack: function () {
    wx.navigateBack();
  },
  //获取用户昵称、头像等基本信息
  bindGetUserInfo: function (e) {
    let _this = this;
    if (e.detail.errMsg === "getUserInfo:ok"){
      wx.request({
        url: getApp().globalData.api + 'wxuser/info',
        data: {
          sessionKey: wx.getStorageSync('sessionKey'),
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          signature: e.detail.signature,
          rawData: e.detail.rawData
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          wx.setStorageSync('avatarUrl', res.data.avatarUrl);
          wx.setStorageSync('nickName', res.data.nickName);
          _this.navigateBack();
        },
        fail: function () {
          wx.hideLoading();
        }
      })
    }
    else if (e.detail.errMsg === "getUserInfo:fail auth deny"){
      wx.showToast({
        title: '您未授权小程序，请先允许微信授权，再获取头像昵称等基本信息',
        icon:'none',
        duration:3000
      })
    }
  }
})