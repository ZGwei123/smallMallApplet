import {Home} from 'home-model.js';
var home = new Home();
// pages/home/home.js
Page({
  data:{

  },

  onLoad:function(){
    this._loadData();
  },

  // 调用模型层发送网络请求获取banner数据
  _loadData:function(){
    var id = 1;
    var ids = '1,2,3';
    var count = 15;
    // 获取Banner数据
    home.getBannerData(id,this.callBackBanner);
    // 获取首页主题数据
    home.getThemeData(ids, this.callBackTheme);
    // 获取首页最近产品数据
    home.getRecentProductData(count, this.callBackRecentProducts);
  },

  // 回调函数，获取banner数据成功时，进行异步回调
  callBackBanner:function(res){
    this.setData({
      "bannerArr": res
    });
  },

  callBackTheme:function(res){
    this.setData({
      "themeArr": res
    });
  },

  callBackRecentProducts:function(res){
    this.setData({
      "recentProductArr": res 
    });
  },

  /* 点击触发跳转到产品详情页 */
  onProductsItemTap:function(event){
    var id = home.getDataSet(event, 'id');
    wx.navigateTo({
      url: '../product/product?id=' + id
    });
  },

  /* 点击主题跳转到主题详情页 */
  onThemeItemTap:function(event){
    var id = home.getDataSet(event, 'id');
    var name = home.getDataSet(event, 'name');
    wx.navigateTo({
      url: '../theme/theme?id=' + id + '&name=' + name
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }

})