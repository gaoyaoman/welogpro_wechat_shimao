let App = getApp();
let dateformat = require('../../utils/dateFormat.js');
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl:null,
    phoneNumber:null,
    todo:0,
    roles:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    let _this = this;
    if (!_this.data.avatarUrl) {
      if (wx.getStorageSync('avatarUrl')) {
        _this.setData({
          avatarUrl: wx.getStorageSync('avatarUrl')
        })
      }else{
        _this.setData({
          avatarUrl: wx.getStorageSync('avatarUrl')
        })
      }
    }
    else {
      if (!wx.getStorageSync('avatarUrl')) {
        _this.setData({
          avatarUrl: null
        })
      }
    }
    if (!_this.data.phoneNumber) {
      if (!!wx.getStorageSync('phoneNumber')) {
        _this.setData({
          phoneNumber: wx.getStorageSync('phoneNumber')
        })
      }
    } else {
      if (!wx.getStorageSync('phoneNumber')) {
        _this.setData({
          phoneNumber: null,
          todo:0
        })
      }
    }
    if (!!wx.getStorageSync('phoneNumber')) {
      await App.getRoles();
      await _this.getToDo();
    } 
  },

  /**
   * 分享按钮
   */
  onShareAppMessage: function () {
    return {
      title: '工程日志管理', // 转发后 所显示的title
      path: '/pages/index/index', // 相对的路径
      imageUrl: '../../image/logo.jpeg'
    }
  },

  /**
   * 下拉刷新页面
   */
  onPullDownRefresh: async function(){
    if(wx.getStorageSync('phoneNumber')){
      await App.getRoles();
      await this.getToDo();
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '数据已更新',
        icon: 'success',
        duration: 1000
      })
    }else{
      wx.stopPullDownRefresh();
    }
  },
  /**
   * 授权登录
   */
  authorLogin(e) {
    let _this = this;
    if (e.detail.errMsg !== 'getUserInfo:ok') {
      return false;
    }
    wx.showLoading({ title: "正在获取当前用户基本信息", mask: true });
    wx.getUserInfo({
      success: function (res) {
        _this.setData({
          userInfo: res.userInfo,
        })
        getApp().globalData.userInfo = res.userInfo;
      }
    })
    wx.hideLoading();
  },

  //获取权限
  getRight(e){
    let _this=this;
    if (!!_this.data.phoneNumber){
      return false;
    }
    wx.navigateTo({
      url: "../login/getRight"
    });
  },

  //设置头像
  setAvatar(){
    let _this=this;
    if(!wx.getStorageSync('phoneNumber')){
      return false;
    }
    if(wx.getStorageSync('avatarUrl')){
      return false;
    }
    wx.navigateTo({
      url: "../login/userInfo"
    });
  },

  //个人面板
  toUser(){
    wx.navigateTo({
      url: "../user/user"
    });
  },

  async getToDo(){
    let _this=this;
    await wx.request({
      url: App.globalData.api + 'welogTaskController/resId',
      data: {
        resId: wx.getStorageSync('phoneNumber'),
        taskDate: dateformat.format(new Date(), 'yyyy-MM-dd')
      },
      header: {
        'content-type': 'application/json'
      },
      success:function(res1) {
        if (res1.errMsg === "request:ok") {
          let todo = 0;
          if (res1.data !== 'no task') {
            for (let i = 0; i < res1.data.length; i++) {
              if (res1.data[i].length !== 0) {
                for (let j = 0; j < res1.data[i].length; j++) {
                  if (App.globalData.roles.includes('质量')) {
                    if (res1.data[i][j].qualityType !== '7') {
                      todo = todo + 1;
                    }
                  }
                  if (App.globalData.roles.includes('进度')) {
                    if (res1.data[i][j].shceduleType !== '7') {
                      todo = todo + 1;
                    }
                  }
                  if (App.globalData.roles.includes('安全')) {
                    if (res1.data[i][j].safeType !== '7') {
                      todo = todo + 1;
                    }
                  }
                }
              }
            }
          }
            _this.setData({
              roles:App.globalData.roles.split(','),
              todo:todo
            })
          
          
        } else {
          wx.showToast({
            title: '网络请求失败,请稍后再试',
            icon: 'none',
            duration: 3000
          })
        }
      }
    });
  },

  makePhoneCall(){
    wx.makePhoneCall({
      phoneNumber: '041162941448' 
    })
  }

})