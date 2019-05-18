
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Act_id: '3649480715940134912',//请求退款接口的唯一标示
    selectAll: 0,
    refundNum: 0,  //退款数量
    refunfMoney: 0,  //退款金额
    errArray: [],//错误提示数组
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let winWid = wx.getSystemInfoSync().windowWidth; 4
    this.setData({
      contentWid: winWid - 30 - 50
    })
    
    //获取退款待处理列表
    this.getRefundList();
  },

  /***获取退款待处理列表 */
  getRefundList: function () {
    let that = this
    //初始化全选按钮 退款数量等
    that.setData({
      selectAll: 0,
      refundNum: 0,
      refunfMoney: 0.00
    })
    let data = {
      Jsonstring: JSON.stringify({
        "Act_id": that.data.Act_id
      })
    }
    wx.api.api.getEventRfundList(data, function (res) {
      if (res.data.code == 1) {
        for (let i in res.data.data) {
          res.data.data[i].isSelect = false
        }
        that.setData({
          refundList: res.data.data
        })
      }
    })

  },

  /***单个选择 */
  selectOne: function (e) {
    let that = this
    let index = e.currentTarget.dataset.index;
    let item = this.data.refundList[index];
    item.isSelect = !item.isSelect;
    that.setData({
      refundList: that.data.refundList
    });
    //计算退款数量和金额
    that.countNumAndSum();
  },

  /****全选 */
  selectAll: function () {
    let selectAll = this.data.selectAll
    let that = this
    let data = that.data.refundList
    //取消全选
    if (selectAll == 1) {
      for (let i in data) {
        data[i].isSelect = false
      }
      //点亮全选按钮
      that.setData({
        selectAll: 0
      })
    } else {//全部选中
      for (let i in data) {
        data[i].isSelect = true
      }
      that.setData({
        selectAll: 1
      })
    }
    that.setData({
      refundList: data
    })
    //计算退款数量和金额
    that.countNumAndSum();
  },

  /****计算退款数量和金额 */
  countNumAndSum: function () {
    let that = this
    that.setData({
      refundNum: 0,  //清空退款数量
      refunfMoney: 0.00,//清空金额
    })
    for (let i in that.data.refundList) {
      if (that.data.refundList[i].isSelect == true) {
        let newRefundNum = parseFloat(that.data.refundNum) + 1
        let newRefunfMoney = parseFloat(that.data.refunfMoney) + parseFloat(that.data.refundList[i].refund_fee)
        that.setData({
          refundNum: newRefundNum,
          refunfMoney: newRefunfMoney
        })
      }
    }
    //如果全部单选中 就增加全选按钮样式
    if (that.data.refundNum == that.data.refundList.length) {
      that.setData({
        selectAll: 1
      })
    } else {
      that.setData({
        selectAll: 0
      })
    }
  },

  /***同意 */
  agree: function (e) {
    let that = this
    //判断是否有需要退款的订单
    let isRefund = ''
    let isRefund2 = ''
    for (let i in that.data.refundList) {
      if (that.data.refundList[i].isSelect == true) {
        //有退款的订单数
        isRefund++
      } else {
        //无退款的订单数
        isRefund2++
      }
      let total = isRefund + isRefund2
      if (total == that.data.refundList.length) {
        if (isRefund > 0) {
          //有需要退款的订单
          that.haveRefundList();
        } else {
          that.showTips("暂无需要退款的订单")
        }
      }
    }
  },

  /****有需要退款的订单 */
  haveRefundList: function () {
    let that = this
    let selectLength = 0  //需要退款的数量
    that.setData({ errArray: [] })  //清空提示数组
    wx.showModal({
      title: '提示',
      content: '确定同意退款申请？',
      confirmColor: '#FFA404',
      success(res) {
        if (res.confirm) {
          let carrayNum = 0//执行个数
          for (let i in that.data.refundList) {
            if (that.data.refundList[i].isSelect == true) {
              selectLength++
              let data = {
                transaction_id: that.data.refundList[i].transaction_id,
                out_refund_no: that.data.refundList[i].out_refund_no,
                out_trade_no: that.data.refundList[i].out_trade_no,
                refund_fee: parseFloat(that.data.refundList[i].refund_fee)
              }
              wx.api.api.backMoney(data, function (res) {
                if (res.data.code == 1) {
                  //接口调用成功 不区分是否能够退款成功
                  that.data.errArray.push({
                    name: that.data.refundList[i].Show_Name,
                    errorMsg: res.data.data.return_msg
                  })
                } else {
                  //接口调用失败
                  that.data.errArray.push({
                    name: that.data.refundList[i].Show_Name,
                    errorMsg: '退款接口调用' + res.data.msg
                  })

                }
                carrayNum++
                if (carrayNum == selectLength) {
                  let msg = ''
                  for (let j in that.data.errArray) {
                    msg += that.data.errArray[j].name + that.data.errArray[j].errorMsg + "\n"
                  }
                  that.showTips(msg)
                }
              })
            }
          }
        }
      }
    })

  },

  /*****提示信息 */
  showTips: function (msg) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: msg,
      showCancel: false,
      confirmText: '我知道了',
      confirmColor: '#FFA404',
      success(res) {
        if (res.confirm) {
          //重新加载退款待处理列表
          that.getRefundList();
        }
      }
    })
  },

  /***错误提示信息 */
  // showError:function(){
  //   wx.showToast({
  //     title: '退款失败',
  //     image: '../../images/error.png',
  //     duration: 1000
  //   })
  // },

})