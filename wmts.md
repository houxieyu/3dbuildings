arcgis
Resolution: 2.388657133974685
Scale: 9027.977411
wmts:
<ScaleDenominator>8530.918335622802</ScaleDenominator>

学习cityengine model语言
arcgis个人授权，webscene
maptalks加载，webtile格式
LODS自适应，wmts地图加载，qgeo地图加载

http://t0.tianditu.com/img_c/wmts
http://t0.tianditu.com/vec_c/wmts?service=WMTS&request=GetCapabilities

http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/WMTS?service=WMTS&request=GetCapabilities
http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/WMTS/1.0.0/WMTSCapabilities.xml

https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/
https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/1.0.0/WMTSCapabilities.xml
arcgis的wmtslayer只识别带有rest风格，及有1.0.0/WMTSCapabilities.xml接口的服务
经测试geoq和自有服务器的wmts服务都未能成功
