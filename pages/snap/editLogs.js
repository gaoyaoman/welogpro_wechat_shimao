// pages/editLogs/editLogs.js
let dateformat= require('../../utils/dateFormat.js');
let _this;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src:[],
    images: [],
    list:[],
    idList:[],
    idListTemp:[],
    projectList:[],
    taskList:[],
    task:null,
    projectName: null,
    ifPicker:false,   //项目Picker
    ifPicker2:false,  //任务Picker
    ifPicker3:false,  //类型Picker
		// ifPicker4: false,  //类型状态Picker
    textInfo:'',
    taskType:'',
    taskStatus:'',
    loading:false,
    typeList:['进度','质量','安全'],
    statusList:['正在进行','需整改','完成'],
    href:0,
    id:''
  },

  /** 
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _this = this;
    let date = dateformat.format(new Date(), 'yyyy-MM-dd');
    if (options.src) {
      let images = [];
      images.push(options.src);
      _this.setData({
        images: images,
        href:1
      });
      wx.request({
        url: getApp().globalData.api + 'welogTaskController/resId',
        data: {
          resId: wx.getStorageSync('phoneNumber'),
          taskDate: date
        },
        header: {
          'content-type': 'application/json'
        },
        success(res) {
          //备注:后端查不到数据返回"no task"
          console.log('res',res)
          if (res.errMsg === "request:ok") {
            if (res.data === "no task") {
              _this.setData({
                ifPicker1: true,
                ifPicker2: true,
                projectName: '当日无任务记录',
                task: '当日无任务记录'
              });
            } else {
              let list1 = [], list2 = [],list3=[], data = res.data,c=0;
              for (let i = 0; i < data.length; i++) {
                if (data[i].length === 0){
                  c+=1;
                  continue;
                }
                else{
                  list1.push(data[i][0].projectName);
                  list2.push({
                    projectName: data[i][0].projectName,
                    children: []
                  })
                  list3.push({
                    projectName: data[i][0].projectName,
                    children: []
                  })
                  for (let j = 0; j < data[i].length; j++) {
                    list2[i-c].children.push(data[i][j].taskText)
                    list3[i-c].children.push({
                      taskText: data[i][j].taskText,
                      id: data[i][j].id
                    })
                  }
                }
              }
              _this.setData({
                projectList: list1,
                list: list2,
                idList:list3
              })
							// console.log('存储所有的id', _this.data.idList)
              // if (list1.length === 1) {
              //   _this.setData({
              //     projectName: list1[0]
              //   })
              //   for (let i = 0; i < _this.data.list.length; i++) {
              //     if (_this.data.list[i].projectName === _this.data.projectName) {
              //       _this.setData({
              //         taskList: _this.data.list[i].children
              //       })
              //     }
              //   }
              //   if (list2[0].children.length === 1) {
              //     _this.setData({
              //       task: list2[0].children[0],
              //       id:list3[0].children[0].id,
              //       ifPicker1: true,
              //       ifPicker2: true
              //     })
              //   }
              // }
            }
          } else {
            wx.showToast({
              title: '获取工程任务列表失败，请稍后再试',
              icon: 'none',
              duration: 2000,
              mask: true,
            })
          }
        }
      });
    } else {
			let taskStatus='';
			if (options.status==='1'){
				taskStatus = '正在进行'
			} else if (options.status === '2'){
				taskStatus = '正在进行'
			}else{
				taskStatus = '已完成'
			}
      _this.setData({
        projectName: options.projectName,
        task: options.tastText,
        id:options.id,
				taskType: options.taskType,
				// taskStatus: taskStatus,
        ifPicker1: true,
        ifPicker2: true,
				ifPicker3: true,
				// ifPicker4: true,
        href:2
      });
    }
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

  },
  chooseImage: function () {
    // 选择图片
    wx.chooseImage({
      count: 1, 
			sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success(res1) {
            _this.setData({
              imgWidth: res1.width,
              imgHeight: res1.height,
              images: res.tempFilePaths
            });
          }
        });
      }
    })
  },
  // 图片预览
  previewImage: function (e) {
    let current = e.target.dataset.src
    wx.previewImage({
      current: current,
      urls: this.data.images
    })
  },
  deleteImg: function (e) {
    let index = e.currentTarget.dataset.index; 
    let images = _this.data.images;
    let count=_this.data.count--;
    images.splice(index, 1);
    _this.setData({
      images: images,
      count:count
    });
  },
  //选择项目
  selectProject:function(e){
    _this.setData({
      task:null,
      projectName: _this.data.projectList[e.detail.value]
    });
    for(let i=0;i<_this.data.list.length;i++){
      if(_this.data.list[i].projectName===_this.data.projectName){
        _this.setData({
          taskList: _this.data.list[i].children,
          idListTemp: _this.data.idList[i].children
        })
      }
			// console.log('i',i)
			// console.log('临时存储当前项目的idListTemp', _this.data.idList[i].children)
    }
  },
  selectTask:function(e){
		// console.log('e.detail.value', e.detail.value)
		// console.log('_this.data.idListTemp', _this.data.idListTemp)
		// console.log('_this.data.idListTemp', _this.data.idListTemp[e.detail.value])
    _this.setData({
      task: _this.data.taskList[e.detail.value],
      id: _this.data.idListTemp[e.detail.value].id
    });
  },
  selectType:function(e){
    _this.setData({
      taskType: _this.data.typeList[e.detail.value]
    });
  },
  selectStatus: function (e) {
    _this.setData({
      taskStatus: _this.data.statusList[e.detail.value]
    });
  },
  textChange:function(e){
    _this.setData({
      textInfo: e.detail.detail.value
    })
  },
  //保存数据
  saveData:function(){
    if (!_this.data.textInfo) {
      wx.showToast({
        title: '请添加照片文字说明',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (!_this.data.images[0]){
      wx.showToast({
        title: '请添加至少一张照片',
        icon:'none',
        duration:2000
      })
      return false;
    }
    if (!_this.data.taskType) {
      wx.showToast({
        title: '请选择任务分类',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (!_this.data.taskStatus) {
      wx.showToast({
        title: '请选择任务状态类型',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (!_this.data.projectName) {
      wx.showToast({
        title: '请选择工程名称',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (_this.data.projectName ==='当日无任务记录'){
      wx.showToast({
        title: '当前无任务可提交',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (!_this.data.task) {
      wx.showToast({
        title: '请选择任务名称',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
		let imgData = wx.getFileSystemManager().readFileSync(_this.data.images[0], "base64"), //图片
      text = _this.data.textInfo,	//图片说明
      time = new Date().getTime(),	//上传时间
      phoneNumber = wx.getStorageSync('phoneNumber'), //手机号码
      projectName = _this.data.projectName,//项目名称
      task = _this.data.task,	//任务名称
      taskType=_this.data.taskType,	//任务类型：质量、安全、进度
      taskStatus=_this.data.taskStatus,	//任务状态：正在进行、需整改、已完成
      id = _this.data.id;	//数据库中存储任务的主键 id

    let log = JSON.stringify({ time, text, imgData, task, phoneNumber, projectName ,taskType,taskStatus});
    _this.setData({
      loading: true
    })
		
    wx.request({
      url: getApp().globalData.api +'welogTaskController/addworklog',
      method:'POST',
      data:{
        log
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        if(res.data==="success"){
          if (taskStatus === '正在进行' || taskStatus === '需整改'){
            taskStatus = 1;
          }
          else{
            taskStatus = 3;
          }
          wx.request({
            url: getApp().globalData.api +'welogTaskController/updateWelogTaskType',
            data: {
              id:id,
              type: taskStatus,
              taskType: taskType
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success:function(r){
              wx.showModal({
                title: '',
                content: '日志提交成功！',
                showCancel: false,
                success: function (e) {
                  console.log(e);
                  if (e.confirm) {
                    wx.navigateBack({})
                  }
                }
              })
            }
          })
        }
        else{
          wx.showToast({
            title: '请求失败',
            icon:'none',
            mask: true
          })
        }
      },
      complete:function(){
        _this.setData({
          loading: false
        })
      }
    });
  }
})