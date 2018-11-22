// pages/editLogs/editLogs.js
let dateformat = require('../../utils/dateFormat.js');
let _this;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    comparison: {  //整改对比照片
      status: false,
      src: '',
      ifNull: false,
      base64: ''
    },
    src: [],
    images: [], //图片路径
    list: [],
    idList: [],  //任务主键列表
    idListTemp: [],
    projectList: [], //项目列表
    taskList: [],  //任务列表
    task: null,  //任务名称
    projectName: null, //项目名称
    ifPicker: false,   //项目Picker
    ifPicker2: false,  //任务Picker
    ifPicker3: false,  //类型Picker
    textInfo: '', //图片描述
    taskType: '',  //任务类型
    taskStatus: '', //任务状态
    loading: false,  //提交loading
    typeList: ['进度', '质量', '安全'], //任务类型维度备选项
    statusList: ['未开始', '进行中', '节点验收中', '节点验收完成', '需整改', '整改中', '整改完成', '任务最终完成'], //任务状态备选项
    href: 0, //从哪跳转来：1随手抓拍 2任务列表
    id: '',  //任务在数据库中的主键
    note: null,  //选择分类后的附加内容说明
    noteSafeList: ['文明巡检', '用电巡检', '临边巡检', '危险品巡检', '安全设施巡检', '安全配备巡检'],//安全巡检备选项
    noteSafe: null,//安全维度附加项
    noteSchedule: null, //进度维度附加项
    imgQualityList: ['优质', '一般', '较差'], //照片质量列表
    imgQuality: null
  },
  /** 
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _this = this;
    //入口随手抓拍
    if (options.src) {
      let images = [];
      wx.compressImage({
        src: options.src,
        quality: 30,
        success: function (re) {
          console.log('succeed to compress image', re);
          images.push(re.tempFilePath);
          _this.setData({
            images: images,
            href: 1
          });
        },
        fail: function (e) {
          console.log('fail to compress image', e);
        }
      })


      wx.request({
        url: getApp().globalData.api + 'welogTaskController/resId',
        data: {
          resId: wx.getStorageSync('phoneNumber'),
        },
        header: {
          'content-type': 'application/json'
        },
        success(res) {
          //备注:后端查不到数据返回"no task"
          if (res.errMsg === "request:ok") {
            if (res.data === "no task") {
              _this.setData({
                ifPicker1: true,
                ifPicker2: true,
                projectName: '当日无任务记录',
                task: '当日无任务记录'
              });
            } else {
              //c用来过滤传来的数组有空的情况
              let list1 = [], list2 = [], list3 = [], data = res.data, c = 0;
              for (let i = 0; i < data.length; i++) {
                if (data[i].length === 0) {
                  c += 1;
                  continue;
                }
                else {
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
                    list2[i - c].children.push(data[i][j].taskText)
                    list3[i - c].children.push({
                      taskText: data[i][j].taskText,
                      id: data[i][j].id
                    })
                  }
                }
              }
              _this.setData({
                projectList: list1,
                list: list2,
                idList: list3
              })
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
      let note;
      if (options.status === '4') {
        wx.request({
          url: getApp().globalData.api + 'welogTaskController/getWorkLogImg',
          data: {
            task: options.tastText,
            projectName: options.projectName,
            type: options.taskType,
            phoneNumber: wx.getStorageSync("phoneNumber")
          },
          header: {
            'content-type': 'application/json'
          },
          success(res) {
            //备注:后端查不到数据返回"no task"
            if (res.errMsg === "request:ok") {
              if (res.data.img) {
                let base64 = 'data:image/jpeg;base64,' + res.data.img;//base64格式图片
                let imgPath = wx.env.USER_DATA_PATH + '/comparison_' + new Date().getTime() + '.jpeg';
                //如果图片字符串不含要清空的前缀,可以不执行下行代码.
                let imageData = base64.replace(/^data:image\/\w+;base64,/, "");
                let fs = wx.getFileSystemManager();
                fs.writeFileSync(imgPath, imageData, "base64");
                _this.setData({
                  comparison: {
                    status: true,
                    src: imgPath,
                    ifNull: false,
                    base64: res.data.img
                  }
                })
              } else {
                _this.setData({
                  comparison: {
                    status: true,
                    src: '',
                    ifNull: true,
                    base64: ''
                  }
                })
              }
            }
          }
        });
      }
      switch (options.taskType) {
        case "质量":
          note = '填写质量检查数据:';
          break;
        case '进度':
          note = '填写累计完成率:';
          break;
        case '安全':
          note = '选择巡检类型:'
      }
      _this.setData({
        projectName: options.projectName,
        task: options.tastText,
        id: options.id,
        taskType: options.taskType,
        note: note,
        ifPicker1: true,
        ifPicker2: true,
        ifPicker3: true,
        href: 2
      });
    }
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
            wx.compressImage({
              src: res.tempFilePaths[0],
              quality: 30,
              success: function (res2) {
                console.log('success', res2);
                let src = [];
                src.push(res2.tempFilePath);
                _this.setData({
                  imgWidth: res1.width,
                  imgHeight: res1.height,
                  images: src
                });
              },
              fail: function (res2) {
                console.log('fail', res2)
              }
            })
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
  previewImageCp: function (e) {
    let current = e.target.dataset.src
    let arr = [];
    arr.push(current);
    wx.previewImage({
      current: current,
      urls: arr
    })
  },
  //删除图片
  deleteImg: function (e) {
    let index = e.currentTarget.dataset.index;
    let images = _this.data.images;
    let count = _this.data.count--;
    images.splice(index, 1);
    _this.setData({
      images: images,
      count: count
    });
  },
  //选择项目
  selectProject: function (e) {
    _this.setData({
      task: null,
      projectName: _this.data.projectList[e.detail.value]
    });
    for (let i = 0; i < _this.data.list.length; i++) {
      if (_this.data.list[i].projectName === _this.data.projectName) {
        _this.setData({
          taskList: _this.data.list[i].children,
          idListTemp: _this.data.idList[i].children
        })
      }
    }
  },
  //选择照片质量
  selectImgQuality: function (e) {
    _this.setData({
      imgQuality: _this.data.imgQualityList[e.detail.value],
    });
  },
  //选择任务
  selectTask: function (e) {
    _this.setData({
      task: _this.data.taskList[e.detail.value],
      id: _this.data.idListTemp[e.detail.value].id
    });
  },
  //选择类型：质量、安全、进度
  selectType: function (e) {
    let note = null,
      taskType = _this.data.typeList[e.detail.value];
    switch (taskType) {
      case "质量":
        note = '填写质量检查数据:';
        break;
      case '进度':
        note = '填写累计完成率:';
        break;
      case '安全':
        note = '选择巡检类型:'
    }
    _this.setData({
      taskType: _this.data.typeList[e.detail.value],
      note: note
    });
  },
  //选择安全巡检项
  selectNoteSafe: function (e) {
    _this.setData({
      noteSafe: _this.data.noteSafeList[e.detail.value]
    });
  },
  //填写进度信息
  inputNoteSchedule: function (e) {
    _this.setData({
      noteSchedule: e.detail.detail.value
    })
  },
  //选择任务状态：未开始、进行中、节点验收中、节点验收完成、需整改、整改中、整改完成、任务最终完成
  selectStatus: function (e) {
    _this.setData({
      taskStatus: _this.data.statusList[e.detail.value]
    });
  },
  //图片描述文字录入
  textChange: function (e) {
    _this.setData({
      textInfo: e.detail.detail.value
    })
  },
  //保存数据
  saveData: function () {
    if (!_this.data.textInfo) {
      wx.showToast({
        title: '请添加照片文字说明',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (!_this.data.images[0]) {
      wx.showToast({
        title: '请添加至少一张照片',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (!_this.data.imgQuality) {
      wx.showToast({
        title: '请选照片质量',
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
    if (_this.data.projectName === '当日无任务记录') {
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
    if (!_this.data.taskType) {
      wx.showToast({
        title: '请选择任务分类',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (_this.data.taskType === '安全') {
      if (!_this.data.noteSafe) {
        wx.showToast({
          title: '请选择安全巡检类型',
          icon: 'none',
          duration: 2000
        })
        return false;
      }
    }
    if (_this.data.taskType === '进度') {
      let ns = _this.data.noteSchedule;
      if (!ns) {
        wx.showToast({
          title: '请填写累计完成率',
          icon: 'none',
          duration: 2000
        })
        return false;
      } else {
        if (ns * 1 < 0 || ns * 1 > 100) {
          wx.showToast({
            title: '进度百分比需在0～100之间',
            icon: 'none',
            duration: 2000
          })
          return false;
        }
      }
    }

    let imgData = wx.getFileSystemManager().readFileSync(_this.data.images[0], "base64"), //图片数据
      text = _this.data.textInfo,	//图片说明
      time = new Date().getTime(),	//上传时间
      phoneNumber = wx.getStorageSync('phoneNumber'), //手机号码
      projectName = _this.data.projectName,//项目名称
      task = _this.data.task,	//任务名称
      taskType = _this.data.taskType,	//任务类型：质量、安全、进度
      taskStatus = _this.data.taskStatus,	//任务状态：未开始、进行中、节点验收中、节点验收完成、需整改、整改中、整改完成、任务最终最终完成
      id = _this.data.id,	//数据库中存储任务的主键 id
      imgQuality = _this.data.imgQuality, //预留参数：照片状态
      taskStatusAdmin = _this.data.taskStatus,//预留参数：管理员修改任务的状态
      noteSafe = null,
      noteSchedule = null,
      noteQuality = null,
      imgComparison = null,
      log = null; //参数
    if (_this.data.comparison.status) {
      imgComparison = _this.data.comparison.base64;
    }
    if (taskType === '安全') {
      noteSafe = _this.data.noteSafe;
    } else if (taskType === '进度') {
      noteSchedule = _this.data.noteSchedule;
    } else {
      noteQuality = null
    }
    log = JSON.stringify({
      imgData,
      text,
      time,
      phoneNumber,
      projectName,
      task,
      taskType,
      taskStatus,
      id,
      imgQuality,
      taskStatusAdmin,
      noteSafe,
      noteSchedule,
      noteQuality,
      imgComparison
    });
    console.log(log)
    _this.setData({
      loading: true
    });

    wx.request({
      url: getApp().globalData.api + 'welogTaskController/addworklog',
      method: 'POST',
      data: {
        log
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        if (res.data === "success") {
          switch (taskStatus) {
            case '进行中':
              taskStatus = '1';
              break;
            case '节点验收中':
              taskStatus = '2';
              break;
            case '节点验收完成':
              taskStatus = '3';
              break;
            case '需整改':
              taskStatus = '4';
              break;
            case '整改中':
              taskStatus = '5';
              break;
            case '整改完成':
              taskStatus = '6';
              break;
            case '任务最终完成':
              taskStatus = '7';
              break;
            case '未开始':
              taskStatus = '8';
              break;
          }
          wx.request({
            url: getApp().globalData.api + 'welogTaskController/updateWelogTaskType',
            data: {
              id: id,
              type: taskStatus,
              taskType: taskType
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (r) {
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
        else {
          wx.showToast({
            title: '请求失败',
            icon: 'none',
            mask: true
          })
        }
      },
      complete: function () {
        _this.setData({
          loading: false
        })
      }
    });
  }
})