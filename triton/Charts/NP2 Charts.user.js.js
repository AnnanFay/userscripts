// ==UserScript==
// @name        NP2 Charts
// @description 
// @namespace   http://userscripts.org/users/AnnanFay
// @include     http*://triton.ironhelmet.com/game*
// @version     1
// @require     http://underscorejs.org/underscore-min.js
// @require     http://userscripts.org/scripts/source/181520.user.js
// @require     http://d3js.org/d3.v3.min.js
// @run-at      document-start
// @grant       none
// ==/UserScript==

/* globals $, NP2M, d3 */
(function () {
    "strict true";

    var DEBUG   = false,
        NAME    = 'Charts'
        VERSION = '1';

    function debug () {
        if (DEBUG) {
            console.log.apply(this, arguments);
        }
    }

    function find_widget (widget, needle) {
        var children = widget.children;

        for (var i = children.length - 1; i >= 0; i--) {
            var c       = children[i],
                text    = (children[i].label || children[i]).ui.text();
            if (text.indexOf(needle) != -1) {
                return c;
            }
        }
        return undefined;
    }

    
    function filter_matrix (matrix, cols) {
        var headers     = matrix[0],
            new_header  = [];
        var i;
        for (i = 0; i < headers.length; i++) {
            if (cols.indexOf(headers[i]) != -1) {
                new_header.push(headers[i]);
            }
        }

        var new_matrix  = [new_header];
        for (i = 1; i < matrix.length; i++) {
            var row     = matrix[i],
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

    function replace_widget_handlers (widget, name, func) {
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
    function get_values (object) {
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

    function pre_init_hook () {
        debug(NAME + ': pre_init_hook');
        google.load("visualization", "1", {packages:["imagesparkline"], callback: function(){}});
    }

    function post_init_hook (data) {
        debug(NAME + ': post_init_hook', data);
        var Crux        = data.Crux,
            GS          = Crux.gridSize,
            universe    = data.universe,
            np          = data.np,
            npui        = data.npui;


        universe.IntelChartOptions.tooltip = {
            isHtml: true
        };

        function sparkline (ar, container) {
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
            };//);
            chart.draw(data, chart_options);
        }

        // empire screen modifications
        npui.PlayerPanel = NP2M.wrap(npui.PlayerPanel, function (args, playerPanel) {
            var player      = args[0],
                showEmpire  = args[1];

            if (player.intelData) {
                var widge_labels    = ['Total Stars', 'Total Ships', 'Total Carriers', 'New Ships'];

                // Sparklines
                for (var i = 0; i < widge_labels.length; i++) {
                    var widge = find_widget(playerPanel, widge_labels[i]);
                    widge.grid(10, 6+(2*i), 14, 3);

                    var chartWidge = Crux.Widget()
                            .grid(24, 6+(2*i), 6, 3)
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
            "tt": "Terraforming"};

        function updatePlayerIntel (player, data) {
            debug('updatePlayerIntel', arguments);

            var constructionArray = [], snapshot, stats, row;
            for (var i = 0; i < universe.intelDataFull.length; i++) {
                snapshot    = universe.intelDataFull[i];
                stats       = snapshot.players[player.uid];
                row         = get_values(stats);
                row.unshift(snapshot.tick);
                constructionArray.push(row);
                if (snapshot.tick === 384)
                    debug(stats, stats, row);
            }

            // sort the data based on the first element of each array, the tick
            // the data from the sever seems to become unsorted as a js object
            constructionArray.sort(function(a, b){
                return a[0] - b[0];
            });

            // add stat name labels
            var labels = Object.keys(stats).sort();
            for (var f in labels) {
                labels[f] = selections[labels[f]];
            }

            labels.unshift("Tick");
            constructionArray.unshift(labels);
            debug('constructionArray', constructionArray);

            player.intelData = constructionArray;
        }

        np.onIntelDataRecieved = NP2M.wrap(np.onIntelDataRecieved, function (args, ret) {
            debug('OIDR args', arguments);
            var data = args[1];
            if (data.stats.length) {
                var players = universe.galaxy.players;
                for (var i in players) {
                    updatePlayerIntel(players[i], data);
                }
            }
            return ret;
        });


        npui.EmpireTechChart = function (player) {
             var empireTechChart = Crux.Widget("rel")
                    .size(30*GS, 16*GS);
            if (!player.intelData) {
                return empireTechChart;
            }
            var columns = ["Tick", "Weapons","Banking","Manufacturing","Hyperspace","Scanning", "Experimentation", "Terraforming"];
            var array = filter_matrix(player.intelData, columns);
            array = _.map(array, function (row, i) {
                return _.map(row, function (value, j) {
                    if (i > 0 && j > 0) {
                        return value * (1 + (j*0.01));
                    }
                    return value;
                });
            });
            var data = google.visualization.arrayToDataTable(array);
            var chart = new google.visualization.LineChart(empireTechChart.ui.get(0));
            var options = $.extend({},
                universe.IntelChartOptions,
                {
                    colors: universe.playerColors, 
                });
            debug(options);

            chart.draw(data, options);

            return empireTechChart;
        };

        npui.EmpireScience = NP2M.wrap(npui.EmpireScience, function (args, empireScience) {
            var player = args[0];

            if (!player.intelData) {
                return empireScience;
            }

            var size = empireScience.size();
            empireScience.size(size.w, size.h + 16*GS);

            npui.EmpireTechChart(player)
                .grid(0, 16 + 1, 30, 16)
                .roost(empireScience)


            return empireScience;
        });

        replace_widget_handlers(np, "order:intel_data", np.onIntelDataRecieved);
    }

    NP2M.register(NAME, VERSION, pre_init_hook, post_init_hook);
})();