// Java support variables
var IS_JAVA_SUPPORTED = false;
var JAVA_TO_JAVASCRIPT_CALLED = false;

/** 
 * Definition of the custom context menu.
 * It will inherit from google.maps.OverlayView class.
 * We will have to implement the methods onAdd(), draw(), onRemove() methods.
 * Further details at: https://developers.google.com/maps/documentation/javascript/reference?hl=en#OverlayView
**/

/* ContextMenu constructor */
function GMapsContextMenu(gmap, menuItems, options){
	this.mapDiv=gmap.map.getDiv();
	this.menuItems = menuItems || {};
	this.options = options || {};
	this.pixelOffset = this.options.pixelOffset || new google.maps.Point(5,-5);
	this.cssClassName = this.options.cssClassName || 'gmaps_context_menu';
	this.isVisible = false;
	this.setMap(gmap.map);
}
GMapsContextMenu.prototype=new google.maps.OverlayView();
GMapsContextMenu.prototype.constructor = GMapsContextMenu;

/* draw() method implementation from google.maps.OverlayView */
GMapsContextMenu.prototype.draw=function(){
	if(this.isVisible) {
		var mapSize=new google.maps.Size(this.mapDiv.offsetWidth, this.mapDiv.offsetHeight);
		var menuSize=new google.maps.Size(this.menu.offsetWidth, this.menu.offsetHeight);
		var mousePosition=this.getProjection().fromLatLngToDivPixel(this.position);
		
		var left=mousePosition.x;
		var top=mousePosition.y;
		
		if(mousePosition.x>mapSize.width-menuSize.width-this.pixelOffset.x){
			left=left-menuSize.width-this.pixelOffset.x;
		} else {
			left+=this.pixelOffset.x;
		}
		
		if(mousePosition.y>mapSize.height-menuSize.height-this.pixelOffset.y){
			top=top-menuSize.height-this.pixelOffset.y;
		} else {
			top+=this.pixelOffset.y;
		}
		
		this.menu.style.left=left+'px';
		this.menu.style.top=top+'px';		
	}
};

/* onAdd() method implementation from google.maps.OverlayView */
GMapsContextMenu.prototype.onAdd=function() {
	function createMenuItem(menuItem) {
		var menuItemDIV = document.createElement('div');
		menuItemDIV.innerHTML=menuItem.label;
		menuItemDIV.className=menuItem.cssClassName;
		//menuItemDIV.style.cssText='cursor:pointer; white-space:nowrap'; // FIXME - move to css class
		if(!menuItem.isMenuHead) {
			menuItemDIV.onclick=function() {
				google.maps.event.trigger($this, 'menu_item_selected', $this.position, menuItem.eventName);
			}
		}
		return menuItemDIV;	
	}
	
	function createMenuItemSeparator(menuItem) {
		var menuSeparatorDIV = document.createElement('div');
		menuSeparatorDIV.className=menuItem.cssClassName;
		return menuSeparatorDIV;
	}
	
	var $this = this;
	
	var menuDIV = document.createElement('div');
	menuDIV.className = this.cssClassName;
	//menuDIV.style.cssText = 'display: none; position: absolute';	// FIX - move to css class ???
	
	for(var i=0; i<this.menuItems.length; i++){
		if(this.menuItems[i] instanceof GMapsMenuItemSeparator) {
			menuDIV.appendChild(createMenuItemSeparator(this.menuItems[i]));
		} else {
			menuDIV.appendChild(createMenuItem(this.menuItems[i]));
		}
	}

	this.menu=menuDIV;
	this.position=new google.maps.LatLng(0, 0);
	
	google.maps.event.addListener(this.map, 'click', function(mouseEvent){
		$this.hide();
	});
	
	this.getPanes().floatPane.appendChild(this.menu);
};

/* onRemove() method implementation from google.maps.OverlayView */
GMapsContextMenu.prototype.onRemove=function(){
	this.menu.parentNode.removeChild(this.menu);
};

/* Checks if the context menu is visible */
GMapsContextMenu.prototype.getVisible=function(){
	return this.isVisible;
};

/* Hides the context menu */
GMapsContextMenu.prototype.hide=function(){
	if(this.isVisible){
		this.menu.style.display='none';
		this.isVisible=false;
	}
};

/* Shows the context menu */
GMapsContextMenu.prototype.show=function(latLng){
	if(!this.isVisible){
		this.menu.style.display='block';
		this.isVisible=true;
	}
	this.position=latLng;
	this.draw();
};

/** 
 * Definition of the classes for different menu item types 
**/

/* Generic menu item */
function GMapsMenuItem(label,eventName,cssClassName) {
	this.label = label;
	this.eventName = eventName;
	this.cssClassName = cssClassName || 'gmaps_context_menu_item';
	this.isMenuHead = false;
	this.isMenuSeparator = false;
}

/* Menu item head (i.e: a title) */
function GMapsMenuItemHead(label,eventName,cssClassName) {
	GMapsMenuItem.call(this, label || '',eventName,cssClassName);
	this.cssClassName = cssClassName || 'gmaps_context_menu_head';
	this.isMenuHead = true;
}
GMapsMenuItemHead.prototype=new GMapsMenuItem();
GMapsMenuItemHead.prototype.constructor = GMapsMenuItemHead;

/* Menu separator */
function GMapsMenuItemSeparator(cssClassName) {
	this.label = null;
	this.eventName = null;
	this.cssClassName = cssClassName || 'gmaps_context_menu_separator';
	this.isMenuHead = false;
	this.isMenuSepartor = true;
}
GMapsMenuItemSeparator.prototype=new GMapsMenuItem(); 
GMapsMenuItemSeparator.prototype.constructor = GMapsMenuItemSeparator;

/**
 * Map and Marker classes
**/
function GMapsMap(mapDIV,mapOptions) {
	this.map=new google.maps.Map(mapDIV,mapOptions);
	this.mapMarkers = [];
	this.selectedMarker = null;

	var $this=this;
	google.maps.event.addListener($this.map, 'zoom_changed', function() {
		if(!JAVA_TO_JAVASCRIPT_CALLED) {
	    	if(IS_JAVA_SUPPORTED) javaCall_UpdateZoomLevel($this.getZoom());
	    }
	    JAVA_TO_JAVASCRIPT_CALLED=false;
	});
	
	google.maps.event.addListener($this.map, 'center_changed', function() {
    	if(IS_JAVA_SUPPORTED) javaCall_UpdateMapCenter($this.getCenter().lat(),$this.getCenter().lng());
  	});	
}
GMapsMap.prototype.constructor=GMapsMap;

// Adds a new marker to the map
GMapsMap.prototype.addMarker=function(latLng,markerOptions){
	var $this = this;
	markerOptions = markerOptions || {};
	var marker = new google.maps.Marker({ 
		position: latLng, map: $this.map, 
		draggable: markerOptions.draggable || true, animation: markerOptions.animation || google.maps.Animation.DROP});
	google.maps.event.addListener(marker, 'position_changed', function() {
		var markerIdx = $this.mapMarkers.indexOf(marker);
    	if(IS_JAVA_SUPPORTED) javaCall_UpdateMarkerPosition(marker.getPosition().lat(), marker.getPosition().lng(),markerIdx);
	});
	google.maps.event.addListener(marker, 'rightclick', function(mouseEvent){
		$this.selectedMarker = marker;
		google.maps.event.trigger($this.map, 'rightclick', mouseEvent);
	});
	$this.mapMarkers.push(marker);
	
	if(IS_JAVA_SUPPORTED) javaCall_AddMarker(latLng.lat(), latLng.lng(),true,google.maps.Animation.DROP,true,true);
};

// Clears all the markers from the map
GMapsMap.prototype.clearAllMarkers=function(){
	for (var i = 0; i < this.mapMarkers.length; i++) {
        this.mapMarkers[i].setMap(null);
	}
	this.mapMarkers = [];
	this.selectedMarker = null;
	if(IS_JAVA_SUPPORTED) javaCall_ClearMarkers();
};

// Makes the specified marker bounce
GMapsMap.prototype.bounceMarker=function(markerIdx){
	var $this = this;
	for (var i = 0; i < $this.mapMarkers.length; i++) {
		if(markerIdx == i) {
			$this.mapMarkers[i].setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function () {$this.mapMarkers[i].setAnimation(null);}, 3000);
		}
		else {
			$this.mapMarkers[i].setAnimation(null);
		}
	}	
};

// Removes from the map the marker specified by the indexing position
GMapsMap.prototype.removeMarkerByIndex=function(markerIdx){
	this.mapMarkers[markerIdx].setMap(null);
   	if(markerIdx != -1) {
		this.mapMarkers.splice(markerIdx, 1);
	}
	if(!JAVA_TO_JAVASCRIPT_CALLED) {
	   	if(IS_JAVA_SUPPORTED) javaCall_DelMarker(markerIdx);
	}
	JAVA_TO_JAVASCRIPT_CALLED=false;
};

// Removes the specified marker from the map
GMapsMap.prototype.removeMarker=function(marker){
	var markerIdx = this.mapMarkers.indexOf(marker);
	this.removeMarkerByIndex(markerIdx);
};

// Removes the currently selected marker
GMapsMap.prototype.removeSelectedMarker=function(){
	if(this.selectedMarker!==null) {
		this.removeMarker(this.selectedMarker);
		this.selectedMarker = null;
	}
};

// Increase the the zoom of 1 unit or using the specified value
GMapsMap.prototype.increaseZoom=function(zoomGap){
	this.map.setZoom(this.map.getZoom()+(zoomGap || 1));
};

// Decrease the the zoom of 1 unit or using the specified value
GMapsMap.prototype.decreaseZoom=function(zoomGap){
	this.map.setZoom(this.map.getZoom()-(zoomGap || 1));
};

/** Wrapper functions of the google.maps.Map class */
GMapsMap.prototype.setZoom=function(newZoom){
	this.map.setZoom(newZoom);
};

GMapsMap.prototype.getZoom=function(){
	return this.map.getZoom();
};

GMapsMap.prototype.getCenter=function(){
	return this.map.getCenter();
};

GMapsMap.prototype.setCenter=function(lat,lng){
	this.map.setCenter(lat,lng);
};

GMapsMap.prototype.panTo=function(latLng){
	this.map.panTo(latLng);
};