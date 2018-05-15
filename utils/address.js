import { Base } from "base.js";

class Address extends Base{
  constructor(){
    super();
  }

  /**
   * 拼接出一个完整的详情地址
   * @param:
   * res Object 包含地址信息的一个对象
   */
  setAddressInfo(res){
    var provice = res.provinceName || res.province,
      city = res.cityName || res.city,
      country = res.countyName || res.country,
      detail = res.detailInfo || res.detail;
    var totalDetail = city + country + detail;
    // 城市是否为直辖市，是将不加省名
    if(!this.isCenterCity(city)){
      totalDetail = provice + totalDetail;
    }
    return totalDetail;
  }

  /**
   * 城市是否为直辖市
   * @param:
   * city 城市名
   */
  isCenterCity(city){
    var centerCity = ["北京市", "上海市", "天津市", "重庆市"];
    var flag = centerCity.indexOf(city) >= 0;
    return flag;
  }

  /**
   * 将发送请求添加或更新地址信息
   * @param:
   * data Object 地址信息
   * callback function 回调函数
   */
  submitAddress(data, callback){
    // 转化数据格式
    var data = this._setupAddress(data);
    var param = {
      url: "address",
      method: "POST",
      data: data,
      sCallBack:function(res){
        callback && callback(true, res);
      },
      eCallback(res){
        callback && callback(false, res);
      }
    };
    this.request(param);
  }

  /**
   * 将地址地址信息对象转化为符合服务器接口的数据格式
   * @param:
   * data 添加或更新的地址信息对象
   */
  _setupAddress(data){
    var formData = {
      name: data.userName,
      mobile: data.telNumber,
      province: data.provinceName,
      city: data.cityName,
      country: data.countyName,
      detail: data.detailInfo,
    };
    return formData;
  }

  /**
   * 发送http请求获取地址
   */
  getAddress(callback){
    var that = this;
    var param = {
      url: "address",
      sCallBack: function(res){
        if(res){
          res.totalDetail = that.setAddressInfo(res);
          callback && callback(res);
        }
      }
    };
    this.request(param);
  }
}

export {Address};