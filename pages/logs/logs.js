// pages/logs/logs.js
let dateformat = require('../../utils/dateFormat.js');
let App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
		projectList:[],
		projectName:null,
		ifInLine:true,
		loading:false,
		disabled:true,
		pdfURL:'',
    start_date:null,
    end_date:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		let _this = this;
    let roles=wx.getStorageSync('roles');
    let url;
    if (roles.includes('经理')) {
      url = App.globalData.api + 'welogTaskController/getManagerTaskList'
    } else {
      url = App.globalData.api + 'welogTaskController/resId'
    }
		wx.request({
			url: url,
			data: {
				resId: wx.getStorageSync('phoneNumber'),
				taskDate: dateformat.format(new Date(), 'yyyy-MM-dd')
			},
			header: {
				'content-type': 'application/json'
			},
			success(res) {
				// console.log('res', res)
				if (res.errMsg === "request:ok") {
					if(res.data!=='no task'){
						let navbar = [];
						for (let i = 0; i < res.data.length; i++) {
							if (res.data[i].length !== 0) {
								for (let j = 0; j < res.data[i].length; j++) {
									if (navbar.indexOf(res.data[i][j].projectName) == -1) {
										navbar.unshift(res.data[i][j].projectName)
									}
								}
							}
						}
						_this.setData({
							projectList: navbar
						})
					}
					else{
						_this.setData({
							projectList: ['暂无可导出的项目']
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
//选择开始时间
  selectStartDate:function(e){
    this.setData({
      start_date:e.detail.value
    });
  },
//选择结束时间
  selectEndDate: function (e) {
    this.setData({
      end_date: e.detail.value
    });
  },
//选择项目名称
	selectProject: function (e) {
		let _this=this;
		if (_this.data.projectList[e.detail.value] !=='暂无可导出的项目'){
			_this.setData({
				projectName: _this.data.projectList[e.detail.value]
			});
		}else{
			return false;
		}
	},
//点击导出按钮
	searchLogs:function(){
		let _this=this;
    //表单验证
    if (!_this.data.start_date) {
      wx.showToast({
        title: '请先选择开始时间',
        icon: 'none',
        duration: 2000
      })
      return false;
    };
    if (!_this.data.end_date) {
      wx.showToast({
        title: '请先选择结束时间',
        icon: 'none',
        duration: 2000
      })
      return false;
    };
		if (!_this.data.projectName) {
			wx.showToast({
				title: '请先选择项目',
				icon: 'none',
				duration: 2000
			})
			return false;
		};
    
		_this.setData({
			loading:true
		})
		// _this.setData({
		// 	loading: false,
		// 	pdfURL:'https://wedeltadev.obs.myhwclouds.com/logRecord/20181016045735ProjectLog.pdf',
		// 	disabled:false
		// })		
		// wx.downloadFile({
		// 	url: 'https://wedeltadev.obs.myhwclouds.com/logRecord/20181016045735工程日志.pdf',
		// 	success: function (res1) {
		// 		_this.setData({
		// 			loading: false
		// 		})				
		// 		console.log(res1)
		// 		const filePath = res1.tempFilePath
		// 		setTimeout(() => wx.openDocument({
		// 			filePath: filePath,
		// 			fileType: 'pdf',
		// 			success: function (res2) {
		// 				console.log('success',res2)
		// 			},
		// 			fail:function(re){
		// 				console.log('fail',re)
		// 			}
		// 		}), 1000)
		// 	}
		// })
		wx.request({
			url: App.globalData.api + 'saveProjectController/getWorklogListExport',
			data: {
				phoneNumber:wx.getStorageSync('phoneNumber'),
				projectName:_this.data.projectName,
                startDate:_this.data.start_date,
                endDate:_this.data.end_date,
				position:wx.getStorageSync('roles')
			},
			header: {
				'content-type': 'application/json'
			},
			success(res) {
				if (!!res.data.url&&res.statusCode === 200) {
					_this.setData({
						disabled: false,
						pdfURL:res.data.url
					})
				} else {
					wx.showToast({
						title: '暂无日志可导出',
						icon: 'none',
						duration: 3000
					})
				}
			},
      fail:function(res){
        wx.showToast({
          title: '网络请求失败.',
          icon: 'none',
          duration: 3000
        })
      },
			complete:function(){
				_this.setData({
					loading: false
				})
			}
		});
	},
	viewLog:function(){
		let _this=this;
		wx.navigateTo({
			url: 'view?pdfURL='+_this.data.pdfURL,
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

  }
})