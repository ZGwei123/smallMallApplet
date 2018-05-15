import { Base } from "../../utils/base.js";

class Order extends Base{
  constructor(){
    super();
    this._storageKeyName = 'newOrder';
  }

  /**
   * 发送http请求下单
   * @param:
   * orderInfo 下单中的产品信息
   * callback
   */
  doOrder(orderInfo, callback){
    var that = this;
    var param = {
      url: "order",
      method: "POST",
      data: { products: orderInfo },
      sCallBack: function(data){
        // 在缓存中存储一个标志有新订单
        that.execSetStorageSync(true);
        callback && callback(data);
      },
      eCallback: function(){
      }
    };
    this.request(param);
  }

  /**
   * 保存或更新本地缓存
   */
  execSetStorageSync(data){
    wx.setStorageSync(this._storageKeyName, data);
  }

  /**
   * 是否有新订单
   */
  haveNewOrder(){
    // 从缓存中获取新订单标志位，查看是否有新订单
    var flag = wx.getStorageSync(this._storageKeyName);
    return flag == true;
  }

  /**
   * 发送http请求支付，先从服务器请求获取签名等参数后，在请求成功的异步回调里调用微信前端支付api
   * @param:
   * orderID int 订单id
   * callback function 回调方法，返回参数可能值，0：商品缺货等原因导致订单不能支付，
   *                   1：支付失败或支付取消，2：支付成功
   */
  execPay(orderID, callback){
    var param = {
      url: "pay/payment",
      method: "POST",
      data: { id: orderID },
      sCallBack: function(data){
        // 读取时间
        var priceExist = data.priceExist;
        // 根据时间判断服务器是否有调用微信统一订单接口获取签名参数（无时间，表示服务器没调用，
        // 可能是库存检测不通过）
        if(typeof priceExist != "undefined"){

          // 处理千应支付代码
          if(priceExist){
            callback && callback(1,data);
          } else {
            callback && callback(2,data);
          }


          // ** 下面注释为处理微信支付的代码 **
          // --------------------------------------------------------
          // // 有时间，表示获取了签名参数，拉起微信支付
          // wx.requestPayment({
          //   timeStamp: timeStamp.toString(),
          //   nonceStr: data.nonceStr,
          //   package: data.package,
          //   signType: data.signType,
          //   paySign: data.paySign,
          //   success:function(){
          //     // 用户成功支付
          //     callback && callback(2);
          //   },
          //   fail: function(){
          //     // 支付失败（被用户取消）
          //     callback && callback(1);
          //   }
          // });
          // -------------------------------------------------------------

        } else {
          // 服务器引起的支付失败（如库存检验不通过等）
          callback && callback(0,data);
        }
      },

      eCallback:function(data){
        wx.switchTab({
          url: '../my/my',
        });
        wx.showToast({
          icon : 'none',
          title: '系统繁忙，暂时无法支付，请稍后再支付！',
          duration: 2500,
          mask: true
        });
      }

    };
    this.request(param);
  }

  /**
   * 发送请求获取详情订单信息
   * @param:
   * id int 订单id
   * callback
   */
  getOrderInfoById(id, callback){
    var param = {
      url: "order/" + id,
      sCallBack: function(data){
        callback && callback(data);
      }
    };
    this.request(param);
  }

  /**
   * 发送http请求获取当前用户的所有历史订单
   * @param:
   * page int 历史订单页数（所有历史订单分成多页获取）
   * callback
   */
  getOrders(page, callback){
    var param = {
      url: "order/by_user?page=" + page + "&size=15",
      sCallBack: function(data){
        callback && callback(data);
      }
    };
    this.request(param);
  }
}

export { Order };