import { Base } from "../../utils/base.js"

class Category extends Base{
  constructor(){
    super();
  }

  /**
   * 通过调用微信http请求api，获取所有分类类型
   */
  getCategoryType(callback){
    var param = {
      url: "category/all",
      sCallBack: function(data){
        callback && callback(data);
      }
    };
    this.request(param);
  }

  /**
   * 获取属于该分类的产品信息
   * @id  分类id
   */
  getProductsByCategory(id, callback){
    var param = {
      url: "product/by_category?id=" + id,
      sCallBack:function(data){
        callback && callback(data);
      }
    };
    this.request(param);
  }
}

export {Category};