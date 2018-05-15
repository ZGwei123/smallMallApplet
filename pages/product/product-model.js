import { Base } from "../../utils/base.js";

class Product extends Base{
  constructor(){
    super();
  }

  /**
   * 调用wx.request()发送http请求，获取产品详情信息
   * @id  产品id
   * @callback  回调函数
   */
  getDetailInfo(id, callback){
    var param = {
      url: 'product/' + id,
      sCallBack: function(data){
        callback && callback(data);
      }
    };
    this.request(param);
  }
}

export { Product };