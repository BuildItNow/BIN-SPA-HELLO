define(
[], 
function()
{
    var Class = {};

    Class.updatePassword = function(oldPassword, newPassword)
    {
        return bin.netManager.doAPIEx({
            api: "api/updatePassword",
            data: {oldPassword:oldPassword, newPassword:oldPassword},
            type: "POST",
            options: {loading:"MODEL"}
        });
    }

    return Class;
});