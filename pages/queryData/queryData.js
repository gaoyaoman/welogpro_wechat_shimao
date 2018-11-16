// pages/queryData/queryData.js
let App=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
		scrollTop: 0,
		fileList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		let _this = this;
		wx.request({
			url: App.globalData.api + 'saveProjectController/checkMaterial',
			data: {
				name:''
			},
			header: {
				'content-type': 'application/json'
			},
			success(res) {
				if (res.errMsg === "request:ok") {
					_this.setData({
						fileList:res.data.success
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

	onChange(event) {
		console.log(event.detail, 'click right menu callback data')
	},
	//页面滚动执行方式
	onPageScroll(event) {
		let _this = this;
		_this.setData({
			scrollTop: event.scrollTop
		})
	},
	toView:function(e){
		wx.request({
			url: App.globalData.api + 'saveProjectController/checkMaterial',
			data: {
				name: e.currentTarget.dataset.index
			},
			header: {
				'content-type': 'application/json'
			},
			success(res) {
				if (res.errMsg === "request:ok") {
					wx.navigateTo({
						url: 'fileView?url=' + res.data.success,
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
	}
})