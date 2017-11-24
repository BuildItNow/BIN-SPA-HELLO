define(
[], 
function()
{
	var Super = bin.ui.View;
	var Class = {};

    Class.vmData = 
    {
        user: 
        {
            name: "BIN",
            desc: "K-I-S-S<br/>A lightweight frontend framework"
        }
    }

	Class.posGenHTML = function()
	{
	}

    Class.vmMethod_showStatus = function()
    {
        bin.hudManager.showStatus("This is a status tips");
    }

    Class.vmMethod_showIndicator = function()
    {
        var i = bin.hudManager.startIndicator();

        setTimeout(function()
        {
            bin.hudManager.stopIndicator(i);
        }, 1000);
    }

    Class.vmMethod_showAlert = function()
    {
        bin.hudManager.alert({
            message: 
            {
                text: "This is a alert tips"
            },
            title:
            {
                text: "Alert title"
            },
            buttons:
            [
                {text: "Yes", onClick: function(view)
                {
                    bin.hudManager.showStatus("Yes choosed");
                }},
                {text: "No", onClick: function(view)
                {
                    bin.hudManager.showStatus("No choosed");
                }}
            ]
        });
    }

    Class.vmMethod_select = function()
    {
        bin.hudManager.select({
            options:
            [
                {text: "Option A", value:"A"},
                {text: "Option B", value:"B"},
                {text: "Option C", value:"C"},
            ],
            current: "B",
            callback: function(data)
            {
                bin.hudManager.showStatus(data.text+" selected");
            }
        });
    }

    Class.vmMethod_datePick = function()
    {
        bin.hudManager.datePicker(function(date)
        {
            bin.hudManager.showStatus(date.strDate);
        });
    }

	return Super.extend(Class);
});