let App = getApp();
var util = require('../../utils/util.js');
// let projectDay = projectDay

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShowDetail:[],
    projectList:[],
    currentMonth: 1,
    modalFlag:false,
    year: 0,
    time:null,   //存放时间戳
    month: 0,
    date: ['日', '一', '二', '三', '四', '五', '六'],
    yearList:[],  //存放年份
    nowYearIndex:0, //存放当前年的索引
    dateArr: [],
    isToday: 0,
    flag:false,
    isTodayWeek: false,
    todayIndex: 0,
    changeYearFlag:false,
    startIndex:0, //存放开始时间的index
    endProjectMonth:1,
    startProjectMonth:1,
    startProjectDay:1,
    day:0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getProject()
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    this.setData({
      currentMonth: new Date().getMonth() + 1,
      year: year,
      month: month,
      isToday: '' + year + '/' + (month < 10 ? ("0" + month) : month) + '/' + now.getDate()
    })
  },
  getProject(){
    let _this = this
    wx.request({
      url: App.globalData.api+'welogTaskController/resId',
      data: {
        resId: wx.getStorageSync('phoneNumber')
      },
      success: function (res) {
        if (res.errMsg === "request:ok"){
          _this.setData({
            projectList: res.data
          })
          console.log('list', res.data);
        }else{
          if (res ==="no resId"){
            wx.showToast({
              title: '请先登陆获取权限',
              icon:'failed'
            })
          }
        }
        _this.dateInit();
       
      },
      fail:function(res){

      }
    })
   
  },

  dateInit: function (setYear, setMonth) {

    //全部时间的月份都是按0~11基准，显示月份才+1
    let dateArrTemp = [];                        //需要遍历的日历数组数据
    let arrLen = 0;                            //dateArr的数组长度
    let now = setYear ? new Date(setYear, setMonth) : new Date();
    let year = setYear || now.getFullYear();
    let nextYear = 0;
    let month = setMonth || now.getMonth();                    //没有+1方便后面计算当月总天数
    let nextMonth = (month + 1) > 11 ? 1 : (month + 1);
    let startWeek = new Date(year + '/' + (month + 1) + '/' + 1).getDay();         //目标月1号对应的星期
    let dayNums = new Date(year, nextMonth, 0).getDate();                //获取目标月有多少天
    let obj = {};
    let num = 0;
    let temp = []                         //构造下方的项目期限

    if (month + 1 > 11) {
      nextYear = year + 1;
      dayNums = new Date(nextYear, nextMonth, 0).getDate();
    }
    for (let i = 0; i < this.data.projectList.length; i++) {
      for (let j = 0; j < this.data.projectList[i].length;j++){
        temp.push({
          taskId: this.data.projectList[i][j].taskId,
          taskText: this.data.projectList[i][j].taskText,
          projectName: this.data.projectList[i][j].projectName,
          startDate: new Date(this.data.projectList[i][j].startDate).valueOf(),
          endDate: new Date(this.data.projectList[i][j].endDate).valueOf(),
          peojectFlag: false   //项目的显示与否
        })
     }
    }
    arrLen = startWeek + dayNums;
    for (let i = 0; i < arrLen; i++) {
      if (i >= startWeek) {
        num = i - startWeek + 1;
        obj = {
          isToday: '' + year + '/' +(month < 9 ? "0" + (month + 1) : month + 1) + '/' +(num < 10 ? "0" + num : num),
          dateNum: num,
          project:JSON.parse(JSON.stringify(temp)),
          flag: false            // 项目期限的显示与否
        }
      } else {
        obj = {
          isToday:'',
          dateNum:'',
        };
      }
      dateArrTemp[i] = obj
      if (dateArrTemp[i].project ){
        for (let k = 0; k < dateArrTemp[i].project.length; k++) {
          if ((new Date(dateArrTemp[i].isToday).valueOf() >= new Date(dateArrTemp[i].project[k].startDate).valueOf()) && (new Date(dateArrTemp[i].project[k].endDate).valueOf() >= new Date(dateArrTemp[i].isToday).valueOf())) {
            dateArrTemp[i].flag = true
            dateArrTemp[i].project[k].peojectFlag = true
            } 
            else {
            dateArrTemp[i].project[k].peojectFlag = false
            }
          }
        }
    }
  
    this.setData({
      dateArr: dateArrTemp,
    })

    let nowDate = new Date();
    let nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth() + 1;
    let nowWeek = nowDate.getDay();
    let getYear = setYear || nowYear;
    let getMonth = setMonth >= 0 ? (setMonth + 1) : nowMonth;

    if (nowYear == getYear && nowMonth == getMonth) {
      this.setData({
        isTodayWeek: true,
        todayIndex: nowWeek
      })
    } else {
      this.setData({
        isTodayWeek: false,
        todayIndex: -1
      })
    }
  },

  lastMonth: function () {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month - 2 < 0 ? this.data.year - 1 : this.data.year;
    let month = this.data.month - 2 < 0 ? 11 : this.data.month - 2;
    this.setData({
      year: year,
      month: (month + 1)
    })
    this.dateInit(year, month);
  },
  nextMonth: function () {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month > 11 ? this.data.year + 1 : this.data.year;
    let month = this.data.month > 11 ? 0 : this.data.month;
    this.setData({
      year: year,
      month: (month + 1)
    })
    this.dateInit(year, month);
  },

  // 转换年份
  changeYear(){
    this.setData({
      changeYearFlag: !this.data.changeYearFlag,
    })
    let nowYear = this.data.year + 5  //获取当前年后的第五年
    let temp = []
    // 年份
    for (var y = 1; y < 10; y++) {
      temp.unshift(nowYear - y)
    }
    this.setData({
      yearList: temp,
      nowYearIndex:4
    })
   
  },

  clickYear(e){
    this.dateInit(e.target.dataset.index, this.data.month-1)
    this.setData({
      year: e.target.dataset.index,
      changeYearFlag:false
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

  },
  //显示详细工程
  projectInfo:function(e){
    App.globalData.projectDay = e.target.dataset.index.isToday;
    App.globalData.ifFromMonth = true;
    if (e.target.dataset.index.isToday != "" ){
      wx.navigateBack({
        //页面出栈
      })
    }
  },
})