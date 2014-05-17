Sexagesimal Eyes
================

Last update Mar 20, 2009

Converts all numbers on the page into Sexagesimal for easy reading.


<h3 name="overview">Overview</h3>

This extension converts base-ten decimal numbers into Sexageismal base-sixty numbers. Without the proper font installed it won't work, by default the font needs to be called "Sexagesimal" but it's easy to change if you have another font.

You can get <a href="http://autonomyseries.com/Canon/Sexagesimal/#resources">fonts</a> and read more about Community Standard Sexagesimal, the fictional number system used in the Autonomy series, <a href="http://autonomyseries.com/Canon/Sexagesimal/">here</a>.

If anyone knows of any other sexageismal fonts please post in the discussion and I'll add a link to them. Also if there's any interest I can update this to work with the Unicode Cuneiform characters that the Babylonian number system uses.

<h3>Images / Features</h3>

The <a href="http://en.wikipedia.org/wiki/Table_of_divisors">Table of divisors</a> on wikipedia:

<a href="http://g.imagehost.org/0122/sexagesima_wiki.png">
<img src="http://g.imagehost.org/t/0122/sexagesima_wiki.jpg">
</a>

The Table of divisors on wikipedia without a working font installed:

<a href="http://g.imagehost.org/0996/sexagesima_wiki_nofont.png">
<img src="http://g.imagehost.org/t/0996/sexagesima_wiki_nofont.jpg">
</a>

<h3>Updates</h3>

18 March 2009: Initial build.
18 March 2009: Fixed number separator bug.
20 March 2009: Copying numbers should now copy the original decimal numbers.
20 March 2009: Slight speed improvments.
20 March 2009: Added suffix support.

<h3>ToDo/Bug List</h3>

<u><i>Unicode</i></u>

Using 0-9A-Za-x as characters for sexageismal is way to cumbersome on sites that use javascript. The best solution is to use unicode, either somewhere in the private range <s>or using (probably better) the current space for Cuneiform characters</s>(cuneiform unicode isn't a single range).

<u><i>Optimisation</i></u>

Right now it can get very slow, specially where there are lots of numbers.

<u><i>Percentage Conversion, Hex numbers & Version strings</i></u>

Percentages should either not be converted or should be changed to have the correct ratio as normal percentages.

Numbers beginning with a '#' should be treated as hexadecimal and not be changed.

Version strings are problematic. i.e. "Firefox 3.1" means major version three and minor version one not version three and one tenth.

Parse strings like "12k" as 12,000 rounded up to the nearest 3,600?

<u><i>Titles</i></u>

Make it convert titles and image alt attributes.

<u><i>Nomenclature</i></u>

Convert number names (one, two, a hundred, etc) into Standard or Purist Sexageimal Nomenclature.

<u><i>Ajax & javascript</i></u>

Numbers that are created by javascript don't display correctly. 
<s>Maybe modify Number.prototype.toString to parse it as sexagesimal? Would parseInt need to be changed also? Would this cause more problems than it solves?</s> (Not an option)

<u><i>Input sexagesimal</i></u>

A way to input sexagesimal into text fields having it automatically converted to decimal. This really can't be added until unicode support is added.
The best idea I've had on the actual input method was inspired by <a href="http://www.thumbscript.com/howitworks.html">Thumbscript</a>. A single sexagesimal unit would be entered by typing two decimal numbers. For example :54: would by typed by typing a 4 then a 5.

[<b>Stuff finished</b>]

<u><i>Copying of sexagesimal</i></u> (<b>Added</b>)

When sexagesimal numbers are copied they should retain their original form. This will also fix plain text urls that get broken currently.
This would also prevent trouble with phone numbers.

<u><i>Numbers inside words</i></u> (<b>Decided</b>)

<s>Decide what to do about numbers that are inside words. i.e. "pdf2html converter", "john1654@gmail.com" and such. As well as numbers that are parts of words like "12:<b>30PM</b>"</s>

There will be a list of common suffixes (in, ft, pm, am, etc) as well as SI suffixes and base units that when following a decimal the number will be converted to sexagesimal. If there's not a match the number will be left alone.

Reviews
=======
[5Stars] Great script , Mar 29, 2009
Review written by Jean-Michel Smith

This is a great script if you're interested in having numerals displayed in base-60. It's not perfect (numbers written as 123,456,789 are treated as 3 distinct numbers, instead of one large number) but it works most of the time in most cases.

Very cool.

Disclaimer: I am the author of Autonomy and creator of Community Standard Sexagesimal.



Discussions
===========
Test Cases

Mar 20, 2009 12:49pm
AnnanFay Script's Author

Edit post

    

If there are any numbers which aren't converted or ones that are that shouldn't be post here.

This is also a list of test cases. Some don't currently work but they are being worked on.

The following cases should all be converted:

Normal decimal numbers
123
123.123123
10000000000000000000000
12e3
12.31e23

Comman suffixes
12:30pm
12:30AM
123ft

SI units
123km
123m
123ks

These should not be converted:

123FT
123KM
123eum
123ft_oaeu

12:30pmeou
12:30AM-oaeu

pdf2html
bob123@gmail.com




Comparison of Sexagesimal Display Methods

Mar 22, 2009 6:24pm
AnnanFay Script's Author

Edit post

    

My thoughts on the subject.

As decimals:

Like our system of displaying time except that commas are used to separate integers and a semicolon to separate the fraction from the integers.

Example:

56,4,15;12,54

As alphanumerals:

Like Hexadecimal notation and what SEyes currently uses.

Each number gets it's own character from the alphanumerical range (0-9, A-Z and a-z).
Base sixty only needs up to the lower case x.

This can be pretty unreadable and it's possible for numbers to look like words.

Example:

Sexagesimal = 17,343,649,622,725,519,007

One way to make it more readable is to assign the characters that represent a number their own font. This is what SEyes does.

Problems can occur when copying the numbers as they can lose their font face making them display as letters.

Unicode:

Assign each symbol a space on the unicode private range or try and get it accepted into the official space.

Would make it so that most unicode applications can display the symbols correctly. I can't think of any disadvantages.