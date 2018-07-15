//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    flag: true,
    indicatorDots: true,
    autoplay: true,
    interval: 6000,
    duration: 800,
    loadingHidden: false, // loading
    userInfo: {},
    swiperCurrent: 0,
    selectCurrent: 0,
    categories: [],
    activeCategoryId: 0,
    goods: [],
    scrollTop: "0",
    loadingMoreHidden: true,
    hasNoCoupons: true,
    coupons: [],
    searchInput: '',
    wxlogin: true,
    hovercoupons: true,
    iphone: false
  },

  //事件处理函数
  swiperchange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  toTopic: function (e) {
    wx.navigateTo({
      url: "/pages/topic/index?id=" + e.currentTarget.dataset.id
    })
  },
  tapBanner: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  kanjiaTap: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/kanjia-goods/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  tapSales: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: e.currentTarget.dataset.id
      })
    }
  },
  //弹窗优惠券关闭按钮
  hide: function () {
    this.setData({ hovercoupons: true })
  },
  //用户自主领取优惠券
  newCoupon: function (e) {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/discounts/fetch',
      data: {
        id: e.currentTarget.dataset.id,//优惠券id
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '成功领取',
            icon: 'success',
            duration: 2000
          })
          that.setData({
            flag: true
          })
        }
      }
    })
  },
  userlogin: function (e) {
    var that = this;
    var iv = e.detail.iv;
    var encryptedData = e.detail.encryptedData;
    var userInfo = e.detail.userInfo;

    var openId = app.globalData.openId;

    wx.request({
      url: app.globalData.urls + '/MyGoods.asmx/MyUserInfo',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        OpenId: openId,
        UserName: userInfo.nickName,
        HeadImgUrl:userInfo.avatarUrl
      },
      success: function (res) {
        if (res.data.state == 1) {
          var Id = res.data.obj.Id;
          userInfo.Id = Id;
          userInfo.CartNumber = res.data.obj.CartNumber;
          userInfo.Score = res.data.obj.Score;
          userInfo.SignDay = res.data.obj.SignDay;
          app.globalData.userInfo = userInfo;
          that.setData({
              userInfo:userInfo
          });
        }
      }
    })
  },
  onShow: function () {
    var that = this;
    setTimeout(function () {
      if (!app.globalData.hasAuthorized) {
        that.setData({
          wxlogin: false
        })
        wx.hideTabBar();
      }
    }, 1000)
  },
  onLoad: function () {
    var that = this;

    that.setData({
      wxLogin: app.globalData.hasAuthorized
    });

    if (app.globalData.iphone==true){
      that.setData({iphone:true})
    }
    //首页顶部Logo
    wx.request({
      url: app.globalData.urls + '/banner/list',
      data: {
        type: 'toplogo'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            toplogo: res.data.data[0].picUrl,
            topname: wx.getStorageSync('mallName')
          });
        }
      }
    })
    //首页幻灯片
    wx.request({
      url: app.globalData.urls + '/MyBill.asmx/GetMyBill',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        TypeId: '1'
      },
      success: function (res) {
        if (res.data.state == 1) {
            that.setData({
              banners: res.data.obj
            });
        }
      }
    })
    //获取特惠商品信息
    wx.request({
      url: app.globalData.urls + '/MyBill.asmx/GetMyBill',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        TypeId: '2'
      },
      success: function (res) {
        if (res.data.state == 1) {
          that.setData({
            toptuan: res.data.obj
          });
        }
      }
    })
    //获取精选专题信息
    wx.request({
      url: app.globalData.urls + '/MyBill.asmx/GetMyBill',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        TypeId: '3'
      },
      success: function (res) {
        if (res.data.state == 1) {
          that.setData({
            toptopics: res.data.obj
          });
        }
      }
    })
    //获取推荐商品信息
    wx.request({
      url: app.globalData.urls + '/MyBill.asmx/GetMyBill',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        TypeId: '4'
      },
      success: function (res) {
        if (res.data.state == 1) {
          that.setData({
            topgoods: res.data.obj
          });
          wx.request({
            url: app.globalData.urls + '/shop/goods/list',
            data: {
              recommendStatus: 1,
              pageSize: 10
            },
            success: function (res) {
              that.setData({
                goods: [],
                loadingMoreHidden: true
              });
              var goods = [];
              if (res.data.code != 0 || res.data.data.length == 0) {
                that.setData({
                  loadingMoreHidden: false,
                });
                return;
              }
              for (var i = 0; i < res.data.data.length; i++) {
                goods.push(res.data.data[i]);
              }
              that.setData({
                goods: goods,
              });
            }
          })
        }
      }
    })

    //新用户领取优惠券
    setTimeout(function () {
      wx.request({
        url: app.globalData.urls + '/banner/list',
        data: {
          key: 'mallName',
          type: 'newcoupons'
        },
        success: function (res) {
          if (res.data.code == 0) {
            wx.request({//识别用户是否可以领取优惠券
              url: app.globalData.urls + '/discounts/fetch',
              data: {
                id: res.data.data[0].businessId,//优惠券id
                token: app.globalData.token,
                detect: true
              },
              success: function (res) {
                if (res.data.code == 0) {
                  that.setData({ flag: false })
                }
              }
            });
            that.setData({
              newcoupons: res.data.data[0]
            });
          }
        }
      })
    }, 500
    )
  },
  hoverNewcoupons: function () {
    this.setData({ hovercoupons: false })
  },
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('mallName') + '—' + app.globalData.share,
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onPageScroll: function (t) {
    if (this.data.iphone == true && t.scrollTop >= 280) {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff'
      })
      this.setData({
        navigationbar: "scrollTop",
        naviphone: "iphneTop"
      })
    }
    if (t.scrollTop >= 280) {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff'
      })
      this.setData({
        navigationbar: "scrollTop"
      })
    } else {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#ffffff'
      })
      this.setData({
        navigationbar: "",
        naviphone: ""
      })
    }
  }
})
