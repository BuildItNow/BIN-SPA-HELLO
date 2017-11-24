define(
["mine/client"], 
function(Client)
{
	var Super = bin.ui.NaviPageView;
	var Class = {};

    Class.vmData = 
    {
        oldPassword: "",
        newPassword: "",
        conPassword: ""
    }

	Class.posGenHTML = function()
	{
	}

    Class.vmMethod_submit = function()
    {
        var oldPassword = this.vm.oldPassword;
        var newPassword = this.vm.newPassword;
        var conPassword = this.vm.conPassword;

        if(!oldPassword)
        {
            bin.hudManager.showStatus("请输入原始密码");

            return ;
        }

        if(!newPassword)
        {
            bin.hudManager.showStatus("请输入新的密码");

            return ;
        }

        if(!conPassword)
        {
            bin.hudManager.showStatus("请输入确认密码");

            return ;
        }

        if(newPassword !== conPassword)
        {
            bin.hudManager.showStatus("确认密码不一致");

            return ;
        }

        if(newPassword === oldPassword)
        {
            bin.hudManager.showStatus("新的密码和原始密码一致");

            return ;
        }

        Client.updatePassword(oldPassword, newPassword).then(function(netData)
        {
            if(netData.code == 0)
            {
                bin.hudManager.showStatus("操作成功");
                bin.naviController.pop();
            }
        });
    }

	return Super.extend(Class);
});