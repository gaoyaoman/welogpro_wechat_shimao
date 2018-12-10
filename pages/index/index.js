let App = getApp();
let dateformat = require('../../utils/dateFormat.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl:null,
    phoneNumber:null,
    todo:0,
		quality: false,
		shcedule: false,
		safe: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    if (!_this.data.avatarUrl){
      if (!!wx.getStorageSync('avatarUrl')) {
        _this.setData({
          avatarUrl: wx.getStorageSync('avatarUrl')
        })
      }
    }
    else{
      if (!wx.getStorageSync('avatarUrl')) {
        _this.setData({
          avatarUrl:null
        })
      }
    }
    if (!_this.data.phoneNumber){
      if (!!wx.getStorageSync('phoneNumber')) {
        _this.setData({
          phoneNumber: wx.getStorageSync('phoneNumber')
        })
      }
    }else{
      if (!wx.getStorageSync('phoneNumber')) {
        _this.setData({
          phoneNumber: null
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this;
    if (!_this.data.avatarUrl) {
      if (!!wx.getStorageSync('avatarUrl')) {
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
          phoneNumber: null
        })
      }
    }
    _this.getToDo();
  },
  /**
   * 授权登录
   */
  authorLogin: function (e) {
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
  getRight:function(e){
    let _this=this;
    if (!!_this.data.phoneNumber){
      return false;
    }
    wx.navigateTo({
      url: "../login/getRight"
    });
  },
  getToDo:function(){
    let _this=this;
    if (!!_this.data.phoneNumber) {
			wx.request({
				url: getApp().globalData.api + 'wxUserController/restListByPhone',
				data: {
					phoneNumber: wx.getStorageSync('phoneNumber')
				},
				header: {
					'content-type': 'application/json'
				},
				success(res) {
					if (res.errMsg === "request:ok") {
						let role = res.data.data[0].note;
						if (!role) {
							return true;
						}
            wx.setStorageSync('roles', role);
						//判断用户role字符串是否含有含有相应的子字符串
						if (role.includes('质量')) {
							_this.setData({
								quality: true
							})
						}
						if (role.includes('进度')) {
							_this.setData({
								shcedule: true
							})
						}
						if (role.includes('安全')) {
							_this.setData({
								safe: true
							})
						}
						wx.request({
							url: App.globalData.api + 'welogTaskController/resId',
							data: {
								resId: wx.getStorageSync('phoneNumber'),
								taskDate: dateformat.format(new Date(), 'yyyy-MM-dd')
							},
							header: {
								'content-type': 'application/json'
							},
							success(res1) {
								if (res1.errMsg === "request:ok") {
									let todo = 0;
									if(res1.data!=='no task'){
										for (let i = 0; i < res1.data.length; i++) {
											if (res1.data[i].length !== 0) {
												for (let j = 0; j < res1.data[i].length; j++) {
													if (_this.data.quality) {
                            if (res1.data[i][j].qualityType!=='7') {
															todo = todo + 1;
														}
													}
													if (_this.data.shcedule) {
														if (res1.data[i][j].shceduleType !== '7') {
															todo = todo + 1;
														}
													}
													if (_this.data.safe) {
														if (res1.data[i][j].safeType !== '7') {
															todo = todo + 1;
														}
													}
												}
											}
										}
									}
									_this.setData({
										todo: todo
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
					} else {
						wx.showToast({
							title: '网络请求失败,请稍后再试',
							icon: 'none',
							duration: 3000
						})
					}
				}
			});
    }
  },
  onShareAppMessage: function () {
    return {
      title: '工程日志管理', // 转发后 所显示的title
      path: '/pages/index/index', // 相对的路径
      imageUrl:'../../image/logo.jpeg'
    }
  },

})