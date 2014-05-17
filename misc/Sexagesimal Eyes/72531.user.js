// ==UserScript==
// @name Sexageismal Eyes
// @Author Veridis
// @description Converts all numbers on the page into Community Standard Sexagesimal for easy reading.
// @include *
// ==/UserScript==

/*
TODO/Bug list:

Percentages don't work. percents = per 100

*/

//the font that you wish to apply. You must have this installed.
var fontFamily = 'Sexagesimal';
var className = 'sexagesimal_number';
var TEXT_NODE = unsafeWindow.Node.TEXT_NODE;
var reDecimal = /\b(\+|-)?([\d,]+)(\.)?(\d+)?\b/;

var decToSex = function(){
	var decToSexMap = ['0','1','2','3','4','5','6','7','8','9',
			'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
			'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x'];
	
	return function(number){
		
		var negative = '';
		if (number < 0){
			var negative = '-';
		}
		
		number = number.toString().split('.');
		var integer = Math.abs(number[0]);
		var fraction = number[1];
		var result = '';
		
		do {
			result = decToSexMap[integer % 60] + result;
			integer = parseInt(integer / 60);
		} while (integer > 0);
		
		if (fraction){
			var decimalPlaces = fraction.toString().length;
			result += '.';
			fraction = parseFloat('.' + fraction);
			
			var x = 0;
			do {
				x++;
				var res = (fraction * 60).toString().split('.');
				result = result + decToSexMap[res[0]];
				
				if (res[1]) {
					fraction = parseFloat('.' + res[1]);
				}
				else {
					break;
				}
			} while (x < decimalPlaces);
		}
		return negative + result;
	}
}();

var parseTextNode = function(textNode) {
	var match = reDecimal(textNode.data);
		
	if (match === null) {
		return;
	}
	
	var rightTextNode = textNode.splitText(match.index);
	
	var number = rightTextNode.data.substr(0,match[0].length),
		span = document.createElement('span');
	
	span.innerHTML = decToSex(number);
	span.title = number;
	span.className = className;
	span.style.fontFamily = fontFamily;
	
	rightTextNode.parentNode.insertBefore(span, rightTextNode);
	rightTextNode.data = rightTextNode.data.substr(match[0].length);
	
	parseTextNode(rightTextNode);
}

var init = function(){
	var elems = Array.prototype.slice.call(document.body.getElementsByTagName('*'));
	var elem;
	var child;
	while (elem = elems.shift()) {
		var children = Array.prototype.slice.call(elem.childNodes);
		while (child = children.shift()) {
			if (
				child.nodeType ===  TEXT_NODE
				&& child.parentNode.className !== className
				&& child.parentNode.nodeName !== 'TEXTAREA'
				&& child.parentNode.nodeName !== 'SCRIPT'
				&& child.parentNode.nodeName !== 'STYLE' 
				&& child.parentNode.nodeName !== 'PRE' 
				&& child.parentNode.nodeName !== 'CODE' 
			) {
				parseTextNode(child);
			}
		}
	}
};

init();