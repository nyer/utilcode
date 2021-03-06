/**
 * 配送地址选择
 *
**/

define([
	'base/global',
	'base/klass',
	'base/element',
	'base/util',
	'base/event',
	'util/event',
	'util/ajax/xdr',
	'{lib}util/chain/NodeList.js',
	],function(NEJ,_k,_e,_u,_t,_t1,_q,$,_p,_o,_f,_r){
	var _pro,
	_provinceCache=[],
	_cityCache={},
	_districtCache={};

	_p._$$AddressBox = _k._$klass();
	_pro = _p._$$AddressBox._$extend(_t1._$$EventTarget);

	// 控件重置
	_pro.__reset = function(_options){
		this.__parent = _options.parentNode;
		this.__remove = _options.remove;
		
		if(_options.data){
			this.__data = {
				isEdit : _options.data.isEdit || "true",
				provinceId:_options.data.provinceId,
				provinceName : _options.data.provinceName || "",
				cityId:_options.data.cityId,
				cityName : _options.data.cityName || "",
				districtId:_options.data.districtId,
				districtName : _options.data.districtName || ""
			};
			this.__initAddress();
		}else{
			this.__getProvince();
		}
		
	};
	_pro.__initAddress = function(){
		var areaId,areaName;
		if(this.__data.provinceId == 0){
			areaId = "000000";
			areaName = this.__data.provinceName;
		}else if(this.__data.cityId == 0){
			areaId = this.__data.provinceId + "0000";
			areaName = this.__data.provinceName + this.__data.cityName;
		}else if(this.__data.districtId == 0){
			areaId = this.__data.cityId + "00";
			areaName = this.__data.provinceName + this.__data.cityName + this.__data.districtName;
		}else{
			areaId = this.__data.districtId;
			areaName = this.__data.provinceName + this.__data.cityName + this.__data.districtName;
		}
		
		var addressStyle = this.__data.isEdit=="true" ? "editAddress col-sm-6" : "col-sm-6"; 
		var div = _e._$create('div',addressStyle);
		$(this.__parent)._$attr("areaId",areaId);
		$(this.__parent)._$attr("areaName",areaName);
		div.innerHTML = areaName;
		$(this.__parent)._$insert(div,'append');
		
		if(this.__data.isEdit=="true"){
			//编辑地址按钮
			var editBtn = _e._$create('span','caret');
			$(div)._$insert(editBtn,"append");
			//删除按钮
			var elm = _e._$create('label','btn btn-link j-flag');
			elm.innerHTML = '<span class="glyphicon glyphicon-remove"></span>';
			$(this.__parent)._$insert(elm,'append');
			_t._$addEvent(elm,'click',this.__removeAddress._$bind(this));
			_t._$addEvent(div,'click',this.__getProvince._$bind(this));
		}
	};
	_pro.__destroy = function(){
        this.__super();
    };
	
	_pro._$getProvinceId = function(){
		var index = this.__province.selectedIndex;
		var option = this.__province.options[index];
		var provinceId = option.value;
		return provinceId;
	};
	
	_pro._$getCityId = function(){
		if(this.__city){
			var index = this.__city.selectedIndex;
			var option = this.__city.options[index];
			var provinceId = option.value;
			return provinceId;
		}
		return '00';
	};
	
	_pro._$getDistrict = function(){
		if(this.__district){
			var index = this.__district.selectedIndex;
			var option = this.__district.options[index];
			var provinceId = option.value;
			return provinceId;
		}
		return '00';
	};
	
	_pro.__onChange = function(_type){
		switch(_type){
			case 'province':
				this.__removeSelectNode('city');
				this.__removeSelectNode('district');
				
				this.__getCity();
			break;
			case 'city':
				this.__removeSelectNode('district');
				
				this.__getDistrict();
			break;
		}
		this._$dispatchEvent('onChange',_type);
	};

	_pro.__doClearSelect = function(_select){
		if(!!_select){
			_select.options.length = 0;
		}
	};

	_pro.__setDefaultData = function(_type){
		if(!this.__data){
			return;
		}
		
		var node,code;
		switch(_type){
			case 'province':
				node = this.__province;
				code = this.__data.provinceId;
			break;
			case 'city':
				node = this.__city;
				code = this.__data.cityId;
			break;
			case 'district':
				node = this.__district;
				code = this.__data.districtId;
			break;
		}

		this.__setSelectOption(node,code);
	};

	_pro.__setSelectOption = function(_node,_code){
		for (var i=0;i<_node.options.length;i++) {
			var option = _node.options[i];
			if (option.value == _code) {
				option.selected = true;
			}
		}
	}

	_pro.__getProvince = function(){
		this.__parent.innerHTML = "";
		// 判断是否有缓存
		if (_provinceCache.length>0) {
			//console.log('xxxxx province cache');
			this.__addOptionsForSelectNode('province',_provinceCache);
			this.__getCity();
		} else {
			_q._$request('/location/provinceList',{
				type:'json',
				method:'GET',
				timeout:3000,
				progress : true,
				onload:this.__loadProvince._$bind(this),
	            onerror:this.__loadProvince._$bind(this)
			});
		}
	};
	
	_pro.__loadProvince = function(_data){
		if (_data.code==200) {
			_provinceCache = _data.result.list;
			this.__addOptionsForSelectNode('province',_provinceCache);
			this.__getCity();
		}
	};
   
	_pro.__getCity = function(){
		var index = this.__province.selectedIndex;
		var option = this.__province.options[index];
		var provinceId = option.value;
		
		// 如果provinceId = 00,表示全国
		if(provinceId == "00"){
			return;
		}
		
		var list = _cityCache[provinceId];
		if (list) {
			//console.log('xxxxx city cache');
			this.__addOptionsForSelectNode('city',list);
			this.__getDistrict();
		}
		else {
			_q._$request('/location/city?code='+provinceId,{
				type:'json',
				method:'GET',
				timeout:3000,
				progress : true,
				onload:this.__loadCity._$bind(this,provinceId),
	            onerror:this.__loadCity._$bind(this,provinceId)
			});
		}
	};

	_pro.__loadCity = function(_provinceId,_data){
		if (_data.code==200) {
			var list = _data.result.list;
			_cityCache[_provinceId] = list;
			this.__addOptionsForSelectNode('city',list);

			// 下载第一个城市对应的区
			this.__getDistrict();
		}
	};

	_pro.__getDistrict = function(){
		var index = this.__city.selectedIndex;
		var option = this.__city.options[index];
		var cityId = option.value;
		
		// 如果cityId = 00,表示全市，区不显示
		if(cityId == "00"){
			return;
		}
		
		var list = _districtCache[cityId];
		if (list) {
			//console.log('xxxxx district cache');
			this.__addOptionsForSelectNode('district',list);
		} else {
			_q._$request('/location/district?code='+cityId,{
				type:'json',
				method:'GET',
				timeout:3000,
				progress : true,
				onload:this.__loadDistrict._$bind(this,cityId),
	            onerror:this.__loadDistrict._$bind(this,cityId)
			});
		}
	};

	_pro.__loadDistrict = function(_cityId,_data){
		if (_data.code==200) {
			var list = _data.result.list;
			_districtCache[_cityId] = list;
			this.__addOptionsForSelectNode('district',list);
		}
	};
	_pro.__addOptionsForSelectNode = function(_type,_list)
	{
		var div = _e._$create('div','col-sm-2');
		var select = _e._$create('select','form-control');
		
		div.appendChild(select);

		for (var i =0;i<_list.length;i++) {
			var node = new Option(_list[i].name,_list[i].id);
			select.appendChild(node);
		}
		switch(_type){
			case 'province':
				$(this.__parent)._$insert(div,'append');
				var elm = _e._$create('label','btn btn-link j-flag');
				elm.innerHTML = '<span class="glyphicon glyphicon-remove"></span>';
				$(this.__parent)._$insert(elm,'append');
				_t._$addEvent(elm,'click',this.__removeAddress._$bind(this));
				this.__province = select;
				break;
			case 'city':
				$(this.__province.parentNode)._$insert(div,'after');
				this.__city = select;
				break;
			case 'district':
				$(this.__city.parentNode)._$insert(div,'after');
				this.__district = select;
				break;
		}
		
		// 添加change事件
		_t._$addEvent(select,'change',this.__onChange._$bind(this,_type));
		
		this.__setDefaultData(_type);
	};

	_pro.__removeAddress = function(){
		this.__remove(this.__parent);
	};
	_pro.__onClick = function(_type){
		switch(_type){
			case 'province' : 
				if(_provinceCache.length > 0) return;
				this.__getProvince();
				break;
			case 'city' : 
				if(_cityCache[this.__data.provinceId]) return;
				this.__getCity();
				break;
			case 'district' : 
				if(_districtCache[this.__data.cityId]) return;
				this.__getDistrict();
				break;
		}
	};
	_pro.__removeSelectNode = function(_type){
		var node;
		switch(_type){
			case 'province':
				node = this.__province;
			break;
			case 'city':
				node = this.__city;
			break;
			case 'district':
				node = this.__district;
			break;
		}
		
		if(node){			 
			_e._$remove(node.parentNode,false);
		}
	}
	return _p;
});