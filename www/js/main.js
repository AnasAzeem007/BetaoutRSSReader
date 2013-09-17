//Title of the blog
var TITLE = "Betaout Blog";
//RSS url
var RSS = "http://www.betaout.com/blog/feed/";
//var RSS = "http://www.techtrouser.wordpress.com/blog/feed/";
//Stores entries
var entries = [];
var selectedEntry = "";
//var _viewCount = 10;
var pageNo = 1;
var DATADIR;
var ran;
var connected = false;

_a = document.getElementsByTagName('head')[0];
_script = document.createElement('script');
_script.type = 'text/javascript';
_script.async = true;
_script.src = 'http://amplify-staging.info/js/plugin/magic.js?var=' + Math.random();
_a.appendChild(_script);
_script.onload = function() {
    connected = true;
    //alert('success');
};
_script.onerror = function() {
    connected = false;
    //alert('error');
};

window.onload = function() {
    ran = window.localStorage.getItem('ran');
    if (ran == null && !connected) {
        //alert("1");
        alert('We need to have an active Internet connection at least for the first time');
    } else if (ran == null && connected) {
        //alert("2");
        console.log("first time");
        google.load("feeds", "1", {callback: initialize});
        window.localStorage['ran'] = 1;
    } else if (ran == 1 && !connected) {
        //alert("3");
        entries = JSON.parse(window.localStorage.getItem('page' + pageNo));
        renderEntries(entries);
    } else if (connected) {
//        //alert("4");
        google.load("feeds", "1", {callback: initialize});
    }
};

//online = function() {
//    console.log("online");
//    connected = true;
//    TITLE = "Betaout Blog";
//    //$("#header").html(TITLE);
//    $("#status").html("");
//};
//offline = function() {
//    console.log("offline");
//    connected = false;
//    TITLE = "Betaout Blog (Offline)";
//    //$("#header").text(TITLE);
//    $("#status").html("Offline");
//
//};
window.connectionerror = function() {
    console.log("connection error");
};


//listen for detail links
$(".contentLink").live("click", function() {
    selectedEntry = $(this).data("entryid");
});

function renderEntries(entries) {
    console.log("page " + pageNo);
    var s = '';
    $.each(entries, function(i, v) {
        s += '<li><a href="#contentPage" class="contentLink" data-entryid="' + i + '">' + v.title + '</a></li>';
    });
    $("#linksList").html(s);
    $("#linksList").listview("refresh");
    chkNext(pageNo);
    chkPrev(pageNo);
}
//Listen for Google's library to load
function initialize() {
    console.log('Anas ready to use google');
//    alert(RSS)
    var feed = new google.feeds.Feed(RSS);
    feed.setNumEntries(10);
    $.mobile.showPageLoadingMsg();
    feed.load(function(result) {
        $.mobile.hidePageLoadingMsg();
        if (!result.error) {
            entries = result.feed.entries;
            renderEntries(entries);

            try {
                window.localStorage['page' + pageNo] = JSON.stringify(entries);
            } catch (e) {
                if (e == QUOTA_EXCEEDED_ERR) {
                    alert('Quota exceeded!'); //data wasn't successfully saved due to quota exceed so throw an error
                }
            }
            renderEntries(entries);

        } else {
            alert(result.error.message);
            console.log("Anas Error - " + result.error.message);
            alert("No More Entries :-(");
            $('.next').css({
                display: 'none'
            });
        }
    });
}


//Listen for main page
$("#mainPage").live("pageinit", function() {
    //Set the title
    $("h1", this).text(TITLE);
    if (connected) {
        //alert('Hello');
        google.load("feeds", "1", {callback: initialize});
    }
});

$("#mainPage").live("pagebeforeshow", function(event, data) {
    if (data.prevPage.length) {
        $("h1", data.prevPage).text("");
        $("#entryText", data.prevPage).html("");
    }
    ;
});

//Listen for the content page to load
$("#contentPage").live("pageshow", function(prepage) {
    //Set the title
    $("h1", this).text(entries[selectedEntry].title);
    var contentHTML = "";
    contentHTML += entries[selectedEntry].content;
    contentHTML += '<p/><a href="' + entries[selectedEntry].link + '" class="fullLink" data-role="button">Read Entry on Site</a>';

    $("#entryText", this).html('<h3 class="ui-title" aria-level="1" role="heading">' + entries[selectedEntry].title + '</h3>' +
            '<p style ="font-weight:bold">' + entries[selectedEntry].author + '<p>' +
            contentHTML);
    $("#entryText .fullLink", this).button();
    setTimeout(function() {
        $('img').css({
            'height': 'auto',
            'max-width': '100%'
        });
    }, 1);

});

$(".next").live('click', function() {
    pageNo = pageNo + 1;
    if (pageNo > 1) {
        if (connected) {
            RSS = "http://www.betaout.com/blog/feed/?paged=" + pageNo;
            google.load("feeds", "1", {callback: initialize});
        } else {
            entries = JSON.parse(window.localStorage.getItem('page' + pageNo));
            renderEntries(entries);
        }
    }
});

$(".previous").live('click', function() {
    pageNo = pageNo - 1;
    //alert(pageNo);
    if (pageNo > 0) {
        RSS = "http://www.betaout.com/blog/feed/?paged=" + pageNo;
        //alert(RSS);

        if (connected) {
            google.load("feeds", "1", {callback: initialize});
        } else {
            entries = JSON.parse(window.localStorage.getItem('page' + pageNo));
            renderEntries(entries);
        }
    }
});

$(window).on("touchstart", ".fullLink", function(e) {
    e.preventDefault();
    window.inAppBrowser.showWebPage($(this).attr("href"));
});


function chkNext(page) {
    page = page + 1;
    if (connected) {
        var url = "http://www.betaout.com/blog/feed/?paged=" + page;
        var feedNext = new google.feeds.Feed(url);
        feedNext.load(function(resultNext) {
            var entriesNext = resultNext.feed.entries;
            console.log("Length " + entriesNext.length);
            if (entriesNext.length > 0) {
                $('.next').css({
                    display: 'initial'
                });
            } else {
                $('.next').css({
                    display: 'none'
                });
            }
        });
    } else {
        var entriesNext = JSON.parse(window.localStorage.getItem('page' + page));
        //console.log("Length"+entriesNext.length);
        if (entriesNext != null) {
            $('.next').css({
                display: 'initial'
            });
        } else {
            $('.next').css({
                display: 'none'
            });
        }
    }
}
function chkPrev(page) {
    //page = page - 1;
    if (page == 1) {
        //alert("chk prev : "+page);
        $('.previous').css({
            display: 'none'
        });
    }
    else {
        $('.previous').css({
            display: 'initial'
        });
    }

}