var $menu = null;

function getMenuListStr(callback) {
    chrome.runtime.sendMessage({
        op: "get",
        key: "menuListStr"
    },
    function(response) {
        callback(response);
    });
}

getMenuListStr(function(resp) {
    var menuListStr = resp.menuListStr;
    if (!menuListStr) {
        return;
    }
    var rows = menuListStr.split("|");
    var menuList = [];
    $.each(rows,
    function(k, v) {
        var cols = v.split(":");
        var item = {};
        item.id = cols[0];
        item.op = cols[1];
        item.name = cols[2];
        item.bg = cols[3];
        item.color = cols[4];
        menuList.push(item);
    });
    init(menuList);
    console.debug(menuList);
});
function init(menuList) {
    $menu = $("<ul style='width: 200px'/>").appendTo(document.body);
    $.each(menuList,
    function(k, v) {
        var op = v.op == "u" ? "&uarr;": (v.op == "d" ? "&darr;": "-");
        $("<li/>").append($("<a href='#'>").append($("<span/>").html("Style").css({
            "background-color": v.bg,
            "color": v.color
        }), $("<span/>").html(" " + op + " " + v.name))).click(function() {
            $currentBugRow.data({
                "orig-color": "#" + v.color
            });
            $currentBugRow.css({
                "background-color": "#" + v.bg,
                "color": v.color
            });
            if (v.op == "u") {
                $currentBugRow.prependTo($tbody);
            } else if (v.op == "d") {
                $currentBugRow.appendTo($tbody);
            }
            refreshOrders();
            $menu.hide();
            return false;
        }).appendTo($menu);
    });
    $menu.hover(function() {
        $currentBugRow.siblings().each(function() {
            if ($(this).data("orig-color")) {
                $(this).css({
                    "color": $(this).data("orig-color")
                });
            }
        });
    },
    function() {}).menu().hide().css({
        opacity: 0.8
    });
    if (localStorage[keyPrefix + namedcmd]) {
        refreshUI();
    } else {
        refreshOrders();

    }
}
function refreshOrders() {
    localStorage[keyPrefix + namedcmd] = itemObjToStr();
}
function getBugId(selector) {
    if ($(selector).is(".first-child")) {
        return $(selector).find("a").html();
    } else {
        return $(selector).find(".first-child").find("a").html();
    }
}
function itemStrToObj() {
    var itemsStr = localStorage[keyPrefix + namedcmd].split("|");
    return $.map(itemsStr,
    function(v) {
        if (!v) {
            return;
        }
        var itemParams = v.split(":");
        var item = {
            id: itemParams[0],
            bg: itemParams[1],
            cl: itemParams[2]
        };
        return item;
    });
}
var items = null;
function refreshUI() {
    var itemMap = {};
    items = itemStrToObj();
    $tbody.children(".bz_bugitem").each(function() {
        itemMap[getBugId(this)] = this;
    });
    for (var i = 0; i < items.length; i++) {
        var item = itemMap[items[i].id];
        if (item) {
            if (items[i].bg) {
                $(item).css({
                    "background-color": items[i].bg
                });
            }
            if (items[i].cl) {
                $(item).css({
                    "color": items[i].cl
                });
            }
            $(item).appendTo($tbody);
        }
    }
}
function itemObjToStr() {
    items = $tbody.children(".bz_bugitem").map(function() {
        var me = this;
        return {
            id: getBugId(me),
            bg: $(me).css("background-color"),
            cl: $currentBugRow.is(me) ? $(me).data("orig-color") : $(me).css("color")
        };
    }).toArray();
    var array = [];
    $.each(items,
    function(k, v) {
        array.push([v.id, v.bg, v.cl].join(":"));
    });
    return array.join("|");
}
function param(key) {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}
var $currentBugRow = null;
var $tbody = $("table.bz_buglist tbody");
$tbody.sortable({
    update: function() {
        refreshOrders();
    }
}).children(".bz_bugitem").hover(function() {
    var me = this;
    $currentBugRow = $(me);
    $menu.show().position({
        of: me,
        at: "right top",
        my: "right top",
        collision: "flip flip"
    });
    if (!$(me).data("orig-color")) {
        $(me).data("orig-color", $(me).css("color"));
    }
    $(me).css({
        "color": "#00F"
    });
    $(me).siblings().each(function() {
        if ($(this).data("orig-color")) {
            $(this).css({
                "color": $(this).data("orig-color")
            });
        }
    });
},
function() {});

$tbody.children(".bz_bugitem").css({
    "background-color": "#fff"
});
var keyPrefix = "props_of_";
var timeoutToChangeColor = false;
var namedcmd = param("namedcmd") || "default";