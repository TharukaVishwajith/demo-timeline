/* ----------------------------------
jQuery Timelinr 0.9.54
tested with jQuery v1.6+

Copyright 2011, CSSLab.cl
Free under the MIT license.
https://www.opensource.org/licenses/mit-license.php

instructions: http://www.csslab.cl/2011/08/18/jquery-timelinr/
---------------------------------- */

var event_details = {};

jQuery.fn.timelinr = function (options) {
	// default plugin settings
	settings = jQuery.extend({
		orientation: 'horizontal',		// value: horizontal | vertical, default to horizontal
		containerDiv: '#supertimeline',		// value: any HTML tag or #id, default to #timeline
		datesDiv: '#dates',			// value: any HTML tag or #id, default to #dates
		datesSelectedClass: 'selected',			// value: any class, default to selected
		datesSpeed: 'normal',			// value: integer between 100 and 1000 (recommended) or 'slow', 'normal' or 'fast'; default to normal
		// issuesDiv: '#issues',			// value: any HTML tag or #id, default to #issues
		issuesSelectedClass: 'selected',			// value: any class, default to selected
		issuesSpeed: 'fast',				// value: integer between 100 and 1000 (recommended) or 'slow', 'normal' or 'fast'; default to fast
		issuesTransparency: 0.2,				// value: integer between 0 and 1 (recommended), default to 0.2
		issuesTransparencySpeed: 500,				// value: integer between 100 and 1000 (recommended), default to 500 (normal)
		prevButton: '#prev',			// value: any HTML tag or #id, default to #prev
		nextButton: '#next',			// value: any HTML tag or #id, default to #next
		arrowKeys: 'false',			// value: true | false, default to false
		startAt: 1,					// value: integer, default to 1 (first)
		autoPlay: 'false',			// value: true | false, default to false
		autoPlayDirection: 'forward',			// value: forward | backward, default to forward
		autoPlayPause: 2000				// value: integer (1000 = 1 seg), default to 2000 (2segs)
	}, options);

	$(function () {
		// setting variables... many of them
		var howManyDates = $(settings.datesDiv + ' li').length;


		var widthContainer = $(settings.containerDiv).width();
		var heightContainer = $(settings.containerDiv).height();


		var widthDate = $(settings.datesDiv + ' li').width();
		var heightDate = $(settings.datesDiv + ' li').height();
		// set positions!
		if (settings.orientation == 'horizontal') {

			$(settings.datesDiv).width(widthDate * howManyDates).css('marginLeft', widthContainer / 2 - widthDate / 2);
			var defaultPositionDates = parseInt($(settings.datesDiv).css('marginLeft').substring(0, $(settings.datesDiv).css('marginLeft').indexOf('px')));
		} else if (settings.orientation == 'vertical') {

			$(settings.datesDiv).height(heightDate * howManyDates).css('marginTop', heightContainer / 2 - heightDate / 2);
			var defaultPositionDates = parseInt($(settings.datesDiv).css('marginTop').substring(0, $(settings.datesDiv).css('marginTop').indexOf('px')));
		}

		$(settings.datesDiv + ' a').click(function (event) {
			event.preventDefault();
			// first vars
			var whichIssue = $(this).text();
			var currentIndex = $(this).parent().prevAll().length;

			// now moving the dates
			$(settings.datesDiv + ' a').removeClass(settings.datesSelectedClass);
			$(this).addClass(settings.datesSelectedClass);
			if (settings.orientation == 'horizontal') {
				$(settings.datesDiv).animate({ 'marginLeft': defaultPositionDates - (widthDate * currentIndex) }, { queue: false, duration: 'settings.datesSpeed' });
			} else if (settings.orientation == 'vertical') {
				$(settings.datesDiv).animate({ 'marginTop': defaultPositionDates - (heightDate * currentIndex) }, { queue: false, duration: 'settings.datesSpeed' });
			}
			loadContent(event_details,parseInt(event.currentTarget.text));
		});

		// keyboard navigation, added since 0.9.1
		// if (settings.arrowKeys == 'true') {
		// 	if (settings.orientation == 'horizontal') {
		// 		$(document).keydown(function (event) {
		// 			if (event.keyCode == 39) {
		// 				$(settings.nextButton).click();
		// 			}
		// 			if (event.keyCode == 37) {
		// 				$(settings.prevButton).click();
		// 			}
		// 		});
		// 	} 
		// }
		// default position startAt, added since 0.9.3
		$(settings.datesDiv + ' li').eq(settings.startAt - 1).find('a').trigger('click');
		// autoPlay, added since 0.9.4
		if (settings.autoPlay == 'true') {
			setInterval("autoPlay()", settings.autoPlayPause);
		}
	});

};



$(document).ready(function () {
	let year = 2015;
	fetch('http://127.0.0.1:5500/data/meta.json')
		.then(response => response.json())
		.then(data => {
			event_details = data;

			// setTimeout(() => {
			// 	$(`a[href^="#${year}"]`).click();
			// }, 100);
			loadInitialContent(data)
			// loadContent(data, data.events[0].year);
		});
});

function loadInitialContent(data) {
	generateYearList(data.events.map(e => e.year));
	$(function () {
		$().timelinr({
			arrowKeys: 'true'
		})
	});
}

function loadContent(data, year) {

	$('#timeline-container').empty();
	$('#timeline-container').append(`<div id="lineCont">
	<div id="line"></div>
	<div id="span">Loading</div>
  </div>
  <div id="mainCont" class="container">
	<section id="timeline">
	</section>
  </div>`)

	// setTimeout(() => {
	// 	$(`a[href^="#${year}"]`).click();
	// }, 100);

	selectedYearData = data.events.find((e) => {
		return e.year === year
	});

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

	// setTimeout(() => {
	// 	loadEventData(year, function (selectedYearData) {
	// 		dates = selectedYearData.details.map(a => {
	// 			return `${a.date.substr(2, 2)}/${a.date.substr(0, 2)}/${a.date.substr(4)}`
	// 		})
	// 		nums = []
	// 		for (let i = 1; i <= selectedYearData.details.length; i++) {
	// 			nums.push(i);
	// 		}
	// 		generateEventViews(selectedYearData, 1);
	// 		makeCircles(dates);
	// 		bindBrowserEvents();
	// 	});
	// }, 3000);

}

function generateYearList(years) {
	$('#dates').empty();
	years.forEach(year => {
		$('#dates').append(`<li><a href="#${year}">${year}</a></li>`)
	});
}