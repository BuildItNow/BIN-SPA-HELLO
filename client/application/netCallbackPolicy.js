define(["bin/core/netPolicy/netCallbackPolicy"], function(Base)
{
    var Class = {};

    Class.before = function(params) 
    {
        return Base.prototype.before.call(this, params);
    }

    Class.success = function(data, textStatus, xhr, netParams)
    {
        return Base.prototype.success.call(this, data, textStatus, xhr, netParams);
    }

    Class.error = function(xhr, textStatus, netParams)
    {
        return Base.prototype.error.call(this, xhr, textStatus, netParams);
    }

    return Base.extend(Class);
});