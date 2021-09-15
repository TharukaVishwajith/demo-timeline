const META_FILE_PATH = '/data/meta.json';

//Sample dates

//For the purpose of stringifying MM/DD/YYYY date format
var monthSpan = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var monthSpanS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var dates = [];
var selectedYearData = {}
var nums = []

//Format MM/DD/YYYY into string
function dateSpan(date) {

    function addPadding(stringNum) {
        return stringNum.length === 1 ? stringNum.padStart(2, '0') : stringNum;
    }

    var month_ = date.split('/')[0];
    let month = monthSpan[month_ - 1];
    var day = date.split('/')[1];
    if (day.charAt(0) == '0') {
        day = day.charAt(1);
    }
    var year = date.split('/')[2];

    //Spit it out!
    return [month + " " + day + ", " + year, addPadding(day) + addPadding(month_) + year];
}

var c = 0;

//Main function. Draw your circles.
function makeCircles(dates) {
    //Forget the timeline if there's only one date. Who needs it!?
    if (dates.length < 2) {
        $("#line").hide();
        $("#span").show().text(dateSpan(dates[0])[0]);
        //This is what you really want.
    } else if (dates.length >= 2) {
        //Set day, month and year variables for the math
        var first = dates[0];
        var last = dates[dates.length - 1];

        var firstMonth = parseInt(first.split('/')[0]);
        var firstDay = parseInt(first.split('/')[1]);

        var lastMonth = parseInt(last.split('/')[0]);
        var lastDay = parseInt(last.split('/')[1]);

        //Integer representation of the last day. The first day is represnted as 0
        var lastInt = ((lastMonth - firstMonth) * 30) + (lastDay - firstDay);
        //Draw first date circle
        $("#line").append('<div data-item="' + dateSpan(dates[0])[1] + '" class="circle" id="circle0" style="left: ' + 0 + '%;"><div class="popupSpan">' + dateSpan(dates[0])[0] + '</div></div>');

        // $("#mainCont").append('<span id="span0" class="center">' + dateSpan(dates[0]) + '</span>');

        //Loop through middle dates
        for (i = 1; i < dates.length - 1; i++) {
            var thisMonth = parseInt(dates[i].split('/')[0]);
            var thisDay = parseInt(dates[i].split('/')[1]);

            //Integer representation of the date
            var thisInt = ((thisMonth - firstMonth) * 30) + (thisDay - firstDay);

            //Integer relative to the first and last dates
            var relativeInt = thisInt / lastInt;

            //Draw the date circle
            $("#line").append('<div data-item="' + dateSpan(dates[i])[1] + '" class="circle" id="circle' + i + '" style="left: ' + relativeInt * 100 + '%;"><div class="popupSpan">' + dateSpan(dates[i])[0] + '</div></div>');

            // $("#mainCont").append('<span id="span' + i + '" class="right">' + dateSpan(dates[i]) + '</span>');
        }

        //Draw the last date circle
        $("#line").append('<div data-item="' + dateSpan(dates[dates.length - 1])[1] + '" class="circle" id="circle' + i + '" style="left: ' + 99 + '%;"><div class="popupSpan">' + dateSpan(dates[dates.length - 1])[0] + '</div></div>');

        // $("#mainCont").append('<span id="span' + i + '" class="right">' + dateSpan(dates[i]) + '</span>');
    }

    $(".circle:first").addClass("active");
}





function retriveDataItemNo(ele) {
    return document.getElementById(ele).getAttribute('data-item')
}


function selectDate(selector) {
    $selector = "#" + selector;
    $spanSelector = $selector.replace("circle", "span");
    var current = $selector.replace("circle", "");

    $(".active").removeClass("active");
    $($selector).addClass("active");

    if ($($spanSelector).hasClass("right")) {
        $(".center").removeClass("center").addClass("left")
        $($spanSelector).addClass("center");
        $($spanSelector).removeClass("right")
    } else if ($($spanSelector).hasClass("left")) {
        $(".center").removeClass("center").addClass("right");
        $($spanSelector).addClass("center");
        $($spanSelector).removeClass("left");
    };
};

function generateContent(a) {
    $('#mainCont').empty();
    $('#mainCont').append(generateContentFromTemplate(a))
}

function generateContentFromTemplate(a) {
    return `<div class="row">
    <div class="col-md-8 mx-auto">
      <div class="card">
        <img class="card-img-top" src="https://cdn.britannica.com/73/189273-131-DA3E2F9A/Denali-peak-center-Alaska-Range-North-America.jpg" alt="Card image cap">
        <div class="card-body">
            <h5 class="card-title">Card title</h5>
            <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's
                content.</p>
            <a href="#" class="btn btn-primary">Go somewhere ${a}</a>
        </div>
    </div>
    </div>
  </div>`
}
console.log()


function getRelativeElements(num) {
    let relNos = 4;
    if (relNos / 2 >= num) {
        return nums.slice(0, relNos);
    } else if (num + relNos / 2 <= nums.length) {
        return nums.slice(num - 2, num + 2);
    } else {
        return nums.slice(nums.length - relNos, nums.length);
    }
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function loadEventData(year, callback) {
    readTextFile(META_FILE_PATH, function (text) {
        var data = JSON.parse(text);
        console.log(data);
        selectedYearData = data.events.find((e) => {
            return e.year === year
        });
        callback(selectedYearData);
    });
}

function generateEventViews(selectedYearData, event_index) {
    let d = selectedYearData.details.filter((e) => {
        return getRelativeElements(event_index).includes(e.index)
    });
    $('#timeline').empty();
    for (let i = 0; i < d.length; i++) {
        $('#timeline').append(getElement(d[i]))
    }
    function getElement(event) {
        return `<div class="tl-item" data-item="${event.date}">
                    <div class="tl-bg" style="background-image: url(data/${event.date.substr(4)}/${event.date}/event_image.jpg)"></div>
                    <div class="tl-date">
                        <p class="f2 heading--sanSerif">${monthSpanS[parseInt(event.date.substr(2, 2)) - 1]} ${event.date.substr(0, 2)}</p>
                    </div>
                    <div class="tl-content">
                        <h1 class="f3 text--accent ttu">${event.title}</h1>
                        <p>${event.short_description}</p>
                    </div>
                </div>`
    }
    bindBrowserEvents();
}

$(document).ready(function () {
    loadEventData(new Date().getFullYear() - 6, function (selectedYearData) {
        dates = selectedYearData.details.map(a => {
            return `${a.date.substr(2, 2)}/${a.date.substr(0, 2)}/${a.date.substr(4)}`
        })
        nums = []
        for (let i = 1; i <= selectedYearData.details.length; i++) {
            nums.push(i);
        }
        generateEventViews(selectedYearData, 1);
        makeCircles(dates);
        bindBrowserEvents();
    });
});

function bindBrowserEvents() {

    $(".circle").mouseenter(function (e) {
        $(this).addClass("hover");
        $(`.tl-item[data-item="${e.currentTarget.dataset.item}"]`).addClass("circlehover");
    });

    $(".circle").mouseleave(function (e) {
        $(this).removeClass("hover");
        $(`.tl-item[data-item="${e.currentTarget.dataset.item}"]`).removeClass("circlehover");
    });


    $(".tl-item").mouseenter(function (e) {
        $(`.circle[data-item="${e.currentTarget.dataset.item}"]`).addClass("hover");
    });

    $(".tl-item").mouseleave(function (e) {
        $(`.circle[data-item="${e.currentTarget.dataset.item}"]`).removeClass("hover");
    });

    $(".tl-item").click(function (e) {
        let spanNum = $(`.circle[data-item="${e.currentTarget.dataset.item}"]`).attr("id");
        selectDate(spanNum);
    });

    $(".circle").click(function (e) {
        var spanNum = $(this).attr("id");
        selectDate(spanNum);
        c = parseInt(spanNum.replace('circle', ''));
        if (!$(`.tl-item[data-item="${e.currentTarget.dataset.item}"]`).length) {
            generateEventViews(selectedYearData, c)
            $(`.tl-item[data-item="${e.currentTarget.dataset.item}"]`).addClass("circlehover");
        }
    });

    $('#timeline').bind('mousewheel', function (e) {
        console.log(e)
        if (e.originalEvent.wheelDelta / 120 > 0) {
            if (dates.length - 1 > c) {
                selectDate('circle' + ++c);
            }
        } else {
            if (c > 0) {
                selectDate('circle' + --c);
            }
        }
        generateEventViews(selectedYearData, c)
    });
}



