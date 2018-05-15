// pages/cart/cart.js
import { Cart } from "cart-model.js";

var cart = new Cart();

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏 
   */
  onHide: function(){
    // 对修改后的购物车数据进行更新缓存
    cart.execSetStorageSync(this.data.cartData);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 读取购物车信息
    var cartData = cart.getCartDataFromLocal(false);
    // 读取购物车里商品的各种总数
    var cartTotal = this._calcTotalAccountAndCounts(cartData);
    this.setData({
      cartData: cartData,
      account: cartTotal.account,
      selectedCounts: cartTotal.selectedCounts,
      selectedTypeCounts: cartTotal.selectedTypeCounts
    });
  },

  /**
   * 获取选中的商品的总价格、总数、种类数
   * @param:
   * data Array 购物车数据
   */
  _calcTotalAccountAndCounts:function(data){
    // 选中的商品的总价格
    var account = 0;
    // 选中的商品总数
    var selectedCounts = 0;
    // 选中的商品的种类数
    var selectedTypeCounts = 0;
   
    let multiple = 100;

    for(let i = 0; i < data.length; i++){
      // 乘multiple（100）是为了避免对浮点数进行运算时出现如
      // 0.05 + 0.01 = 0.060 000 000 000 005 的问题，该问题产生的值可能会直接显示在视图上
      if(data[i].selectStatus){
        account += data[i].counts * multiple * data[i].price * multiple;
        selectedCounts += data[i].counts;
        selectedTypeCounts++;
      }
    }

    return {
      account: account / (multiple * multiple),
      selectedCounts: selectedCounts,
      selectedTypeCounts: selectedTypeCounts
    };
  },

  /**
   * 点击购物车里的商品勾选框时触发
   */
  toggleSelect:function(event){
    var id = cart.getDataSet(event, 'id'),
      status = cart.getDataSet(event, 'status'),
      index = this.getProductIndexById(id);
      this.data.cartData[index].selectStatus = !status;
      this.resetCartData();
  },

  /**
   * 更新购物车信息（商品状态、已选商品总数、已选商品种类数、已选商品总价格）
   */
  resetCartData:function(){
    var newData = this._calcTotalAccountAndCounts(this.data.cartData);
    this.setData({
      cartData: this.data.cartData,
      account: newData.account,
      selectedCounts: newData.selectedCounts,
      selectedTypeCounts: newData.selectedTypeCounts
    }); 
  },

  /**
   * 通过商品id获取商品在购物车里对应的下标位置
   * @param:
   * id int 商品id
   */
  getProductIndexById:function(id){
    var cartData = this.data.cartData;
    for(let i = 0; i < cartData.length; i++){
      if(cartData[i].id == id){
        return i;
      }
    }
  },

  /**
   * 点击“全选”按钮时触发。如果存在有未选中商品时，改为全选中。如果是全选中时，则改为全未选中
   */
  toggleSelectAll:function(event){
    // 获取“全选”按钮状态，当为true时，表示已全选，否则表示未全选
    var status = cart.getDataSet(event, 'status') == "true",
      cartData = this.data.cartData;
    // 遍历改变商品选择状态
    for(let i = 0; i < cartData.length; i++){
      cartData[i].selectStatus = !status;
    }
    this.resetCartData();
  },

  /**
   * 点击“+”或“-”修改商品数量时触发，对对应商品数目进行修改
   */
  changeCounts:function(event){
    var id = cart.getDataSet(event, 'id'),
      // 获取修改数目类型（是添加还是减少）
      type = cart.getDataSet(event, 'type'),
      index = this.getProductIndexById(id),
      counts = 1;
      if(type == "add"){
       // 将商品数目修改后，更新购物车缓冲，以便重新进入购物车页面时，显示的数                               // 目是修改后的
        cart.addCounts(id);
      } else {
        counts = -1;
        cart.cutCounts(id);   // 将商品数目修改后，更新购物车缓冲
      }

      // 商品数量不能够小于1，当减少数量等于1时，将不能再减少数量(可在css中禁用该组件事件)
      if(this.data.cartData[index].counts + counts >= 1){
        // 更新购物车信息，实时显示修改的商品数目
        this.data.cartData[index].counts += counts;
        this.resetCartData()
      };
  },

  // 点击“×”按钮时触发，从购物车中删除对应商品
  delete:function(event){
    var id = cart.getDataSet(event, "id");
    var index= this.getProductIndexById(id);
    // 将商品从购物车中移除
    this.data.cartData.splice(index, 1);
    // 更新显示购物车
    this.resetCartData();
    // 更新缓存移除商品后的购物车数据
    cart.delete(id);
  },

  /**
   * 点击下单触发，跳转到订单页面
   */
  submitOrder:function(event){
    wx.navigateTo({
      url: "../order/order?account=" + this.data.account + "&from=cart",
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})