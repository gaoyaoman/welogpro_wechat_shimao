let App = getApp();
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this= this;
    if(App.globalData.userInfo){
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
  //获取手机号码
  getPhoneNumber: function (e) {
    let _this= this;
    if (e.detail.errMsg === 'getPhoneNumber:ok'){
      wx.request({
        url: App.globalData.api +'wxuser/phone',
        data:{
          encryptedData: e.detail.encryptedData,
          iv:e.detail.iv,
          sessionKey: wx.getStorageSync('sessionKey')
        },
        success: async function(res){
          if (res.errMsg === "request:ok"){
            wx.setStorageSync('phoneNumber', res.data.purePhoneNumber);
            _this.navigateBack();
          }else{
            wx.showToast({
              title: '网络请求失败',
              icon:'none'
            })
          }
        },
        fail:function(res){
          wx.showToast({
            title: '网络请求失败',
            icon: 'none'
          })
        }
      })
    } else if (e.detail.errMsg==="getPhoneNumber:fail user deny"){
      wx.showToast({
        title: '您未授权小程序，请先允许微信授权，再申请。',
        icon: 'none',
        duration: 3000
      })
    }
  }
})