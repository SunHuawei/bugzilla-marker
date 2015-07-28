function saveMenuList() {
    var menuListStr = $("#menuOptionList tr").not(":first").map(function() {
        return $(this).find("td").map(function() {
            return $(this).find("input, select").val();
        }).toArray().join(":");
    }).toArray().join("|");
    localStorage["menuListStr"] = menuListStr;
	
    var status = document.getElementById("status");
    status.innerHTML = "Options Saved.";
    setTimeout(function() {
        status.innerHTML = "";
    },
    750);
}

function restoreMenuList() {
    var menuListStr = localStorage["menuListStr"];
    if (!menuListStr) {
        return;
    }
    var rows = menuListStr.split("|");
    var $menuOptionList = $("#menuOptionList");
	$menuOptionList.find("tbody").sortable({
		update: function() {
			$menuOptionList.find(".index").each(function(k) {
				this.value = k;
			});
		}
	});
    $.each(rows,
    function(k, v) {
        var cols = v.split(":");
        $menuOptionList.append(buildRow(cols[0], cols[1], cols[2], cols[3], cols[4]));
    });
    applyColorPicker($menuOptionList.find(".colorPicker"));
}

function buildRow(index, op, name, bg, color) {
    return $("<tr>").append(
		$("<td>").append($("<input readonly/>").addClass("index").val(index)),
		$("<td>").append($("<select></select>").append($("<option/>").val("u").html("&uarr;"), $("<option/>").val("d").html("&darr;"), $("<option/>").val("-").html("-")).val(op)),
		$("<td>").append($("<input/>").val(name)),
		$("<td>").append($("<input/>").val(bg).addClass('colorPicker')),
		$("<td>").append($("<input/>").val(color).addClass('colorPicker')),
		$("<td>").append($("<button> - Del Row </button>").click(function() {
			$(this).parent().parent().remove();
			var $menuOptionList = $("#menuOptionList");
			$menuOptionList.find(".index").each(function(k) {
				this.value = k;
			});
		})),
		$("<td>").append($("<div/>").css({'width': 200, cursor: "n-resize"}).html("------"))
	);
}
document.addEventListener('DOMContentLoaded', restoreMenuList);
document.querySelector('#save').addEventListener('click', saveMenuList);
$("#addRow").click(function() {
    var $menuOptionList = $("#menuOptionList");
    $menuOptionList.append(buildRow($menuOptionList.find("tr").length - 1, "", "", "#FFF", "#000"));
    applyColorPicker($menuOptionList.find(".colorPicker"));
});

var f = $.farbtastic('#picker');
var p = $('#picker').css('opacity', 0.25);
var selected;
function applyColorPicker(widget) {
    $(widget).each(function() {
        f.linkTo(this);
        $(this).css('opacity', 0.75);
    }).focus(function() {
        if (selected) {
            $(selected).css('opacity', 0.75).removeClass('colorwell-selected');
        }
        f.linkTo(this);
        p.css('opacity', 1);
        $(selected = this).css('opacity', 1).addClass('colorwell-selected');
    });
}