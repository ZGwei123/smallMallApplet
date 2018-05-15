import { Config } from "config.js";

class Token{
  constructor(){
    this.verifyUrl = Config.restUrl + 'token/verify';
    this.tokenUrl = Config.restUrl + "token/user";
  }

  /**
   * 从缓存中获取token，存在，去校验是否过期，不存在，去服务器获取token
   */
  verify(){
    var token = wx.getStorageSync('token');
    if(token){
      this._veirfyFromServer(token);
    } else {
      this.getTokenFromServer();
    }
  }

  /**
   * 校验token是否过期，过期，则去服务器请求token
   */
  _veirfyFromServer(token){
    var that = this;
    wx.request({
      url: that.verifyUrl,
      method: "POST",
      data: {"token":token},
      success:function(res){
        var valid = res.data.isValid;
        // token是否过期
        if(!valid){
          that.getTokenFromServer();
        }
      }
    })
  }

  /**
   * 从服务器请求token，并缓存token
   */
  getTokenFromServer(callback){
    var that = this;
    // 调用微信login()api获取code，用code才能去服务器获取token
    wx.login({
      success:function(res){
        wx.request({
          url: that.tokenUrl,
          method: "POST",
          data: {code:res.code},
          success:function(res){
            wx.setStorageSync('token', res.data.token);
            callback && callback(res.data.token);
          }
        });
      }
    });
  }
}

export { Token };