var jsonaddrs = ['asset/maptalksdemo.json', 'asset/jinanxiuzheng.json'];
var centers = [[-74.01164278497646, 40.70769573605318], [117.04021, 36.67090]]
var demoidx = 0;
// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('main'));
$.getJSON(jsonaddrs[demoidx], function (buildingsGeoJSON) {
    var featureobjs = [buildingsGeoJSON, buildingsGeoJSON.features];
    var builds = featureobjs[demoidx].map(function (feature) {
        var jsonheights = [feature.height || 100, feature.properties==null?null:(feature.properties.FWCS + 1) * 3 || 100]
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
            value: Math.random() * 1,
            height: feature.properties.height,
            itemStyle: {
                color: [1,1,1,1],
                borderColor: 'red'
            }
        };
    });


    $.getJSON('asset/data-1524055280228-SkugT242f.json', function (linesData) {
        var data = linesData.features;

        var hStep = 300 / (data.length - 1);
        var taxiRoutes = [];
        var i = 0;
        for (var x in data) {
            var lnglats = data[x].geometry.coordinates
            taxiRoutes.push({
                coords: lnglats,
                lineStyle: {
                    color: echarts.color.modifyHSL('#5A94DF', Math.round(hStep * x))

                },
                value: Math.random() * 200
            })
        }

        myChart.setOption({
            maptalks: {
                center: centers[demoidx],
                zoom: 14,
                pitch: 55,
                baseLayer: {
                    'urlTemplate': 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                    'subdomains': ['a', 'b', 'c', 'd']
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
                        //texture: '/asset/data-1491838644249-ry33I7YTe.hdr',
                        exposure: 1,
                        diffuseIntensity: 0.5,
                        specularIntensity: 2
                    }
                }
            },
            series: [
                {
                    type: 'map3D',
                    coordinateSystem: 'maptalks',
                    map: 'buildings',
                    data: regionsData,
                    shading: 'realistic',
                    silent: true,
                    instancing: true,
                    realisticMaterial: {
                        metalness: 1,
                        roughness: 0.2,
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

        var maptalksIns = myChart.getModel().getComponent('maptalks').getMaptalks();
        maptalksIns.on('click', function (e) {
            console.log(e)
        })

    });



});

window.addEventListener('resize', function () {
    myChart.resize();
});