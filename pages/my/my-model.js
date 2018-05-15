import { Base } from "../../utils/base.js";

class My extends Base{
  constructor(){
    super();
  }

  /**
   * 获取用户信息
   */
  getUserInfo(callback){
    wx.login({
      success: function(){

        // 调用微信api获取用户信息（用户可在界面点击取消，将获取失败）
        wx.getUserInfo({
          success: function(res){
            typeof callback == "function" && callback(res.userInfo);
          },

          fail: function(res){
            typeof callback == "function" && callback({
              avatarUrl: "../../imgs/icon/user@default.png",
              nickName: "零食小贩"
            });
          }
        });

      }
    });
  }
}

export { My };