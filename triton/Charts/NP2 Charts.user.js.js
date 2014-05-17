// ==UserScript==
// @name        NP2 Charts
// @description 
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game*
// @version     2
// @require     http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.3.0/lodash.js
// @require     http://userscripts.org/scripts/source/181520.user.js
// @require     http://d3js.org/d3.v3.min.js
// @require     https://raw.github.com/Caged/d3-tip/master/index.js
// @run-at      document-start
// @grant       none
// ==/UserScript==

/* globals $, NP2M, d3 */
(function() {
    "strict true";

    var DEBUG = false,
        NAME = 'Charts',
        VERSION = '2';

    function str(f) {
        return f.toString()
            .replace(/^[^\/]+\/\*!?/, '')
            .replace(/\*\/[^\/]+$/, '');
    }

    function addCss(css) {
        $("<style type='text/css'></style>")
            .html(css)
            .appendTo("head");
    }
    var css = str(function() {
        /*!
        svg {
            stroke: #FFF5EE;
            font-family: "OpenSansRegular";
            font-size: 14px;
            background: #000;
        }
        .axis path,
        .axis line {
            fill: none;
            stroke: #FFF;
            shape-rendering: crispEdges;
        }

        .x.axis path {
            display: none;
        }

        .line {
            fill: none;
            -stroke: steelblue;
            stroke-width: 3px;
        }

        .line:hover {
            stroke: white;
        }


        .d3-tip {
            line-height: 1;
            font-weight: bold;
            padding: 12px;
            background: rgba(200, 50, 0, 0.8);
            color: #fff;
            border-radius: 2px;
        }

        .d3-tip:after {
            box-sizing: border-box;
            display: inline;
            font-size: 10px;
            width: 100%;
            line-height: 1;
            color: rgba(0, 0, 0, 0.8);
            position: absolute;
        }

        .d3-tip.n:after {
            content: "\25BC";
            margin: -1px 0 0 0;
            top: 100%;
            left: 0;
            text-align: center;
        }
    */
    });

    function debug() {
        if (DEBUG) {
            console.log.apply(this, arguments);
        }
    }

    function find_widget(widget, needle) {
        var children = widget.children;

        for (var i = children.length - 1; i >= 0; i--) {
            var c = children[i],
                text = (children[i].label || children[i])
                    .ui.text();
            if (text.indexOf(needle) != -1) {
                return c;
            }
        }
        return undefined;
    }


    function filter_matrix(matrix, cols) {
        var headers = matrix[0],
            new_header = [];
        var i;
        for (i = 0; i < headers.length; i++) {
            if (cols.indexOf(headers[i]) != -1) {
                new_header.push(headers[i]);
            }
        }

        var new_matrix = [new_header];
        for (i = 1; i < matrix.length; i++) {
            var row = matrix[i],
                new_row = [];
            for (var j = 0; j < row.length; j++) {
                if (cols.indexOf(headers[j]) != -1) {
                    new_row.push(row[j]);
                }
            }
            new_matrix.push(new_row);
        }
        return new_matrix;
    }

    function replace_widget_handlers(widget, name, func) {
        var handlers = widget.handlers;
        // remove all previous handlers with that event name
        for (var i = handlers.length - 1; i >= 0; i--) {
            var h = widget.handlers[i];
            if (h.name === name) {
                handlers.splice(i, 1);
                h.node.ui.off(h.name, h.func);
            }
        }
        // add the new one
        widget.on(name, func);
    }


    // get sorted values of object
    function get_values(object) {
        // get key value pairs
        var list = [];
        for (var key in object) {
            list.push([key, object[key]]);
        }
        // sort by keys
        list.sort(function(a, b) {
            if (a[0] > b[0])
                return 1;
            if (a[0] < b[0])
                return -1;
            return 0;
        });
        // remove keys
        for (var i = list.length - 1; i >= 0; i--) {
            list[i] = list[i][1];
        }
        // return sorted values
        return list;
    }

    function pre_init_hook() {
        debug(NAME + ': pre_init_hook');
        google.load("visualization", "1", {
            packages: ["imagesparkline"],
            callback: function() {}
        });

        addCss(css);
    }

    function post_init_hook(data) {
        debug(NAME + ': post_init_hook', data);
        var Crux = data.Crux,
            GS = Crux.gridSize,
            universe = data.universe,
            np = data.np,
            npui = data.npui;

        function sparkline(ar, container) {
            debug('SPARKLINE: ', ar);
            var data = google.visualization.arrayToDataTable(ar);
            var chart = new google.visualization.ImageSparkLine(container);
            var chart_options = //$.extend({},universe.IntelChartOptions, 
            {
                width: 6 * Crux.gridSize,
                height: 32,
                showAxisLines: false,
                showValueLabels: false,
                labelPosition: 'none'
            }; //);
            chart.draw(data, chart_options);
        }

        // empire screen modifications
        npui.PlayerPanel = NP2M.wrap(npui.PlayerPanel, function(args, playerPanel) {
            var player = args[0],
                showEmpire = args[1];

            if (player.intelData) {
                var widge_labels = ['Total Stars', 'Total Ships', 'Total Carriers', 'New Ships'];

                // Sparklines
                for (var i = 0; i < widge_labels.length; i++) {
                    var widge = find_widget(playerPanel, widge_labels[i]);
                    widge.grid(10, 6 + (2 * i), 14, 3);

                    var chartWidge = Crux.Widget()
                        .grid(24, 6 + (2 * i), 6, 3)
                        .roost(playerPanel);

                    var columns = [widge_labels[i]];
                    var array = filter_matrix(player.intelData, columns);
                    sparkline(array, chartWidge.ui.get(0));
                }
            }
            return playerPanel;
        });

        var // valid_keys = ['bt','gt','ht','mt','st','tt','wt'],
        selections = {
            "ts": "Total Stars",
            "e": "Total Economy",
            "i": "Total Industry",
            "s": "Total Science",
            "sh": "Total Ships",
            "fl": "Total Carriers",
            "wt": "Weapons",
            "bt": "Banking",
            "mt": "Manufacturing",
            "ht": "Hyperspace",
            "st": "Scanning",
            "gt": "Experimentation",
            "tt": "Terraforming"
        };

        function updatePlayerIntel(player, data) {
            // debug('updatePlayerIntel', arguments);

            var constructionArray = [],
                snapshot, stats, row;
            for (var i = 0; i < universe.intelDataFull.length; i++) {
                snapshot = universe.intelDataFull[i];
                stats = snapshot.players[player.uid];
                row = get_values(stats);
                row.unshift(snapshot.tick);
                constructionArray.push(row);
                // if (snapshot.tick === 384)
                //     debug(stats, stats, row);
            }

            // sort the data based on the first element of each array, the tick
            // the data from the sever seems to become unsorted as a js object
            constructionArray.sort(function(a, b) {
                return a[0] - b[0];
            });

            // add stat name labels
            var labels = Object.keys(stats)
                .sort();
            for (var f in labels) {
                labels[f] = selections[labels[f]];
            }

            labels.unshift("Tick");
            constructionArray.unshift(labels);
            //debug('constructionArray', constructionArray);

            player.intelData = constructionArray;
        }

        np.onIntelDataRecieved = NP2M.wrap(np.onIntelDataRecieved, function(args) {
            debug('onIntelDataRecieved', args);
            var data = args[1];
            if (data.stats.length) {
                universe.rawIntelData = data.stats;
            }
            return args;
        }, function(args, ret) {
            var data = args[1];
            if (data.stats.length) {
                var players = universe.galaxy.players;
                for (var i in players) {
                    updatePlayerIntel(players[i], data);
                }
            }
            return ret;
        });



        Crux.LineChart = function(data, colors) {
            var chart = Crux.Widget("rel"),
                container = chart.ui.get(0);

            // debug('rawIntelData', universe.rawIntelData);

            var header = _.keys(_.omit(data[0], 'tick'));

            var margin = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 50
            };
            var dim = {
                width: 30 * GS - margin.left - margin.right,
                height: 16 * GS - margin.top - margin.bottom
            };

            // value->pixel mapping functions
            var minTick = _.min(_.pluck(data, 'tick'));
            var maxTick = _.max(_.pluck(data, 'tick'));
            var maxValue = _.max(_.map(data, function(o) {
                return _.max(_.values(_.omit(o, 'tick')));
            }));
            var minValue = _.min(_.map(data, function(o) {
                return _.min(_.values(_.omit(o, 'tick')));
            }));
            var x = d3.scale.linear()
                .domain([minTick, maxTick])
                .range([0, dim.width]);
            var y = d3.scale.linear()
                .domain([minValue, maxValue])
                .range([dim.height, 0]);

            // Create the axis
            var ticks = d3.range(minTick, maxTick, 24);
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .tickValues(ticks);
            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            // Create SVG and graph elements
            var graph = d3.select(container)
                .append("svg:svg")
                .attr("width", dim.width + margin.left + margin.right)
                .attr("height", dim.height + margin.top + margin.bottom)
                .append("svg:g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Tooltips
            var tipData;
            tip = d3.tip()
                .attr('class', 'd3-tip')
                .direction('n')
            //.tip.offset([10, -10])
            .html(function(d) {
                var puid = tipData[0],
                    player = universe.galaxy.players[puid],
                    tick = tipData[1],
                    value = tipData[2];

                var html = '';
                html += '<div>Player: ' + player.alias + '</div>';
                html += '<div>Tick:   ' + tick + '</div>';
                html += '<div>Value:  ' + value + '</div>';
                return tipData;
            });

            graph.call(tip)

            // Add our axis to the graph
            graph.append("svg:g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + dim.height + ")")
                .call(xAxis);

            graph.append("svg:g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Level");

            // add vertical cycle lines
            graph.selectAll(".vline")
                .data(ticks)
                .enter()
                .append("line")
                .attr("x1", function(d) {
                    return x(d);
                })
                .attr("x2", function(d) {
                    return x(d);
                })
                .attr("y1", function(d) {
                    return 0;
                })
                .attr("y2", function(d) {
                    return dim.height;
                })
                .style("stroke", "#eee");


            _.each(header, function(heading, i) {
                var line = d3.svg.line()
                    .x(function(d, i) {
                        return x(d.tick);
                    })
                    .y(function(d, i) {
                        return y(d[heading]);
                    });

                var bisect = d3.bisector(function(d) {
                    console.log('bisector d', d);
                    return d.tick;
                })
                    .right;

                function mousemove(data) {
                    console.log('mousemove d', d);
                    var x0 = x.invert(d3.mouse(this)[0]),
                        i = bisect(data.reverse(), x0, 0),
                        d = data[i];
                    tipData = [heading, d.tick, d[heading]];
                }

                graph.append("path")
                    .attr("class", "line")
                    .style("stroke", colors[heading])
                    .datum(data)
                    .attr("d", line)
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide)
                    .on('mousemove', mousemove);
            });

            return chart;
        };

        npui.EmpireTechChart = function(player) {

            // Get the data
            var columns = ["Tick", "Weapons", "Banking", "Manufacturing", "Hyperspace", "Scanning", "Experimentation", "Terraforming"];
            var data = filter_matrix(player.intelData, columns);


            var options = $.extend({},
                universe.IntelChartOptions, {
                    colors: universe.playerColors,
                });

            // debug(options);

            var empireTechChart = Crux.LineChart(data, options)
                .size(30 * GS, 16 * GS);

            return empireTechChart;
        };

        function processData(rawData, playerUids, dataType) {
            // [{0: {a:1,b:2, c:}}, {}, {}]
            // => 
            // []
            return _.map(rawData, function(datum, i) {
                // debug('rawData[' + i + ']: ', datum);
                var includedPlayers = _.pick(datum.players, playerUids);
                // debug('includedPlayers: ', includedPlayers);
                // var newDatum = _.map(includedPlayers, universe.intelDataType);
                var newDatum = _.transform(includedPlayers, function(result, value, key) {
                    // debug('transform', universe.intelDataType, result.toString(), value, key)
                    result[key] = value[universe.intelDataType];
                });

                newDatum.tick = datum.tick;
                // debug('newDatum: ', newDatum);
                return newDatum;
            });
        }

        npui.IntelChart = function() {
            debug('IntelChart');
            var rawData = universe.rawIntelData,
                puids = universe.intelPlayerToChart,
                dataType = universe.intelDataType,
                data = processData(rawData, puids, dataType),
                colors = {};

            _.each(puids, function(puid) {
                var index = universe.galaxy.players[puid].colorIndex;
                var color = 'white';
                if (puid !== universe.player.uid) {
                    color = universe.playerColors[index];
                }
                colors[puid] = color;
            });
            debug('colors', puids, colors);

            var intelChart = Crux.LineChart(data, colors)
                .size(30 * GS, 16 * GS);
            return intelChart;
        };

        npui.EmpireScience = NP2M.wrap(npui.EmpireScience, function(args, empireScience) {
            var player = args[0];

            if (!player.intelData) {
                return empireScience;
            }

            var size = empireScience.size();
            empireScience.size(size.w, size.h + 16 * GS);

            npui.EmpireTechChart(player)
                .grid(0, 16 + 1, 30, 16)
                .roost(empireScience)


            return empireScience;
        });

        replace_widget_handlers(np, "order:intel_data", np.onIntelDataRecieved);

        // for quicker testing
        // remove on production
        np.on("order:full_universe", function() {
            // np.trigger("show_screen", "intel");
        });



        npui.IntelFooter = function() {
            var intelFooter = Crux.Widget("rel")
                .size(480, 92);

            Crux.Button("all", "intel_player_filter_all")
                .grid(0.5, 0.5, 5, 3)
                .roost(intelFooter);

            Crux.Button("none", "intel_player_filter_none")
                .grid(5.5, 0.5, 5, 3)
                .roost(intelFooter);

            var topInput = Crux.TextInput(false, true)
                .setValue(universe.playerRankFilter || "64")
                .grid(0.5, 5.5, 5, 3)
                .roost(intelFooter);

            Crux.Button("max", "intel_player_filter_rank")
                .grid(5.5, 5.5, 5, 3)
                .roost(intelFooter);

            np.on("intel_player_filter_rank", function(event, id) {
                var top,
                    lastTickPlayers = universe.rawIntelData[0].players,
                    ranked = _.sortBy(lastTickPlayers, universe.intelDataType),
                    val = topInput.getValue();

                debug('lastTickPlayers', lastTickPlayers, ranked);

                universe.playerRankFilter = val;
                top = parseInt(val, 10);

                var puids = _.last(_.map(ranked, 'uid'), top);

                debug('topInput', val, top, puids, ranked);

                universe.intelPlayerToChart = puids;
                np.onIntelSelectionChange(null, universe.intelDataType);
            });

            var bg = Crux.Widget("rel")
                .size(256)
                .pos(196, 2)
                .roost(intelFooter);

            var xPos = -2,
                yPos = 1;
            var index = 0;


            if (universe.playerCount < 8) {
                xPos += (16 - (universe.playerCount * 2)) / 2;
            }

            while (index < universe.playerCount) {
                xPos += 2;
                if (xPos >= 16) {
                    xPos = 0;
                    yPos += 2;
                    if (universe.playerCount - index < 8) {
                        xPos += (16 - ((universe.playerCount - index) * 2)) / 2;
                    }

                }
                var player = universe.galaxy.players[index];
                var c = Crux.Clickable("intel_player_filter_change", player.uid)
                    .grid(xPos, yPos, 2, 2)
                    .roost(bg);

                if (universe.intelPlayerToChart.indexOf(player.uid) >= 0) {
                    Crux.Widget("col_accent rad4")
                        .grid(0, 0, 2, 2)
                        .roost(c);
                }

                Crux.Widget("pci_32_" + player.uid)
                    .grid(0, 0, 2, 2)
                    .roost(c);


                index += 1;
            }

            var larger = 0;

            intelFooter.size(480, (yPos * 16) + 48);
            return intelFooter;
        };


    }

    NP2M.register(NAME, VERSION, pre_init_hook, post_init_hook);
})();