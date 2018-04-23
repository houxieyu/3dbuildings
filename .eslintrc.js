module.exports = {
    "env": {
        'browser': true,
        'commonjs': true,
        'es6': true
    },
    "extends": "eslint:recommended",
    "parser": "babel-eslint",
    "rules": {
        "linebreak-style": [
            "error",
            "windows"
        ],
        "semi": [
            "error",
            "always"
        ]
    },
    "globals":{
        __dirname:true
    }
};