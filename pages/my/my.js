// pages/my/my.js
import { My } from "my-model.js";
import { Address } from "../../utils/address.js";
import { Order } from "../order/order-model.js";

var my = new My();
var address = new Address();
var order = new Order();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex: 1,
    orderArr: [],
    isLoadAll: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 用户信息
    this._loadData();
    // 地址信息
    this._getAddressInfo();
    // 订单信息
    this._getOrders();
  },

  /**
   * 生命周期函数--监听页面显示
   * 用户是否下了新订单，有更新历史订单列表
   */
  onShow: function () {
    // 是否有新订单
    var newOrderFlag = order.haveNewOrder();
    if(newOrderFlag){
      this.refersh();
    }
  },

  /**
   * 更新历史订单列表（用户下了新的订单）
   */
  refersh:function(){
    this._getOrders(()=>{
      // 重置数据
      this.data.orderArr = [];
      this.data.pageIndex = 1;
      this.data.isLoadAll = true;
      // 将缓存中的新订单标志位改为false，以阻止用户没有下单时显示该页面发送请求
      order.execSetStorageSync(false);
    });
  },

  /**
   * 获取用户信息
   */
  _loadData: function(){
    my.getUserInfo((data)=>{
      this.setData({
        userInfo: data
      });
    });
  },

  /**
   * 发送http请求获取地址信息
   */
  _getAddressInfo:function(){
    address.getAddress((data)=>{
      this._bindAddressInfo(data);
    });
  },

  /**
   * 点击地址时触发
   */
  editAddress: function (event) {
    var that = this;
    // 调用微信的地址api来弹出（获取）微信内部地址栏
    wx.chooseAddress({
      success: function (res) {
        var addressInfo = {
          name: res.userName,
          mobile: res.telNumber,
          // 调用拼接出完整的详情地址
          totalDetail: address.setAddressInfo(res)
        };

        // 发送请求添加或更新地址信息
        address.submitAddress(res, (flag) => {
          if (!flag) {
            // 失败时，跳出窗口提示
            that.showTips("操作提示", "地址信息更新失败");
          } else {
            // 绑定地址信息
            that._bindAddressInfo(addressInfo);
          }
        });
      }
    });
  },

  /**
   * 绑定地址信息
   */
  _bindAddressInfo:function(addressInfo){
    this.setData({
      addressInfo: addressInfo
    });
  },

  /**
   * 发送http请求获取所有历史订单
   */
  _getOrders:function(callback){
    // 是否传入回调函数，有执行（该回调函数用在用户下了新订单更新历史订单列表时重置数据）
    callback && callback();
    //  需指定获取第几页的历史订单
    order.getOrders(this.data.pageIndex, (res)=>{
      // 获取的历史订单页是否有历史订单
      if(res.data.length > 0){
        // 有历史订单，将新获取的历史订单和原历史订单数组合并
        this.data.orderArr.push.apply(this.data.orderArr, res.data);
        // 重绑定历史订单，加载显示新的历史订单
        this.setData({
          orderArr: this.data.orderArr
        });
      } else {
        // 订单页里无订单（上拉不在加载请求新的历史订单）
        this.data.isLoadAll = false;
      }
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   * 上拉将加载新的历史订单
   */
  onReachBottom: function () {
    if(this.data.isLoadAll){
      // 增加页数，获取新的一页历史订单
      this.data.pageIndex++;
      this._getOrders();
    }
  },

  /**
   * 点击订单时触发，跳转到订单详情页
   */
  showOrderDetailInfo:function(event){
    var id = my.getDataSet(event, 'id');
    wx.navigateTo({
      url: "../order/order?from=order&id=" + id
    });
  },

  /**
   * 点击“付款”时触发，进行支付
   */
  rePay:function(event){
    // 订单id
    var id = my.getDataSet(event, "id");
    // 要付款的订单在历史订单列表数组的下标
    var index = my.getDataSet(event, "index");
    this._execPay(id, index);
  },

  /**
   * 支付
   * @param:
   * id int 订单id
   * index int 订单下标
   */
  _execPay:function(id, index){
    var that = this;
    // 发送http请求支付
    order.execPay(id, (statusCode,data)=>{
      // 除服务器引起的支付失败（如库存检验不通过等）外
      if(statusCode > 0){

        // 处理千应支付代码
        if (statusCode == 1) {
          wx.showToast({
            icon: 'none',
            title: data.msg,
            duration: 3000,
            mask: true
          });
        } else {
          wx.navigateTo({
            url: '../pay-qrcode/pay-qrcode?price=' + data.price + '&orderID=' + id + '&qRCodeUrl=' + data.QRCodeUrl,
          });
        }



        //  ** 下面注释为处理微信支付的代码 **
        // --------------------------------------------------------
        // // 用户是否成功支付
        // var flag = statusCode == 2;
        // if(flag){
        //   // 用户支付成功时，更新订单在历史订单列表数组中的状态（改为已付款）
        //   that.data.orderArr[index].status = 2;
        //   that.setData({
        //     orderArr: that.data.orderArr
        //   });
        // }
        // wx.navigateTo({
        //   url: '../pay-result/pay-result?id=' + id + "&flag=" + flag + "&from=my",
        // });
        // ------------------------------------------------------------
      } else {
        that.showTips("支付失败", "商品已下架或库存不足");
      }
    });
  },

  /**
   * 弹出一个提示框
   * @param:
   * title string 提示标题
   * content string 提示内容
   */
  showTips: function(title, content){
    wx.showModal({
      title: title,
      content: content,
      showCancel: false,
      success: function(res){

      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
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
    this.refersh();
    wx.stopPullDownRefresh();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})