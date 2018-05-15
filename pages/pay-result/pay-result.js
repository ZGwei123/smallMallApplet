// pages/pay-result/pay-result.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    // 处理千应支付代码
    this.setData({
      'payResult': options.flag,
      'id': options.id,
    });

    // 支付成功时，更新缓存中的新订单值为true，使从my页面直接支付成功时，能够重新进入my页面更新订单
    // 状态
    if(options.flag){
      wx.setStorageSync('newOrder', true);
    }

    // ** 下面注释为处理微信支付的代码 **
    // --------------------------------------------------------
    // this.setData({
    //   payResult: options.flag,
    //   id: options.id,
    //   from: options.from
    // });
    // --------------------------------------------------------
  },

  /**
   * 点击“查看订单”时触发
   */
  viewOrder:function(event){

    // 处理千应支付代码
    wx.redirectTo({
      url: "../order/order?from=order&id=" + this.data.id
    });


    // ** 下面注释为处理微信支付的代码 **
    // --------------------------------------------------------
    // if(this.data.from == "my"){
    //   // 从“我的”页面点击支付进入支付结果时，“查看订单”将进入该订单对应的订单详情
    //   var id = this.data.id;
    //   wx.navigateTo({
    //     url: "../order/order?from=order&id=" + id
    //   });
    // } else {
    //   // 从订单详情页进入支付结果时，“查看订单”相当于微信给的返回，返回生成的订单页
    //   wx.navigateBack({
    //     detail: 1
    //   });
    // }
    // ---------------------------------------------------------------------
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

})