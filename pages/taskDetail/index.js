// pages/taskDetail/index.js

let App = getApp();
let dateformat = require('../../utils/dateFormat.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    roles:'',
    url:null, 
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

  //获取数据列表
  getData: function (date){
    let _this=this;
    let url;
    if (_this.data.roles.includes('经理')) {
      url = App.globalData.api + 'welogTaskController/getManagerTaskList'
    } else {
      url = App.globalData.api + 'welogTaskController/resId'
    }
    App.globalData.projectDay = false;
    wx.request({
      url: url,
      data: {
        resId: wx.getStorageSync('phoneNumber'),
        taskDate: dateformat.format(new Date(date), 'yyyy-MM-dd')
      },
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        if (res.errMsg === "request:ok") {
          if (res.data !== 'no task') {
            let navbar = [], dataList = [];
            let list1 = [];
            for (let i = 0; i < res.data.length; i++) {
              if (res.data[i].length !== 0) {
                for (let j = 0; j < res.data[i].length; j++) {
                  if (navbar.indexOf(res.data[i][j].projectName) == -1) {
                    navbar.unshift(res.data[i][j].projectName) //在res中提取projectName构建navbar
                  }
                  list1.push(res.data[i][j])
                }
              }
            }
            dataList = dataList.concat(list1);
            for (let i = 0; i < dataList.length; i++) {
              dataList[i].startDate = dateformat.format(new Date(dataList[i].startDate), 'yyyy/MM/dd');
              dataList[i].endDate = dateformat.format(new Date(dataList[i].endDate), 'yyyy/MM/dd');
            }
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this,
      quality = false,
      shcedule = false,
      safe = false;
    let roles = App.globalData.roles;
    if (roles.includes('质量')) quality = true;
    if (roles.includes('进度')) shcedule = true;
    if (roles.includes('安全')) safe = true;
    if(roles.includes('经理')){
      quality = !quality;
      shcedule = !shcedule;
      safe = !safe;
    }
    this.setData({
      quality,
      shcedule,
      safe,
      roles
    });
    let date = null;
    if (App.globalData.ifFromMonth && App.globalData.projectDay) {
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
    _this.getData(date);

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
    _this.getData(date);
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
		//获取填报信息
		if (e.target.dataset.btntype==="1") {
			wx.navigateTo({
				url: '../snap/editLogs?projectName=' + e.target.dataset.title.projectName + '&&taskText=' + e.target.dataset.title.taskText + '&&taskType=' + e.target.dataset.statustype + '&&projectCode=' + e.target.dataset.title.projectCode + '&&id=' + e.target.dataset.title.id + '&&status=' + e.target.dataset.status,
			})
		}
		else{
            //判断是否进入当前任务的需整改/未完成列表页面
            if (e.target.dataset.status==='4'){
                wx.navigateTo({
                    url: '../snap/rectifylists?taskText=' + e.target.dataset.title.taskText + '&&projectName=' + e.target.dataset.title.projectName + '&&id=' + e.target.dataset.title.id + '&taskType=' + e.target.dataset.statustype + '&status=' + e.target.dataset.status
                })
            }else{
                wx.navigateTo({
                    url: '../snap/editLogs?taskText=' + e.target.dataset.title.taskText + '&&projectName=' + e.target.dataset.title.projectName + '&&id=' + e.target.dataset.title.id + '&taskType=' + e.target.dataset.statustype + '&status=' + e.target.dataset.status
                })
            }
		}
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
      if (App.globalData.ifFromMonth && App.globalData.projectDay) {
        //从日历界面跳转来
        date = dateformat.format(new Date(App.globalData.projectDay), 'yyyy/MM/dd');
      } else {
        //从主页index跳转来
        date = dateformat.format(new Date(), 'yyyy/MM/dd');
      }
      this.setData({
        isToday: date,
        noProject: false
      })
      this.getData(date);
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

  })