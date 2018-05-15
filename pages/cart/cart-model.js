import { Base } from "../../utils/base.js";

class Cart extends Base{
  constructor(){
    super();
    this._storageKeyName = 'cart';
  }

  /**
   * 将一条要购买的商品数据添加到购物车数组里
   * 要是该商品已在购物车，则只是改变商品数量
   * @item object 商品对象
   * @counts int 商品数量
   */
  add(item, counts){
    var cartData = this.getCartDataFromLocal(false);
    var isHasInfo = this._isHasThatOne(item.id, cartData);
    if(isHasInfo.index == -1){
      // 添加一条新的商品记录
      item.counts = counts;  // 商品数量
      item.selectStatus = true; // 商品状态（在购物车里是否为选中）
      cartData.push(item);
    } else {
      // 修改已经存在的商品数量
      cartData[isHasInfo.index].counts += counts;
    }
    // 保存新的购物车数据
    wx.setStorageSync(this._storageKeyName, cartData);
  }

  /**
   * 从缓存中获取购物车数据
   * flag boolean  是否对数据过滤，是，则过滤掉没有选中的商品
   */
  getCartDataFromLocal(flag){
    var res = wx.getStorageSync(this._storageKeyName);
    if(!res){
      // 购物车数据不存在时，赋值一个空数组
      res = [];
    }
    if(flag){
      var newData = [];
      for(let i = 0; i < res.length; i++){
        if(res[i].selectStatus){
          newData.push(res[i]);
        }
      }
      res = newData;
    }
    return res;
  }

  /**
   * 判断要添加的商品是否已经在购物车数据里，存在时，返回所在位置的下标
   * @param:
   * id int 商品id
   * arr array 购物车数组数据
   */
  _isHasThatOne(id, arr){
    var item;
    // 不存在，默认index为-1
    var result = { index: -1 };
    for(var i = 0; i < arr.length; i++){
      item = arr[i];
      if(item.id == id){
        // 存在，index为商品在购物车数组对应的下标，data为该商品原购物车里的数据
        result = {
          index: i,
          data: item
        }
        break;
      }
    }
    return result;
  }

  /**
   * 读取购物车里的商品总数
   * flag true 商品总数将根据产品选择状态（selectStatus）为true时计算
   * flag false 直接计算商品总数
   */
  getCartCounts(flag){
    var counts = 0;
    var cartData = this.getCartDataFromLocal(false);
    for(var key in cartData){
      if(flag){
        if(cartData[key].selectStatus){
          counts += cartData[key].counts;
        }
      } else {
        counts += cartData[key].counts;
      }
    }
    return counts;
  }

  /**
   * 修改对应商品数目
   * @param:
   * id int 商品id
   * counts int 数目
   */
  _changeCounts(id, counts){
    // 读取购物车信息
    var cartData = this.getCartDataFromLocal(false);
    // 获取商品在购物车数组里的下标位置
    var hasInfo = this._isHasThatOne(id, cartData);
    if(hasInfo.index != -1){
      // 商品数目大于1时才能进行修改
      if(hasInfo.data.counts + counts >= 1){
        cartData[hasInfo.index].counts += counts;
      }
    }
    // 更新本地缓存（购物车信息）
    wx.setStorageSync(this._storageKeyName, cartData);
  }

  /**
   * 增加对应商品数目  +1
   */
  addCounts(id){
    this._changeCounts(id, 1);
  }

  /**
   * 减少对应商品数目  -1
   */
  cutCounts(id){
    this._changeCounts(id, -1);
  }

  /**
   * 删除购物车的商品
   * @param:
   * ids  Array或int 商品id数组
   */
  delete(ids){
    // 单个商品非数组时，将其转化为数组
    if(!(ids instanceof Array)){
      ids = [ids];
    }
    var cartData = this.getCartDataFromLocal(false);
    // 遍历删除商品
    for(let i = 0; i < ids.length; i++){
      var hasInfo = this._isHasThatOne(ids[i], cartData);
      if(hasInfo.index != -1){
        // 将商品从购物车数组中移除
        cartData.splice(hasInfo.index, 1);
      }
    }
    // 更新购物车缓存
    wx.setStorageSync(this._storageKeyName, cartData);
  }

  /**
   * 执行缓存   （更新或保存）
   */
  execSetStorageSync(data){
    // 更新购物车缓存数据
    wx.setStorageSync(this._storageKeyName, data);
  }
}

export { Cart };