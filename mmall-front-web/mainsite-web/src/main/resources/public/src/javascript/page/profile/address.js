/*
 * ------------------------------------------
 * 登录页
 * @version  1.0
 * @author   zzj(hzzhangzhoujie@corp.netease.com)
 * ------------------------------------------
 */
NEJ.define([
    'base/klass',
    'base/util',
    'pro/widget/module',
    'base/element',
    './address/address.js'
],function(_k,_u,_m,_e,List,_p,_o,_f,_r){
    /**
     * 页面模块基类
     * 
     * @class   _$$Module
     * @extends _$$Module
     */
	var _pro;
    _p._$$Module = _k._$klass();
    _pro = _p._$$Module._$extend(_m._$$Module);
    
    /**
     * 控件重置
     * @param  {Object} 配置参数
     * @return {Void}
     */
    _pro.__reset = function(_options){
        this.__super(_options);
        var list = new List();
        list.$inject('#address');
    };
    
    //设置side选中状态
    _pro.__setActive = function (classs) {
    	 var sideList = document.getElementById("m-side").getElementsByTagName("li");
    	 for ( var i = 0; i < sideList.length; i++) {
    		 if (sideList[i].getAttribute("class") == classs) {
    			 sideList[i].className = sideList[i].className + " active";
    		 }
    	 }
    };
    _pro.__setActive("address");
    // init page
    _p._$$Module._$allocate();
});