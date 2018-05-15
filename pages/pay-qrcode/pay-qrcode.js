// pages/pay-qrcode/pay-qrcode.js
import { PayQrcodeModel } from 'pay-qrcode-model.js';

var payQrcodeModel = new PayQrcodeModel;

var orderID;
var time;
var minuteSum = 6;
var secondSum = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    'price': '',
    'qRCodeUrl': '',
    'progressVal': 100,
    'minute': '0' + minuteSum,
    'second': '0' + secondSum
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    orderID = options.orderID;
    // 付款流程说明
    this.explain();
    // 价格和二维码图片
    this.setData({
      'price': options.price,
      'qRCodeUrl': options.qRCodeUrl
    });
    // 计时付款有效期
    this.startClock();
  },

  /**
   * 点击图片，进行预览
   */
  previewImage:function(even){
    wx.previewImage({
      urls: [this.data.qRCodeUrl],
    })
  },

  // 计时器（倒计时有效支付时间）
  startClock:function(){
    var that = this;
    // 开启计时器
    time = setInterval(function () {
      // 倒计时进度条（在进度条中取消计时器）
      var progressVal = that.data.progressVal - 0.27778;
      if (progressVal <= 0) {
        
        // 关闭计时器
        clearInterval(time);

        // 付款有效期过期，发送请求获取订单状态后，跳转显示支付情况
        payQrcodeModel.getOrderStatus(orderID, (status)=>{
          if(status != 1){
            wx.redirectTo({
              url: '../pay-result/pay-result?flag=true&id=' + orderID
            });
          }
          wx.redirectTo({
            url: '../pay-result/pay-result?flag=false&id=' + orderID
          })
        });

      }
      that.setData({
        'progressVal': progressVal
      });

      // 倒计时时间
      secondSum = secondSum - 1;
      if (secondSum < 0) {
        minuteSum = minuteSum - 1;
        secondSum = 59;
        that.setData({
          'minute': "0" + minuteSum,
          'second': secondSum
        });
      } else {
        if (secondSum > 9) {
          that.setData({
            'second': secondSum
          });
        } else {
          that.setData({
            'second': '0' + secondSum
          });
        }
      }

    }, 1000);
    
  },

  /**
   * 付款流程说明弹窗
   */
  explain:function(){
    wx.showModal({
      title: '付款流程说明',
      content: '1、点击付款码进入预览然后长按保存,\r\n2、切换应用到支付宝点击扫一扫，\r\n3、点击相册选择正确付款码进行付款',
      showCancel: false
    })
  },


  /**
   * 点击付款流程说明时触发
   */
  bindExplain:function(event){
    this.explain();
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
    // 发送请求获取订单状态后，订单状态不是未支付时则跳转显示支付情况
    payQrcodeModel.getOrderStatus(orderID, (status) => {
      if (status != 1) {
        wx.redirectTo({
          url: '../pay-result/pay-result?flag=true&id=' + orderID
        });
      } else {

        // 为了防止付款后切回应用订单时状态更新不及时，设置两秒后再发送一次请求确认订单状态
        setTimeout(function () {
          // 发送请求获取订单状态后，订单状态不是未支付时则跳转显示支付情况
          payQrcodeModel.getOrderStatus(orderID, (status) => {
            if (status != 1) {
              wx.redirectTo({
                url: '../pay-result/pay-result?flag=true&id=' + orderID
              });
            }
          });
        }, 2500);
        
      }
    });
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
    // 在redirectTo或navigateBack卸载页面时，关掉计时器（否则，计时器将继续运行）
    clearInterval(time);
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