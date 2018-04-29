// var myChart = echarts.init(document.getElementById('main'));
// $.getJSON('asset/map3Dexample.json', function (buildingsGeoJSON) {

var jsonaddrs = ['asset/map3Dexample.json', 'asset/jnbuilding_wgs84.json'];
var jsonidx = 0;
var effctsidx = 2;

var myChart = echarts.init(document.getElementById('main'));
$.getJSON(jsonaddrs[jsonidx], function (buildingsGeoJSON) {
    if (jsonidx == 1)
        buildingsGeoJSON.features = buildingsGeoJSON.features.map(function (feature) {
            return {
                "type": "Feature",
                "properties": {
                    "name": parseInt(Math.random() * 1000000).toString(),
                    "height": (feature.properties.FWCS + 1) * 3
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": feature.geometry.coordinates[0]
                }

            }
        })
    console.log(buildingsGeoJSON);
    echarts.registerMap('buildings', buildingsGeoJSON);
    var regions = buildingsGeoJSON.features.map(function (feature) {
        return {
            name: feature.properties.name,
            value: Math.max(Math.sqrt(feature.properties.height), 0.1),
            height: Math.max(Math.sqrt(feature.properties.height), 0.1)
        };
    }
);

    var options = [{
            series: [{
                type: 'map3D',
                map: 'buildings',
                shading: 'realistic',
                realisticMaterial: {
                    roughness: 0.6,
                    textureTiling: 20,
                    detailTexture: 'asset/woods.jpg'
                },
                postEffect: {
                    enable: true,
                    bloom: {
                        enable: false
                    },
                    SSAO: {
                        enable: true,
                        quality: 'medium',
                        radius: 10,
                        intensity: 1.2
                    },
                    depthOfField: {
                        enable: false,
                        focalRange: 5,
                        fstop: 1,
                        blurRadius: 6
                    }
                },
                groundPlane: {
                    show: true,
                    color: '#333'
                },
                light: {
                    main: {
                        intensity: 6,
                        shadow: true,
                        shadowQuality: 'high',
                        alpha: 30
                    },
                    ambient: {
                        intensity: 0
                    },
                    ambientCubemap: {
                        texture: 'asset/canyon.hdr',
                        exposure: 2,
                        diffuseIntensity: 1,
                        specularIntensity: 1
                    }
                },
                viewControl: {
                    minBeta: -360,
                    maxBeta: 360
                },

                itemStyle: {
                    areaColor: '#666'
                },

                label: {
                    textStyle: {
                        color: 'white'
                    }
                },

                silent: true,

                instancing: true,

                boxWidth: 200,
                boxHeight: 1,

                data: regions
            }]
        },
        {
            visualMap: {
                show: false,
                min: 0.4,
                max: 10,
                inRange: {
                    color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
                }
            },
            series: [{
                type: 'map3D',
                map: 'buildings',
                shading: 'realistic',
                environment: '#000',
                realisticMaterial: {
                    roughness: 0.6,
                    textureTiling: 20
                },
                postEffect: {
                    enable: true,
                    SSAO: {
                        enable: true,
                        intensity: 1.3,
                        radius: 5
                    },
                    screenSpaceReflection: {
                        enable: false
                    },
                    // depthOfField: {
                    //     enable: true,
                    //     blurRadius: 4,
                    //     focalDistance: 30
                    // }
                },
                light: {
                    main: {
                        intensity: 3,
                        alpha: 40,
                        shadow: true,
                        shadowQuality: 'high'
                    },
                    ambient: {
                        intensity: 0.
                    },
                    ambientCubemap: {
                        texture: 'asset/pisa.hdr',
                        exposure: 1,
                        diffuseIntensity: 0.5,
                        specularIntensity: 1
                    }
                },
                groundPlane: {
                    show: false,
                    color: '#333'
                },
                viewControl: {
                    panMouseButton:'left',
                    rotateMouseButton:'right'
                },


                itemStyle: {
                    areaColor: '#666'
                    // borderColor: '#222',
                    // borderWidth: 1
                },

                label: {
                    textStyle: {
                        color: 'white'
                    }
                },

                silent: true,

                instancing: true,

                boxWidth: 200,
                boxHeight: 1,

                data: regions
            }]
        },
        {
            backgroundColor: '#cdcfd5',
            geo3D: {
                map: 'buildings',
                shading: 'lambert',
    
                lambertMaterial: {
                    detailTexture: 'asset/woods.jpg',
                    textureTiling: 20
                },
    
                postEffect: {
                    enable: true,
                    SSAO: {
                        enable: true,
                        radius: 3,
                        quality: 'high'
                    }
                },
                groundPlane: {
                    show: true
                },
                light: {
                    main: {
                        intensity: 1,
                        shadow: true,
                        shadowQuality: 'high',
                        alpha: 30
                    },
                    ambient: {
                        intensity: 0
                    },
                    ambientCubemap: {
                        texture: 'asset/canyon.hdr',
                        exposure: 2,
                        diffuseIntensity: 0.3
                    }
                },
                viewControl: {
                    distance: 50
                },
    
                regionHeight: 0.5,
    
                regions: regions
            }
        }
    ]
    console.log(regions);
    myChart.setOption(options[effctsidx]);
    myChart.on('click', function (params) {
        // 控制台打印数据的名称
        console.log(params);
    });
})