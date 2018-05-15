import { Base } from '../../utils/base.js';

class Home extends Base{
  constructor(){
    super();
  }

  /**
   * 调用基类request()方法，发送网络请求获取banner信息
   * @id  
   * @callBack  回调函数
   */
  getBannerData(id, callBack){
    var params = {
      url: 'banner/' + id,
      // 将回调函数用函数再次封装后给微信请求api，用于请求成功后异步调用，再次封装可实现对请求回来的
      // 数据进行过滤
      sCallBack: function(res){
        callBack && callBack(res.items);
      }
    };
    this.request(params);
  }

  // 获取首页主题
  getThemeData(ids, callBack){
    var params = {
      url: 'theme?ids=' + ids,
      sCallBack: function(res){
        callBack && callBack(res);
      }
    };
    this.request(params);
  }
  
  // 获取首页最近产品
  getRecentProductData(count, callBack){
    var params = {
      url: 'product/recent?count=' + count,
      sCallBack:function(res){
        callBack && callBack(res);
      }
    };
    this.request(params);
  }
}

export {Home};