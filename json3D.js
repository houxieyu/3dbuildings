//获取url传递参数
var request = GetRequest();
var area = request['area'];
if(!area) area = '370102001';
var techidx = request['tech'];
if(!techidx) techidx = 0;
var coloridx = request['color'];
if(!coloridx) coloridx = 0;
//console.log(request)
var effect = request['effect'];
if(!effect || effect=='0' || effect=='false') effect = true;
//初始全局参数
var jsonaddrs = ['asset/maptalksdemobuilding.json', 'asset/jnx/'+area+'.json'];
var jsonidx = 1;
var initzoom = $('#zoom').val();
var initbearing = $('#bearing').val();
var initpitch = $('#pitch').val();
var techs = ['maptalks', 'mapbox'];
var vmcolors =[
        ['#696868', '#594e76', '#635177', '#7b5675', '#94596d', '#da6b58', '#ff6029', '#f23e19', '#e42e16'],
        ['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'],
        ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
    ] //aaron


//获取浏览器的url参数
function GetRequest() {   
    var url = location.search; //获取url中"?"符后的字串   
    var theRequest = new Object();   
    if (url.indexOf("?") != -1) {   
       var str = url.substr(1);   
       strs = str.split("&");   
       for(var i = 0; i < strs.length; i ++) {   
          theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);   
       }   
    }   
    return theRequest;   
 }   

/* 相机参数 
 * bearing：水平方位角-180~180
 * pitch:俯视角0~90，0度垂直向下，90度水平
 * zoom:0~20 20离地面最近
 */
// 基于准备好的dom，初始化echarts实例
function getrandom(min, max) {
    return parseInt(Math.random() * (max - min + 1) + min, 10);
}
var myChart = echarts.init(document.getElementById('main'));
$('#loading').text('正在加载建筑数据...');
console.log(new Date().toLocaleTimeString() + ' load building data start');
$.getJSON(jsonaddrs[jsonidx], function (buildingsGeoJSON) {
    //初始化mapbox参数
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWFyb242NjYiLCJhIjoiY2o2M2NmZmJ4MWc0ZDJxbnI3dmZ5OXB2MSJ9.T3trJ5Tu66Kw-w-1ELpzBA';
    var mapboxgl_style = 'mapbox://styles/mapbox/dark-v9';
    //记录加载时长
    console.log(new Date().toLocaleTimeString() + ' load building data end');
    var featureobjs = [buildingsGeoJSON, buildingsGeoJSON.features];
    //计算中心位置
    var allcoords = [];
    var buildcount = 0;
    //生成建筑物几何数据
    var builds = featureobjs[jsonidx].map(function (feature) {
        buildcount += feature.geometry.coordinates.length
        allcoords.push([feature.geometry.coordinates[0][0][0][0],feature.geometry.coordinates[0][0][0][1]])
        if(feature.properties.LAYERNUM==0)feature.properties.LAYERNUM=1
        var jsonheights = [feature.height || 100, feature.properties == null ? null : feature.properties.LAYERNUM * 3 || 100]
        var jsonpolys = [feature.polygon, feature.geometry == null ? null : feature.geometry.coordinates[0][0]]
        feature.properties.name = parseInt(Math.random() * 100000).toString() + feature.properties.NAME;
        feature.properties.height = jsonheights[jsonidx]
        return feature;
    })
    //格式化建筑物数量字符串格式为逗号分隔
    $('#count_builds').text(buildcount.toLocaleString('arab'))
    //计算几何中心
    var centercoord = allcoords.reduce(function(x1,x2){
        return [(x1[0]+x2[0])/2,(x1[1]+x2[1])/2]
    })
    echarts.registerMap('buildings', {
        "features": builds
    });
    var regionsData = builds.map(function (feature) {
        return {
            name: feature.properties.name,
            value: feature.properties.height,
            height: feature.properties.height,
        };
    });
    var roads = ['asset/maptalksdemoroad.json', 'asset/jnroad_demo.json']
    $('#loading').text('正在加载道路数据...');
    console.log(new Date().toLocaleTimeString() + ' load road data start');
    $.getJSON(roads[jsonidx], function (linesData) {
        console.log(new Date().toLocaleTimeString() + ' load road data end');
        $('#count_roads').text(linesData.features.length.toLocaleString('arab'))
        var data = linesData.features;

        var hStep = 300 / (data.length - 1);
        var taxiRoutes = [];
        var i = 0;
        console.log(new Date().toLocaleTimeString() + ' create road data start');
        for (var x in data) {
            var coords = [data[x].geometry.coordinates, data[x].geometry.coordinates[0]];
            var lnglats = coords[jsonidx];
            taxiRoutes.push({
                coords: lnglats,
                lineStyle: {
                    color: echarts.color.modifyHSL('#5A94DF', Math.round(hStep * x))
                },
                value: Math.random() * 30
            })
        }
        console.log(new Date().toLocaleTimeString() + ' create road data end');
        $('#loading').text('开始渲染');
        var light = {
            main: { //主光源
                intensity: 1, //强度
                shadow: true, //阴影
                shadowQuality: 'mudium'
            },
            ambient: { //全局环境光
                intensity: 0, //强度
            },
            ambientCubemap: { //环境光纹理
                texture: 'asset/maptalksdemotexture.hdr',
                exposure: 0.5, //曝光
                diffuseIntensity: 1, //漫反射强度
                specularIntensity: 0.5 //高光反射强度
            }
        };
        var postEffect = {
            enable: effect,
            FXAA: {
                enable: true
            },
            temporalSuperSampling:{
                enable:true
            }
        };
        var realisticMaterial = { //真实材质
            metalness: 0.5, //金属度
            roughness: 0 //粗糙度
        };

        //var lightoption
        var maptalks = {
            center: centercoord,
            zoom: parseInt(initzoom),
            pitch: initpitch,
            baseLayer: {
                'urlTemplate': 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                'subdomains': ['a', 'b', 'c', 'd']
                // 'urlTemplate' : 'http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1',
                // 'subdomains'  : [0,1,2,3,4,5,6,7,8,9],
            },
            altitudeScale: 2,
            postEffect: postEffect,
            light: light,
        };
        var mapbox = {
            center: centercoord,
            zoom: 16,
            pitch: 50,
            bearing: -10,
            style: mapboxgl_style,
            zlevel: 10,
            postEffect: postEffect,
            light: light,
        };
        var echartoption = {
            visualMap: {
                show: false,
                min: 3,
                max: 30,
                inRange: {
                     color:vmcolors[coloridx]
                }
            },
            series: [{
                    type: 'map3D',
                    coordinateSystem: techs[techidx],
                    map: 'buildings',
                    data: regionsData,
                    silent: true,
                    instancing: true,
                    shading: 'realistic', //着色效果,color、lambert、realistic
                    realisticMaterial: realisticMaterial,
                    label: {
                        show: true,
                        formatter: (data) => {
                            // if (parseInt(data.name) > 60000) return data.name.substring(5);
                            // else return '';
                            if (parseInt(data.value) >= 18) return data.name.substring(5);
                            else return '';
                        },
                        textStyle: {
                            fontSize: 14,
                            fontWeight: 'bold'
                        }
                    }
                },
                {
                    type: 'lines3D',
                    coordinateSystem: techs[techidx],
                    effect: {
                        show: true,
                        constantSpeed: 1,
                        trailWidth: 3,
                        trailLength: 1,
                        trailOpacity: 1,
                        spotIntensity: 10
                    },

                    blendMode: 'lighter',

                    polyline: true,

                    data: {
                        count: function () {
                            return taxiRoutes.length;
                        },
                        getItem: function (idx) {
                            return taxiRoutes[idx]
                        }
                    }
                }
            ]
        };

        echartoption[techs[techidx]] = eval(techs[techidx]);

        myChart.setOption(echartoption);
        console.log(new Date().toLocaleTimeString() + ' set map option end');
        if (techidx == 0)
            var maptalksIns = myChart.getModel().getComponent('maptalks').getMaptalks();
            else
            var mapboxIns = myChart.getModel().getComponent('mapbox').getMapbox();
        // maptalksIns.on('click', function (e) {
        //     console.log(e)
        //     console.log(maptalksIns.getView());
        // });
        myChart.on('click', function (params) {
            // 控制台打印数据的名称
            console.log(params);
        });
        $('#but_animation').click(function () {
            var camerpars={};// = maptalksIns.getView();
            console.log(camerpars);
            camerpars.center = centercoord;
            camerpars.zoom = getrandom(14, 20);
            camerpars.pitch = getrandom(0, 90);
            camerpars.bearing = getrandom(-180, 180);
            try {
                if(techidx == 0)
                    maptalksIns.animateTo(camerpars, {
                        duration: 10000
                    });
                else  mapboxIns.flyTo(camerpars, {
                    speed: 0.1,
                    curve: 1, // change the speed at which it zooms out

                    // This can be any easing function: it takes a number between
                    // 0 and 1 and returns another number between 0 and 1.
                    easing: function (t) {
                        return t;
                    }
                });
            } catch (err) {}
            console.log(camerpars);
        });
        $('#but_exeanimation').click(function () {
            var camerpars = maptalksIns.getView();
            console.log(camerpars);
            camerpars.center = centercoord;
            camerpars.zoom = $('#zoom').val();
            camerpars.pitch = $('#pitch').val();
            camerpars.bearing = $('#bearing').val();
            maptalksIns.animateTo(camerpars, {
                duration: 5000
            });
            console.log(camerpars);
        });
        $('#but_lable').click(function () {
            echartoption.series[0].label.show = !(echartoption.series[0].label.show);
            myChart.setOption(echartoption);
        });
        $('#loading').text('');
        $('#buildinfo').show();
    });



});

window.addEventListener('resize', function () {
    myChart.resize();
});