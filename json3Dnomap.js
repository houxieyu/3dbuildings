var jsonaddrs = ['asset/maptalksdemobuilding.json', 'asset/jnbuilding_wgs84.json'];
var centers = [[-74.01164278497646, 40.70769573605318], [117.04021, 36.67090]]
var demoidx = 1;
var initzoom =  $('#zoom').val();
var initbearing =  $('#bearing').val();
var initpitch =  $('#pitch').val();
/* 相机参数 
 * bearing：水平方位角-180~180
 * pitch:俯视角0~90，0度垂直向下，90度水平
 * zoom:0~20 20离地面最近
*/
// 基于准备好的dom，初始化echarts实例
function getrandom(min,max){
    return parseInt(Math.random()*(max-min+1)+min,10);
}
var myChart = echarts.init(document.getElementById('main'));
$.getJSON(jsonaddrs[demoidx], function (buildingsGeoJSON) {
    var featureobjs = [buildingsGeoJSON, buildingsGeoJSON.features];
    var builds = featureobjs[demoidx].map(function (feature) {
        var jsonheights = [feature.height || 100, feature.properties == null ? null : (feature.properties.FWCS + 1) * 3 || 100]
        var jsonpolys = [feature.polygon, feature.geometry == null ? null : feature.geometry.coordinates[0][0]]
        return {
            "type": "Feature",
            "properties": { "name": Math.random().toString(), "height": jsonheights[demoidx] },
            "geometry": { "type": "Polygon", "coordinates": [jsonpolys[demoidx]] }

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
    $.getJSON(roads[demoidx], function (linesData) {
        var data = linesData.features;

        var hStep = 300 / (data.length - 1);
        var taxiRoutes = [];
        var i = 0;
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

        myChart.setOption({
            globe:{
                show:false,
                environment: '#000'
            },
            visualMap: {
                show: false,
                min: 2,
                max: 35,
                inRange: {
                    color: ['#696868', '#594e76', '#635177', '#7b5675', '#94596d', '#da6b58', '#ff6029', '#f23e19', '#e42e16'] //aaron
                }
            },
           
  
            series: [
                {
                    type: 'map3D',
                    map: 'buildings',
                    data: regionsData,
                    //coordinateSystem:'wgs84',
                    shading: 'realistic',
                    silent: true,
                    instancing: true,
                    realisticMaterial: {
                        metalness: 0,
                        roughness: 0.5
                    },
                    environment:'#000'
                },
                {
                    type: 'lines3D',
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

 
        $('#loading').text('');
    });



});

window.addEventListener('resize', function () {
    myChart.resize();
});