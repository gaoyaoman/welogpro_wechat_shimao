// pages/test/test.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getSetting({
      success: (res) => {
        console.log(res.authSetting['scope.camera']);
        if (res.authSetting['scope.camera']===false){
          wx.showModal({
            title: '权限设置',
            content: '请在个人信息-小程序设置-授权设置中，开启摄像头使用权限',
            showCancel:false,
            success:function(e){
              console.log(e);
              if(e.confirm){
                wx.navigateTo({
                  url: '../index/index',
                })
              }
            }
          })
        }
      },
      fail:function(res){
        console.log('fail',res)
      }
    })
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
  takePhoto: function () {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
			quality: 'low',
      success: (res) => {
        wx.navigateTo({
          url: 'editLogs?src='+res.tempImagePath
        })
      }
    })
  }

}) 