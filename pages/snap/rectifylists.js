// pages/snap/rectifylists.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList:[], //需整改/未完成数据
    spinShow:true,
    task:'',
    taskText:'',
    projectName:'',
    type:'',
    status:'',
    id: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this=this;
    _this.setData({
      task: options.taskText +'需整改/未完成日志列表',
      taskText: options.taskText,
      projectName: options.projectName,
      type: options.taskType,
      status: options.status,
      id:options.id
    })
    wx.request({
      url: getApp().globalData.api + 'welogTaskController/getWorkLogImg',
      data: {
        task: options.taskText,
        projectName: options.projectName,
        type: options.taskType,
        phoneNumber: wx.getStorageSync("phoneNumber")
      },
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        //备注:后端查不到数据返回"no task"
        if (res.errMsg === "request:ok" && !!res.data.list) {
          let data = res.data.list;
          for(let i=0;i<data.length;i++){
            data[i].img = 'data:image/jpeg;base64,'+data[i].img
          };
          _this.setData({
            dataList: data,
            spinShow:false
          });
        }
      }
    });
  },

  //跳转至日志填报页面
  toWrite:function(e){
    wx.setStorageSync('imgComparison', e.target.dataset.data.img.split(',')[1]);
    wx.navigateTo({
      url: 'editLogs?taskText=' + this.data.taskText 
        + '&&projectName=' + this.data.projectName
        + '&&id=' + this.data.id 
        + '&taskType=' + this.data.type 
        + '&status=' + this.data.status
        + '&_text=' + e.target.dataset.data.text
        + '&time=' + e.target.dataset.data.time
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})