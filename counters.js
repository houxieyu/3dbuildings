define(function(){
    var privateValue = 0;
    console.log("xxx")
    return {
        increment: function(){
            privateValue++;
        },

        decrement: function(){
            privateValue--;
        },

        getValue: function(){
            return privateValue;
        }
    };
});