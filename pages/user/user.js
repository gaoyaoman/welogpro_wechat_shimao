// pages/user/user.js
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';
let dateformat = require('../../utils/dateFormat.js');
let App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbar: [],       //
    currentTab:"",    //
    dataList:[],      //
    List:[],          //
    noProject:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {   
    await this.getProjectData();
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

async getProjectData(){
  let _this = this,
        url='',
        roles = App.globalData.roles;
    if (roles.includes('经理')) {
      url = App.globalData.api + 'welogTaskController/getManagerTaskList'
    } else {
      url = App.globalData.api + 'welogTaskController/resId'
    }
    await wx.request({
      url: url,
      data: {
        resId: wx.getStorageSync('phoneNumber'),
      },
      header: {
        'content-type': 'application/json'
      },
      success:function(res) {
        if (res.errMsg === "request:ok") {
          if (res.data !== 'no task') {
            let navbar = [], dataList = [];
            for (let i = 0; i < res.data.length; i++) {
              if (res.data[i].length !== 0) {
                for (let j = 0; j < res.data[i].length; j++) {
                  if (navbar.indexOf(res.data[i][j].projectName) == -1) {
                    navbar.unshift(res.data[i][j].projectName) //在res中提取projectName构建navbar
                  }
                  dataList.push(res.data[i][j])
                }
              }
            }
            for (let i = 0; i < dataList.length; i++) {
              dataList[i].startDate = dateformat.format(new Date(dataList[i].startDate), 'yyyy/MM/dd');
              dataList[i].endDate = dateformat.format(new Date(dataList[i].endDate), 'yyyy/MM/dd');
            }
            if (navbar.length === 0) {
              _this.setData({
                navbar:[],
                currentTab:'',
                noProject:true,
                dataList:[]
              });
            } else {
              _this.setData({
                navbar:navbar,
                currentTab:navbar[0],
                noProject:false,
                dataList:dataList
              });
            }
          } else {
            _this.setData({
              navbar:[],
              currentTab:'',
              noProject:true,
              dataList:[]
            });
          }
        } else {
          wx.showToast({
            title: '获取个人任务列表失败,请稍后再试',
            icon: 'none',
            duration: 3000
          })
        }
      }
    });
},

  navbarTap: function (e) {
    this.setData({
      currentTab: e.currentTarget.dataset.title,
    })
    for (let i = 0; i < this.data.dataList.length; i++) {
      if (this.data.dataList[i].projectName == this.data.currentTab) {
        this.setData({
          noProject: false
        })
        return true;
      } else {
        this.setData({
          noProject: true
        })
      }
    }
  },
  //自定义方法：
  //注销登陆
  async logout(){
    wx.clearStorageSync()
    await App.login();
    wx.navigateBack();
  }
})