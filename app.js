//app.js
import regeneratorRuntime from 'utils/regenerator-runtime/runtime.js';
let dateformat = require('/utils/dateFormat.js');

App({
  globalData: {
    api: 'https://wxss.welogpro.com/jeecg/rest/',    
    userInfo: null,
    projectDay: null,
    ifFromMonth: false,
    ifBack: false,
    navbar: [],       //
    currentTab:"",    //
    dataList:[],      //
    noProject:false,
    roles:''
  },
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    //更新版本
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
        fail:async function () {
          // session_key 已经失效，需要重新执行登录流程
          await _this.login();
        }
      })
    }else{
      _this.login();
    }
  },
  async login(){
    await wx.login({
      success: res => {
        //发送 res.code 到后台换取 openId, sessionKey, unionId
        var errMsg = res.errMsg;
        if (errMsg != "login:ok") {
          me.showHint("错误提示", "出错了，请稍后再试试...")
        } 
				else {
          var code = res.code; //（获取code代码）
          wx.request({
            url: getApp().globalData.api +'wxuser/login',
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
  },

  /*
    全局方法
  */
  //获取角色身份:质量、进度、安全、经理
  async getRoles(){
    let _this=this;
    await wx.request({
      url: _this.globalData.api + 'wxUserController/restListByPhone',
      data: {
        phoneNumber: wx.getStorageSync('phoneNumber')
      },
      header: {
        'content-type': 'application/json'
      },
      success: async function(res) {
        if (res.errMsg === "request:ok") {
          let role = res.data.data[0].note;
          if (!role) {
            return;
          } else {
            _this.globalData.roles=role;
            _this.getTasklist();
          }
        } else {
          wx.showToast({
            title: '获取身份角色失败,请稍后再试',
            icon: 'none',
            duration: 3000
          })
        }
      }
    });
  },

  //获取任务列表
  async getTasklist(){
    let _this = this,
        url='',
        roles = _this.globalData.roles;
    if (roles.includes('经理')) {
      url = _this.globalData.api + 'welogTaskController/getManagerTaskList'
    } else {
      url = _this.globalData.api + 'welogTaskController/resId'
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
              _this.globalData.navbar=[];
              _this.globalData.currentTab='';
              _this.globalData.noProject=true;
              _this.globalData.dataList=[];
            } else {
              _this.globalData.navbar=navbar;
              _this.globalData.currentTab=navbar[0];
              _this.globalData.noProject=false;
              _this.globalData.dataList=dataList;
            }
          } else {
            _this.globalData.navbar=[];
            _this.globalData.currentTab='';
            _this.globalData.noProject=true;
            _this.globalData.dataList=[];
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
  }




})

