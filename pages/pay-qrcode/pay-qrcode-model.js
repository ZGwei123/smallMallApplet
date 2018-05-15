import { Base } from '../../utils/base.js';

class PayQrcodeModel extends Base{
  constructor(){
    super();
  }

  /**
   * 获取订单状态
   */
  getOrderStatus(orderID, callback){
    var param = {
      'url': 'order/' + orderID,
      sCallBack: function(data){
        callback && callback(data.status);
      }
    }
    this.request(param);
  }
}

export { PayQrcodeModel };