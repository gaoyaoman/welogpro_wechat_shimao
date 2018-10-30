// pages/taskDetail/index.js

let App = getApp();
let dateformat = require('../../utils/dateFormat.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    navbar: [],       //
    currentTab:"",    //
    dataList:[],      //
    List:[],          //
    isToday:'',       //
    noProject:false,  //
    quality:false,
    shcedule:false,
    safe:false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let date=null;
    let _this=this;
    if(App.globalData.ifFromMonth){
      //从日历界面跳转来
      date = dateformat.format(new Date(App.globalData.projectDay), 'yyyy/MM/dd');
    }else{
      //从主页index跳转来
      date = dateformat.format(new Date(), 'yyyy/MM/dd'); 
    }
    _this.setData({
      isToday: date,
      noProject: false
    })
    App.globalData.projectDay=false;
    wx.request({
      url: App.globalData.api + 'welogTaskController/resId',
      data: {
        resId: wx.getStorageSync('phoneNumber'),
        taskDate: dateformat.format(new Date(date), 'yyyy-MM-dd')
      },
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        // console.log('res', res)
        if (res.errMsg === "request:ok") {
					if (res.data !=='no task'){
						let navbar = [], dataList = [];
						let list1 = [], list2 = [], list3 = [];
						for (let i = 0; i < res.data.length; i++) {
							if (res.data[i].length !== 0) {
								for (let j = 0; j < res.data[i].length; j++) {
									if (navbar.indexOf(res.data[i][j].projectName) == -1) {
										navbar.unshift(res.data[i][j].projectName) //在res中提取projectName构建navbar
									}
									if (!res.data[i][j].type || res.data[i][j].type === '1') {
										list2.push(res.data[i][j])
									} else if (res.data[i][j].type === '3') {
										list3.push(res.data[i][j])
									} else {
										list1.push(res.data[i][j])
									}
								}
							}
						}
						dataList = dataList.concat(list1);//整改
						dataList = dataList.concat(list2);//填报
						dataList = dataList.concat(list3);//完成
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
					}else{
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
    //获取用户角色：安全、质量和进度
    wx.request({
      url: App.globalData.api + 'wxUserController/restListByPhone',
      data: {
        phoneNumber:wx.getStorageSync('phoneNumber')
      },
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        if (res.errMsg === "request:ok") {
          let role=res.data.data[0].note;
          if(role===null){
            _this.setData({
              quality: false,
							shcedule: false,
							safe: false
            })
            return true;
          }
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
        	console.log(_this.data.quality,_this.data.shcedule,_this.data.safe);
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
  // 切换前一天或者后一天
  changeDay(e){
    let _this = this;
    //data-f 传参存储日期切换操作的值：前一天/后一天
    let f = e.currentTarget.dataset.f === "pre"?true:false; 
    //转换日期切换得到的日期结果格式 yyyy/MM/dd => yyyy-MM-dd
    let date = f ? dateformat.format(new Date(new Date(_this.data.isToday).getTime() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd') : dateformat.format(new Date(new Date(_this.data.isToday).getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    _this.setData({
      isToday: dateformat.format(new Date(date),'yyyy/MM/dd'),
      noProject: false  //在切换日期时，清空当日无任务提示
    })
    wx.request({
      url: App.globalData.api + 'welogTaskController/resId',
      data: {
        resId: wx.getStorageSync('phoneNumber'),
        taskDate: dateformat.format(new Date(date), 'yyyy-MM-dd')
      },
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        if (res.errMsg === "request:ok") {
					if(res.data!=='no task'){
						let navbar = [], dataList = [];
						let list1 = [], list2 = [], list3 = [];
						for (let i = 0; i < res.data.length; i++) {
							if (res.data[i].length !== 0) {
								for (let j = 0; j < res.data[i].length; j++) {
									if (navbar.indexOf(res.data[i][j].projectName) == -1) {
										navbar.unshift(res.data[i][j].projectName) //在res中提取projectName构建navbar
									}
									if (!res.data[i][j].type || res.data[i][j].type === '1') {
										list2.push(res.data[i][j])
									} else if (res.data[i][j].type === '3') {
										list3.push(res.data[i][j])
									} else {
										list1.push(res.data[i][j])
									}
								}
							}
						}
						dataList = dataList.concat(list1);
						dataList = dataList.concat(list2);
						dataList = dataList.concat(list3);
						for (let i = 0; i < dataList.length; i++) {
							dataList[i].startDate = dateformat.format(new Date(dataList[i].startDate), 'yyyy/MM/dd');
							dataList[i].endDate = dateformat.format(new Date(dataList[i].endDate), 'yyyy/MM/dd');
						}
						// console.log('navbar', navbar);//navbar
						// console.log('dataList', dataList)//navbar的数据项
						//用来判断当天是否无任务
						if (navbar.length === 0) {
							_this.setData({
								navbar: [],
								dataList: [],
								currentTab: '',
								noProject: true
							})
						} else {
							_this.setData({
								navbar: navbar,
								currentTab: navbar[0],
								dataList: dataList
							})
						}
					}else{
						_this.setData({
							navbar: [],
							dataList: [],
							currentTab: '',
							noProject: true
						})
					}
          
        } else { //处理response异常
          wx.showToast({
            title: '网络请求失败,请稍后再试',
            icon: 'none',
            duration: 3000
          })
        }
      }
    });
  },
  //
  returnDate(){
    //content
  },
  //转换tab标签
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
// 填写详细信息
  toWrite(e){
    // console.log(e)
    wx.navigateTo({
			url: '../snap/editLogs?tastText=' + e.target.dataset.title.taskText + '&&projectName=' + e.target.dataset.title.projectName + '&&id=' + e.target.dataset.title.id + '&taskType=' + e.target.dataset.statustype + '&status=' + e.target.dataset.status,
    })
  },
  /**
    * 生命周期函数--监听页面初次渲染完成
    */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(App.globalData.ifBack){
      let date = null;
      let _this = this;
      if (App.globalData.ifFromMonth) {
        //从日历界面跳转来
        date = dateformat.format(new Date(App.globalData.projectDay), 'yyyy/MM/dd');
      } else {
        //从主页index跳转来
        date = dateformat.format(new Date(), 'yyyy/MM/dd');
      }
      _this.setData({
        isToday: date,
        noProject: false
      })
      App.globalData.projectDay = false;
      wx.request({
        url: App.globalData.api + 'welogTaskController/resId',
        data: {
          resId: wx.getStorageSync('phoneNumber'),
          taskDate: dateformat.format(new Date(date), 'yyyy-MM-dd')
        },
        header: {
          'content-type': 'application/json'
        },
        success(res) {
          if (res.errMsg === "request:ok") {
						if(res.data!=='no task'){
							let navbar = [], dataList = [];
							let list1 = [], list2 = [], list3 = [];
							for (let i = 0; i < res.data.length; i++) {
								if (res.data[i].length !== 0) {
									for (let j = 0; j < res.data[i].length; j++) {
										if (navbar.indexOf(res.data[i][j].projectName) == -1) {
											navbar.unshift(res.data[i][j].projectName) //在res中提取projectName构建navbar
										}
										if (!res.data[i][j].type || res.data[i][j].type === '1') {
											list2.push(res.data[i][j])
										} else if (res.data[i][j].type === '3') {
											list3.push(res.data[i][j])
										} else {
											list1.push(res.data[i][j])
										}
									}
								}
							}
							dataList = dataList.concat(list1);
							dataList = dataList.concat(list2);
							dataList = dataList.concat(list3);
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
						}else{
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
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    App.globalData.ifBack = true;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    App.globalData.ifBack = false;
    App.globalData.ifFromMonth=false;
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {}
})