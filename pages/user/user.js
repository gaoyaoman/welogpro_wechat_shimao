// pages/user/user.js
let dateformat = require('../../utils/dateFormat.js');
let App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roles:[],
    navbar: [],       //
    currentTab:"",    //
    dataList:[],      //
    List:[],          //
    noProject:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this=this;
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
    let date = dateformat.format(new Date(), 'yyyy/MM/dd');;
    let _this = this;
    //获取用户角色
    wx.request({
      url: App.globalData.api + 'wxUserController/restListByPhone',
      data: {
        phoneNumber: wx.getStorageSync('phoneNumber')
      },
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        if (res.errMsg === "request:ok") {
          let role = res.data.data[0].note.split(',');
          _this.setData({
            roles: role
          })
          console.log('role',role)
        } else {
          wx.showToast({
            title: '网络请求失败,请稍后再试',
            icon: 'none',
            duration: 3000
          })
        }
      }
    });
    wx.request({
      url: App.globalData.api + 'welogTaskController/resId',
      data: {
        resId: wx.getStorageSync('phoneNumber'),
      },
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        // console.log('res', res)
        if (res.errMsg === "request:ok") {
          if (res.data !== 'no task') {
            let navbar = [], dataList = [];
            let list=[]
            for (let i = 0; i < res.data.length; i++) {
              if (res.data[i].length !== 0) {
                for (let j = 0; j < res.data[i].length; j++) {
                  if (navbar.indexOf(res.data[i][j].projectName) == -1) {
                    navbar.unshift(res.data[i][j].projectName) //在res中提取projectName构建navbar
                  }
                  list.push(res.data[i][j])
                
                }
              }
            }
            dataList = dataList.concat(list);
            for (let i = 0; i < dataList.length; i++) {
              dataList[i].startDate = dateformat.format(new Date(dataList[i].startDate), 'yyyy/MM/dd');
              dataList[i].endDate = dateformat.format(new Date(dataList[i].endDate), 'yyyy/MM/dd');
            }
            //console.log('navbar', navbar);//navbar
            //console.log('dataList', dataList)//navbar的数据项
            if (navbar.length === 0) {
              _this.setData({
                navbar: [],
                currentTab: '',
                dataList: [],
                noProject: true
              })
            } else {
              _this.setData({
                navbar: navbar,
                currentTab: navbar[0],
                dataList: dataList
              })
            }
          } else {
            _this.setData({
              navbar: [],
              currentTab: '',
              dataList: [],
              noProject: true
            })
          }
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
    wx.removeStorageSync('nickName');
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