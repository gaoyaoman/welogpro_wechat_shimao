// pages/queryData/fileView.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
		url:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {
		let _this = this;
		console.log(options)
		_this.setData({
			url: options.url
		})
	}
})