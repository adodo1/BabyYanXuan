App({
  onLaunch: function () {
    var that = this;
    that.urls();
  
    wx.getSystemInfo({
      success: function (res) {
        if (res.model.search("iPhone X") != -1) {
          that.globalData.iphone = true;
        }
      }
    });
    wx.request({
      url: that.globalData.urls + "/config/get-value",
      data: {
        key: "mallName"
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.setStorageSync("mallName", res.data.data.value);
        }
      }
    });
    wx.request({
      url: that.globalData.urls + "/score/send/rule",
      data: {
        code: "goodReputation"
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.globalData.order_reputation_score = res.data.data[0].score;
        }
      }
    });
    wx.request({
      url: that.globalData.urls + "/config/get-value",
      data: {
        key: "recharge_amount_min"
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.globalData.recharge_amount_min = res.data.data.value;
        }
      }
    });
    // that.login();
  },
  siteInfo: require("config.js"),
  /*
  login: function () {
    var that = this;
  
    wx.login({
      success: function (res) {
        wx.request({
          url: that.globalData.urls + "/MyBill.asmx/GetWxOpenId",
          method: "POST",
          header: {
            "content-type": "application/x-www-form-urlencoded"
          },
          data: {
            appid:'wxa4138ba5e260a760',
            secret:'82da0d7ca8fb21234319d3de058743a7',
            js_code:res.code
          },
          success: function (res) {
            if (res.data.state == 1) {
              that.globalData.usinfo = 0;
              that.globalData.openId = JSON.parse(res.data.JsonStr).openid;
              that.globalData.unionId = JSON.parse(res.data.JsonStr).unionid;

              that.getAuthuriseInfo();
              return;
            }
            if (res.data.state == 0) {
              wx.hideLoading();
              wx.showModal({
                title: "提示",
                content: "无法登录，请重试",
                showCancel: false
              });
              return;
            }
          }
        });
      }
    });
  },
  getAuthuriseInfo: function(){
    var that = this;
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              //调用我们的getUserInfo接口
              that.saveUserInfo(res.userInfo);
            }
          })

          that.globalData.hasAuthorized = true;
        } else {
          //未授权
          // wx.authorize({
          //   scope: '',
          // })

          that.globalData.hasAuthorized = false;
        }
      }
    })
  },

  saveUserInfo: function(userInfo){
    var that = this;
    wx.request({
      url: that.globalData.urls + '/MyGoods.asmx/MyUserInfo',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        OpenId: that.globalData.openId,
        UnionId: that.globalData.unionId,
        UserName: userInfo.nickName,
        HeadImgUrl: userInfo.avatarUrl
      },
      success: function (res) {
        if (res.data.state == 1) {
          var Id = res.data.obj.Id;
          userInfo.Id = Id;
          userInfo.CartNumber = res.data.obj.CartNumber;
          userInfo.Score = res.data.obj.Score;
          userInfo.SignDay = res.data.obj.SignDay;
          that.globalData.userInfo = userInfo;
        }
      }
    })
  },
  */

  urls: function () {
    var that = this;
    that.globalData.urls = that.siteInfo.url + that.siteInfo.subDomain;
    that.globalData.share = that.siteInfo.shareProfile;
  },
  sendTempleMsg: function (orderId, trigger, template_id, form_id, page, postJsonString) {
    var that = this;
    wx.request({
      url: that.globalData.urls + "/template-msg/put",
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        token: that.globalData.token,
        type: 0,
        module: "order",
        business_id: orderId,
        trigger: trigger,
        template_id: template_id,
        form_id: form_id,
        url: page,
        postJsonString: postJsonString
      }
    });
  },
  sendTempleMsgImmediately: function (template_id, form_id, page, postJsonString) {
    var that = this;
    wx.request({
      url: that.globalData.urls + "/template-msg/put",
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        token: that.globalData.token,
        type: 0,
        module: "immediately",
        template_id: template_id,
        form_id: form_id,
        url: page,
        postJsonString: postJsonString
      }
    });
  },
  globalData: {
    userInfo: null,
    Urls: {}
  }
});