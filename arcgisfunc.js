define([
    "esri/config",
    "esri/Map",
    "esri/Basemap",
    "esri/layers/WebTileLayer",
    "esri/views/SceneView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Legend",
    "esri/layers/support/LabelClass",
    "dojo/domReady!"
], function (
    esriConfig, Map, Basemap, WebTileLayer, SceneView, FeatureLayer, Legend, LabelClass
) {
    var resSym = {
        type: "polygon-3d", // autocasts as new PolygonSymbol3D()
        symbolLayers: [{
            type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
            material: {
                color: "#FC921F"
            },
            edges: {
                type: "solid",
                color: "#72420d",
                size: 1.5
            }
        }]
    };

    var condoSym = {
        type: "polygon-3d", // autocasts as new PolygonSymbol3D()
        symbolLayers: [{
            type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
            material: {
                color: "#9E559C"
            },
            edges: {
                type: "solid",
                color: "#4c294b",
                size: 1.5
            }
        }]
    };

    var renderer = {
        //type: "simple", // autocasts as new UniqueValueRenderer()
        type: "unique-value",
        defaultSymbol: {
            type: "polygon-3d", // autocasts as new PolygonSymbol3D()
            symbolLayers: [{
                type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
                material: {
                    color: "#A7C636"
                },
                edges: {
                    type: "solid",
                    color: "#4d5b18",
                    size: 1.5
                }
            }]
        },
        defaultLabel: "Other",
        field: "FWCS",
        uniqueValueInfos: [{
            value: 0,
            symbol: resSym,
            label: "DLGI301A"
        }],
        visualVariables: [{
                type: "size",
                field: feature => (feature.attributes.FWCS + 1) * 3,
                valueUnit: "meters"
            },
            /*                     {
                                    type: "color",
                                    field: function (x) {
                                        return (x.attributes.FWCS + 1) * 3;
                                    },
                                    stops: [{
                                            value: 0,
                                            color: "#4a0069"
                                        },
                                        {
                                            value: 100,
                                            color: "#b300ff"
                                        }
                                    ]
                                } */
        ]
    };
    var labelClass = new LabelClass({
        symbol: {
            type: "label-3d", // autocasts as new LabelSymbol3D()
            symbolLayers: [{
                type: "text", // autocasts as new TextSymbol3DLayer()
                material: {
                    color: "white"
                },
                size: 10
            }]
        },
        labelPlacement: "above-right",
        labelExpressionInfo: {
            expression: "$feature.FID"
        }
    });

    // Set the renderer on the layer
    var buildingsLyr = new FeatureLayer({
        url: "http://124.133.27.90:6080/arcgis/rest/services/jnbuilding_demo/mapserver/0",
        renderer: renderer,
        popupTemplate: { // autocasts as new PopupTemplate()
            title: "建筑物信息",
            content: [{
                type: "fields",
                fieldInfos: [{
                        fieldName: "FID",
                        label: "要素ID"
                    }, {
                        fieldName: "YSDM",
                        label: "要素代码"
                    }, {
                        fieldName: "DWMC",
                        label: "分类名称"
                    },
                    {
                        fieldName: "FWCS",
                        label: "房屋层数"
                    }
                ]
            }]
        },
        outFields: ["FID", "YSDM", "DWMC", "FWCS"]
    });

    // setup the renderer with size and color visual variables
    var pointrenderer = {
        type: "simple", // autocasts as new SimpleRenderer()
        symbol: {
            type: "point-3d", // autocasts as new PointSymbol3D()
            symbolLayers: [{
                type: "icon",
                size: 0
            }] // autocasts as new IconSymbol3DLayer()
        },
        // visualVariables: [{
        //     // size each icon based on the airport's elevation
        //     type: "size",
        //     field: "FWCS",
        //     stops: [{
        //             value: 0,
        //             size: 2
        //         },
        //         {
        //             value: 6,
        //             size: 35
        //         }
        //     ]
        // }, {
        //     // shade each airport a different color based on its type
        //     type: "color",
        //     field: "FWCS",
        //     stops: [{
        //             value: 0,
        //             color: [252, 12, 245]
        //         },
        //         {
        //             value: 3,
        //             color: [83, 0, 244]
        //         },
        //         {
        //             value: 7,
        //             color: [4, 245, 248]
        //         }
        //     ]
        // }]
    };

    var pointsLayer = new FeatureLayer({
        url: "http://124.133.27.90:6080/arcgis/rest/services/jnbuilding_demo/mapserver/0",
        elevationInfo: {
            // elevation mode that will place points on top of the buildings or other SceneLayer 3D objects
            mode: "relative-to-ground",
            offset: 1,
            featureExpressionInfo: {
                expression: "($feature.FWCS+1)*3"
            },
            unit: "meters"
        },
        renderer: pointrenderer,
        outFields: ["*"],
        labelingInfo: [{
            labelExpressionInfo: {
                value: "{FID}"
            },
            symbol: {
                type: "label-3d", // autocasts as new LabelSymbol3D()
                symbolLayers: [{
                    type: "text", // autocasts as new TextSymbol3DLayer()
                    material: {
                        color: "white"
                    },
                    // we set a halo on the font to make the labels more visible with any kind of background
                    halo: {
                        size: 1,
                        color: [50, 50, 50]
                    },
                    size: 10
                }]
            }
        }],
        labelsVisible: true
    });

    esriConfig.request.corsEnabledServers
        .push("cartodb-basemaps-a.global.ssl.fastly.net",
            "cartodb-basemaps-b.global.ssl.fastly.net",
            "cartodb-basemaps-c.global.ssl.fastly.net",
            "cartodb-basemaps-d.global.ssl.fastly.net");
    var tiledLayer = new WebTileLayer({
        urlTemplate: "https://cartodb-basemaps-{subDomain}.global.ssl.fastly.net/dark_all/{level}/{col}/{row}.png",
        subDomains: ["a", "b", "c", "d"]
    });
    var stamen = new Basemap({
        baseLayers: [tiledLayer]
    });

    var map = new Map({
        // basemap: stamen,
        basemap: 'streets',
        layers: [buildingsLyr, pointsLayer],
        ground: "world-elevation",
    });

    var view = new SceneView({
        container: "viewDiv",
        map: map,
        viewingMode: 'local',
        camera: {
            position: {
                x: 117.04021,
                y: 36.67090,
                z: 129
            },
            heading: 300,
            tilt: 75
        }
    });

    return {
        map: map,
        view: view
    }

    // //   map.add(buildingsLyr);
    // var legend = new Legend({
    //     view: view
    // });

    //view.ui.add(legend, "bottom-right");
});