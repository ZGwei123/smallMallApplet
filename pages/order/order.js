// pages/order.js
import { Cart } from "../cart/cart-model.js";
import { Address } from "../../utils/address.js";
import { Order } from "order-model.js";

var cart = new Cart();
var address = new Address();
var order = new Order();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    orderID: null,
    isDeleteProducts: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取是哪个页面跳转过来的（购物车还是历史订单），不同的页面跳转将显示不同的页面效果
    var from = options.from;
    if(from == "cart"){
      // 来自购物车
      this._fromCart(options.account);
    } else {
      // 来自历史订单
      this._fromOrder(options.id);
    }
  },

  /**
   * 从购物车跳转过来，将从购物车里生成订单（该订单并不在服务器里）
   */
  _fromCart:function(account){
    this.data.account = account;
    var productsArr = cart.getCartDataFromLocal(true);
    var orderStatus = 0;
    this.setData({
      account: account,
      productsArr: productsArr,
      orderStatus: orderStatus
    });

    /**
     * http请求获取地址进行绑定，显示收货地址
     */
    address.getAddress((res) => {
      this._bindAddressInfo(res);
    });
  },

  /**
   * 从历史订单跳转过来，将从服务器获取的订单
   * id int 订单id
   */
  _fromOrder:function(id){
    // 订单已在服务器创建成功，获取订单id
    var id = id;
    var that = this;
    this.data.orderID = id;
    // 发送http请求获取订单信息
    order.getOrderInfoById(id, (data) => {
      // 绑定从服务器获取到的订单信息
      that.setData({
        orderStatus: data.status,
        productsArr: data.snap_items,
        account: data.total_price,
        basicInfo: {
          orderTime: data.create_time,
          orderNo: data.order_no
        }
      });
      // 订单地址，地址信息需要调用方法获取完整地址
      var addressInfo = data.snap_address;
      addressInfo.totalDetail = address.setAddressInfo(addressInfo);
      that._bindAddressInfo(addressInfo);
    });
  },

  /**
   * 点击地址时触发
   */
  editAddress:function(event){
    var that = this;
    // 调用微信的地址api来弹出（获取）微信内部地址栏
    wx.chooseAddress({
      success:function(res){
        var addressInfo = {
          name: res.userName,
          mobile: res.telNumber,
          // 调用拼接出完整的详情地址
          totalDetail: address.setAddressInfo(res)
        };

        // 发送请求添加或更新地址信息
        address.submitAddress(res, (flag)=>{
          if(!flag){
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
   * 提示窗口
   * @param:
   * title string 标题
   * content string 内容
   * flag boolean 是否跳转到“我的”页面
   */
  showTips:function(title, content, flag){
    wx.showModal({
      title: title,
      content: content,
      showCancel: false,
      success:function(){
        if(flag){
          wx.switchTab({
            url: '/pages/my/my',
          })
        }
      }
    });
  },

  /**
   * 点击“付款”时触发
   */
  pay:function(event){
    if(!this.data.addressInfo){
      this.showTips("下单提示", "请填写您的收货地址");
      return;
    }
    if(this.data.orderStatus == 0){
      // 第一时间付款（生成订单并付款）
      this._firstTimePay();
    } else {
      // 订单已存在，只是进行付款
      this._oneMoresTimePay();
    }
  },

  /**
   * 第一时间付款（点击购物车“付款”生成订单页，在订单页直接付款时，会在服务器生成订单并付款）
   * 先发送给http请求下单后，再请求付款
   */
  _firstTimePay:function(){
    // 获取订单里的产品信息（产品id及购买数）
    var orderInfo = [],
      productsArr = this.data.productsArr;
    for(let i = 0; i < productsArr.length; i++){
      orderInfo.push({
        product_id: productsArr[i].id,
        count: productsArr[i].counts
      });
    }
    var that = this;
    // 下单（请求下单后返回的数据订单状态中包括订单是否创建成功、订单中的产品信息等）
    order.doOrder(orderInfo, (data)=>{
      // 下单是否成功（可能服务器检查库存不足引起下单失败）
      if(data.pass){
        // 下单成功，获取订单id
        var id = data.order_id;
        that.data.id = id;
        // 支付
        that._execPay(id);
      } else {
        // 下单失败
        that._orderFail(data);
      }
    });
  },

  /**
   * 订单已存在，从服务器获取后支付
   */
  _oneMoresTimePay: function () {
    // 关闭清除购物车功能（从历史订单进来支付时，则不需要在支付方法里调用清除购物车在订单已支付的产品）
    this.data.isDeleteProducts = false;
    // 支付(id和orderID都是订单id，从历史订单进来支付时，为防止执行重复执行相同代码，需将订单id定义
    // 成另一个别名)
    if(this.data.id){
      // 在购物车生成订单支付失败时，返回在支付时调用
      this._execPay(this.data.id);
    } else {
      //从历史订单进入支付时调用
      this._execPay(this.data.orderID);
    }
  },

  /**
   * 支付
   * @param:
   * id string 订单id
   */
  _execPay:function(id){
    var that =this;
    // 发送支付请求，异步回调处理支付结果（支付成功，支付失败：库存不足、用户取消）
    order.execPay(id, (statusCode,data)=>{
      // 除库存不足等服务器情况外
      if(statusCode > 0){

        // 是否从购物车中清除在订单中已付款的产品（当从购物车进来付款时需要，历史订单则不需要）
        if (this.data.isDeleteProducts){
          that.deleteProducts();
        }

        // 处理千应支付代码
        if(statusCode == 1){
          wx.switchTab({
            url: '../my/my',
          });
          wx.showToast({
            icon: 'none',
            title: data.msg,
            duration: 3000,
            mask: true
          });
        } else {
          wx.navigateTo({
            url: '../pay-qrcode/pay-qrcode?price=' + data.price + '&orderID=' + id + '&qRCodeUrl=' +  data.QRCodeUrl,
          })
        }




        //  ** 下面注释为处理微信支付的代码 **
        // --------------------------------------------------------
        // var flag = statusCode == 2;
        // // 跳转页面，显示支付结果页面
        // wx.navigateTo({
        //   url: '../pay-result/pay-result?id=' + id + '&flag=' + flag + '&from=order',
        // });
        // ----------------------------------------------------------
      } else {
        // 显示库存不足信息
        that.showTips("支付失败", "商品已下架或库存不足");
      }
    });
  },

  /**
   * 从购物车中清除在订单中已付款的产品
   */
  deleteProducts: function(){
    var ids = [],
      arr = this.data.productsArr;   // 获取订单产品信息
    // 遍历获取订单中的产品id
    for(let i = 0; i < arr.length; i++){
      ids.push(arr[i].id);
    }
    // 清除购物车
    cart.delete(ids);
  },

  /**
   * 请求下单失败，反馈对应信息给用户
   * data Object 服务器返回的失败订单状态（包含库存不足的产品）
   */
  _orderFail: function(data){
    var nameArr = [],     // 存放库存不足的产品名
      name = '',
      str = '',
      pArr = data.pStatusArray;
    // 遍历获取库存不足的产品
    for(let i = 0; i < pArr.length; i++){
      if(!pArr[i].haveStock){
        // 库存不足的产品名
        name = pArr[i].name;
        if(name.length > 15){
          name = name.substr(0, 12) + "...";
        }
        nameArr.push(name);
        // 最多存放两个库存不足的产品名
        if(nameArr.length >= 2){
          break;
        }
      }
    }
    // 将库存不足的产品名拼接成字符串
    str = nameArr.join("、");
    if(nameArr.length >= 2){
      str += "等";
    }
    str += "缺货";
    // i在页面显示库存不足的产品名窗口
    this.showTips('下单失败', str);
  },

  /**
   * 弹出一个消息框
   * @param:
   * title string 消息标题
   * content string 消息内容
   */
  showTips:function(title, content){
    wx.showModal({
      title: title,
      content: content,
      showCancel: false,
      success:function(){

      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   * 在支付结果页返回时将显示的是从服务器获取的订单信息
   * （在支付时订单被创建在服务器里，页面效果和历史订单跳转过来一样）
   */
  onShow: function () {
    // 下单是否成功
    if(this.data.id){
      // 显示订单信息
      this._fromOrder(this.data.id);
    }
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
  
  }
})