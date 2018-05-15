import { Config } from 'config.js';
import { Token } from "token.js";

class Base{
  constructor(){
    this.baseRequestUrl = Config.restUrl;
  }

  /**
   * 定义一个统一调用微信请求api的方法，用于发送网络请求
   * @param  请求参数
   * @noRefetch boolean 当为true时，不再做未授权重试机制
   */
  request(param, noRefetch){
    var url = this.baseRequestUrl + param.url;
    var that = this;
    if(!param.method){
      param.method = 'GET';
    }
    wx.request({
      url: url,
      data: param.data,
      method: param.method,
      header: {
        'content-type': 'application/json',
        'token': wx.getStorageSync('token')
      },
      success:function(res){
        // 读取http响应状态码
        var code = res.statusCode.toString();
        var startChar = code.charAt(0);

        // 状态码是2开头表示请求成功
        if(startChar == "2"){
          // 先确定属性值是否存在，再调用
          param.sCallBack && param.sCallBack(res.data);
        } else {
          // 当状态码为401时，表示token令牌无效或过期，无权限访问，则去发送http请求获取token
          // 后，再重新发送请求
          if(code == "401"){
            // noRefetch为true时，表示已经重新发送过了请求，之后将不再重复请求
            if(!noRefetch){
              that._refetch(param);
            }
          } else {
            // 当不是token令牌无效或过期引起的请求失败时调用
            param.eCallback && param.eCallback(res.data);
          }

        }
      },
      fail:function(res){
        console.log(res);
      }
    });
  }

  /**
   * 先去获取token后，再去重新发送请求
   * param 请求参数
   */
  _refetch(param){
    var token = new Token();
    token.getTokenFromServer((token)=>{
      this.request(param, true);
    });
  }

  /* 获取元素上的绑定的值 */
  getDataSet(event, key){
    return event.currentTarget.dataset[key];
  }
}

export { Base };