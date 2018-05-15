import { Base } from "../../utils/base.js";

class Theme extends Base{
  constructor(){
    super();
  }

  /**
   * 获取主题下的产品
   * @id 主题id
   */
  getProductsData(id, callback){
    var param = {
      url: "theme/" + id,
      sCallBack: function(data){
        callback && callback(data);
      }
    };
    this.request(param);
  }
}

export { Theme };