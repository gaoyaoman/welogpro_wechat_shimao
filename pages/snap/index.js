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