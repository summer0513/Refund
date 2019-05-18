const hosts = 'https://ybt.feshopx.com';//请填写自己的地址
var api = {};

/**获取code */
api.getCode = function (callback) {
  wx.login({
    success: res => {
      callback && callback(res.code)
    }
  })
}
/*ajax请求 带data*/
api.ajaxMethod = function (url, data, callback) {
  wx.showLoading({
    title: '正在加载...',
    mask: true,
  })
  wx.request({
    url: hosts + url,
    method: "POST",
    header: {
      'Content-Type': "application/json",
    },
    data: data,
    success: function (res) {
      wx.hideLoading()
      callback && callback(res);
    }
  })
}

/* 获取token*/
api.getToken = function (callback) {
  wx.login({
    success: function (e) {
      if (e.code) {
        let url = '/api/User/CreateTokenNew';
        let data = {
          JsCode: e.code
        }
        api.ajaxMethod(url, data, function (result) {
          callback && callback(result);
        })
      }
    }
  })
}


/*请求头带Token的ajax请求*/
api.ajaxByToken = function (url, data, callback) {
  wx.showLoading({
    title: '正在加载....',
    mask: true,
  })
  let token = wx.getStorageSync('token')
  if (token !== undefined && token !== '' && token !== null) {
    wx.request({
      url: hosts + url,
      method: "POST",
      header: {
        'Content-Type': "application/json",
        'token': token
      },
      data: data,
      success: function (res) {
        wx.hideLoading()
        callback && callback(res);
      }
    })
  }

}

/****获取当前活动退费人员列表（包含订单信息） */
api.getEventRfundList = function (data, callback) {
  let url = "/api/Activity/GetRefundList";
  api.ajaxByToken(url, data, function (result) {
    callback && callback(result);
  });
}

/**退款 */
api.backMoney = function (data, callback) {
  let url = "/api/WxPay/PayRefund";
  api.ajaxByToken(url, data, function (result) {
    callback && callback(result);
  });
}

module.exports = {
  api: api
}