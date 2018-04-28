var jsonaddrs = ['asset/maptalksdemobuilding.json', 'asset/jnbuilding_wgs84.json'];
var centers = [
    [-74.01164278497646, 40.70769573605318],
    [117.04021, 36.67090]
]
var demoidx = 0;
var initzoom = $('#zoom').val();
var initbearing = $('#bearing').val();
var initpitch = $('#pitch').val();
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
$.getJSON(jsonaddrs[demoidx], function (buildingsGeoJSON) {
    console.log(new Date().toLocaleTimeString() + ' load building data end');
    var featureobjs = [buildingsGeoJSON, buildingsGeoJSON.features];
    $('#count_builds').text(featureobjs[demoidx].length.toLocaleString('arab'))
    var builds = featureobjs[demoidx].map(function (feature) {
        var jsonheights = [feature.height || 100, feature.properties == null ? null : (feature.properties.FWCS + 1) * 3 || 100]
        var jsonpolys = [feature.polygon, feature.geometry == null ? null : feature.geometry.coordinates[0][0]]
        return {
            "type": "Feature",
            "properties": {
                "name": parseInt(Math.random()*100000).toString(),
                "height": jsonheights[demoidx]
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [jsonpolys[demoidx]]
            }

        }

    })

    echarts.registerMap('buildings', {
        "features": builds
    });
    var regionsData = builds.map(function (feature) {
        return {
            name: feature.properties.name,
            value: feature.properties.height,
            height: feature.properties.height,
            itemStyle: {
                color: [1, 1, 1, 1],
                borderColor: 'red'
            }
        };
    });
    var roads = ['asset/maptalksdemoroad.json', 'asset/jnroad.json']
    $('#loading').text('正在加载道路数据...');
    console.log(new Date().toLocaleTimeString() + ' load road data start');
    $.getJSON(roads[demoidx], function (linesData) {
        console.log(new Date().toLocaleTimeString() + ' load road data end');
        $('#count_roads').text(linesData.features.length.toLocaleString('arab'))
        var data = linesData.features;

        var hStep = 300 / (data.length - 1);
        var taxiRoutes = [];
        var i = 0;
        console.log(new Date().toLocaleTimeString() + ' create road data start');
        for (var x in data) {
            var coords = [data[x].geometry.coordinates, data[x].geometry.coordinates[0]];
            var lnglats = coords[demoidx];
            taxiRoutes.push({
                coords: lnglats,
                lineStyle: {
                    color: echarts.color.modifyHSL('#5A94DF', Math.round(hStep * x))

                },
                value: Math.random() * 200
            })
        }
        console.log(new Date().toLocaleTimeString() + ' create road data end');
        $('#loading').text('开始渲染');
        myChart.setOption({
            visualMap: {
                show: false,
                min: 3,
                max: 100,
                inRange: {
                    color: ['#696868', '#594e76', '#635177', '#7b5675', '#94596d', '#da6b58', '#ff6029', '#f23e19', '#e42e16'] //aaron
                }
            },
            maptalks: {
                center: centers[demoidx],
                zoom: parseInt(initzoom),
                pitch: initpitch,
                baseLayer: {
                    'urlTemplate': 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                    'subdomains': ['a', 'b', 'c', 'd']
                    // 'urlTemplate' : 'http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1',
                    // 'subdomains'  : [0,1,2,3,4,5,6,7,8,9],
                },
                altitudeScale: 2,
                postEffect: {
                    enable: true,
                    FXAA: {
                        enable: true
                    }
                },
                light: {
                    main: {
                        intensity: 1,
                        shadow: true,
                        shadowQuality: 'high'
                    },
                    ambient: {
                        intensity: 0.
                    },
                    ambientCubemap: {
                        //texture: 'asset/maptalksdemotexture.hdr',
                        exposure: 1,
                        diffuseIntensity: 0.5,
                        specularIntensity: 2
                    }
                }
            },
            series: [{
                    type: 'map3D',
                    coordinateSystem: 'maptalks',
                    map: 'buildings',
                    data: regionsData,
                    shading: 'realistic',
                    silent: true,
                    instancing: true,
                    realisticMaterial: {
                        metalness: 0,
                        roughness: 0.5
                    },
                    label:{
                        show:true,
                        formatter:(data) =>{
                            if(parseInt(data.name)>95000)return data.name;
                            else return '';
                        } ,
                        textStyle:{
                            fontSize:10,
                            fontWeight:'bold'
                        }
                    }
                },
                {
                    type: 'lines3D',
                    coordinateSystem: 'maptalks',
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
        });
        console.log(new Date().toLocaleTimeString() + ' set map option end');
        var maptalksIns = myChart.getModel().getComponent('maptalks').getMaptalks();
        // maptalksIns.on('click', function (e) {
        //     console.log(e)
        //     console.log(maptalksIns.getView());
        // });
        myChart.on('click', function (params) {
            // 控制台打印数据的名称
            console.log(params);
        });
        $('#but_animation').click(function () {
            var camerpars = maptalksIns.getView();
            console.log(camerpars);
            camerpars.center = centers[demoidx];
            camerpars.zoom = getrandom(14, 20);
            camerpars.pitch = getrandom(0, 90);
            camerpars.bearing = getrandom(-180, 180);
            try {
                maptalksIns.animateTo(camerpars, {
                    duration: 5000
                });
            } catch (err) {}
            console.log(camerpars);
        });
        $('#but_exeanimation').click(function () {
            var camerpars = maptalksIns.getView();
            console.log(camerpars);
            camerpars.center = centers[demoidx];
            camerpars.zoom = $('#zoom').val();
            camerpars.pitch = $('#pitch').val();
            camerpars.bearing = $('#bearing').val();
            maptalksIns.animateTo(camerpars, {
                duration: 5000
            });
            console.log(camerpars);
        });
        $('#loading').text('');
        $('#buildinfo').show();
    });



});

window.addEventListener('resize', function () {
    myChart.resize();
});