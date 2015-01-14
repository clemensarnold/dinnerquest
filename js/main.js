var dq = (function($, window, undefined) {
    
    "use strict";
    
    var refs = {
        $window: $(window),
        $document: $(document),
        $body: $('body'),
        $dragfood: undefined,
        // $plates: $('#plates'),
        $plates: $('#plates .plate-mask'),
        $chart: $('#chart'),
        $intro: $('.intro-container'),
        // $newGameButton: $('#newGameButton'),
        $newGameButton: $('.start-new-game'),
        $plate: undefined,
        $fork: $('.fork'),
        $spoon: $('.spoon'),
        $forkBub: $('.fork .bubble'),
        $spoonBub: $('.spoon .bubble'),
        $menu: $('.menu-wrapper'),
        $foodCont: $('.food-container'),
        $mealCheck: $('.meal-check'),
        $infopage: $('#infopage'),
        $gallery: $('#gallery .gal-wrapper'),
        $infobtn: $('.info'),
        $gallerybtn: $('.gallery'),
        $audiocontainer: $('#audiocontainer'),
        $videocontainer: $('#videocontainer'),
        $confettis: $('#confettis'),
        $storm: $('#storm'),
        $bolt: $('.bolt'),
        $bolts: $('.bolt2'),
        $continueButton: $('#continueButton'),
        // $foodstack: $('#foodstack'),
        $piechart: $('#piechart'),
        $barchart: $('#barchart'),
        $hud: $('.hud'),
        'change-tab': $('.snd.change-tab')[0],
        'dropped-food': $('.snd.dropped-food')[0],
        'success': $('.snd.success')[0],
        'failed': $('.snd.failed')[0],
        'new-game': $('.snd.new-game')[0],
        'snoring': $('.snd.snoring')[0]
    },
    configs = {
        isTouch: 'ontouchstart' in window,
        clickEvent: ('ontouchstart' in window) ? 'touchstart' : 'mousedown',
        clickEventEnd: ('ontouchstart' in window) ? 'touchend' : 'mouseup',
        stats: undefined,
        menuAtTop: false
    },
    buttons = {
        START_TRIAL: 'start-trial',
        SKIP_TRIAL: 'skip-trial'
    },
    game = {
        co2_max: NaN,
        kcal_min: NaN,
        inactive_restart: NaN,
        inactive_fallasleep: NaN,
        inactivityCounter: 0,
        trialmode: false,
        started: false,
        running: false,
        sleeping: false,
        lastSound: undefined,
        worstFoodsAry: [],
        bestFoodsAry: [],
        constants: {
            FOODITEMS_VERTOFF: {veggies: 0, sides: -105, animals: -210, fruit: -315, fastfood: -420},
            // FOODITEMS_VERTOFF_BIG: {veggies: 0, sides: NaN, animals: NaN},
            FOOD_CATS: ['veggies', 'sides', 'animals', 'fruit', 'fastfood'],
            FOOD_BGVERT_OFF: {veggies: 0, sides: 1, animals: 2},
            DEFAULT_TAB: 'veggies', 
            FOOD_BIG_DIMS: 450,
            CUTLERY_HOROFF: 120,
            RADIUS_INNER: 0,
            PIECOLOR: '#f2282e', // f2282e, 43b1d8
            FPS: 30,
            SNORE_EXP: "L04,G12",
            WAKEUP_EXP: "L01,G01",
            FADEIN_SPEED: 500,
            FADEOUT_SPEED: 500
        },
        currentFoodCat: undefined,
        currentMeal: [],
        meals: [],
        mealMix: {},
        freezeTab: {},
        activeTabID: NaN,
        $activeTab: undefined,
        platesCounter: -1,
        foodCounter: NaN,
        $activePage: undefined,
        currentTemplate: undefined,
        BUBBLES_NEWGAME: 'new-game',
        BUBBLES_FAILED: 'failed',
        BUBBLES_SUCCESS: 'success',
        BUBBLES_FREEZE_VEGGIES: 'freeze-veggies',
        BUBBLES_FREEZE_SIDES: 'freeze-sides',
        BUBBLES_POSITIVE: 'positive',
        BUBBLES_NEGATIVE: 'negative',
        BUBBLES_TRIAL_START: 'trial-start',
        BUBBLES_TRIAL_WON: 'trial-won',
        BUBBLES_TRIAL_LOST: 'trial-lost'
    },
    intro = {},
    hud = {},
    app = {},
    svg = {},
    gallery = {},
    piechart = {},
    barchart = {},
    dragfood = {},
    debug = {},
    cutlery = {},
    storm = {},
    confettis = {},
    constants = {
        DEV: true,
        STATS: false,
        CHECK_INACTIVITY: false,
        RELOAD_ON_INACTIVE: false,
        SOUNDS: false,
        SKIP_INTRO: false,
        SKIP_TRIAL: false,
        SKIP_VIDEO: false,
        URL_HOME: '',
        JSON_PATH: './json/data.json',
        JSON_PATH_GALLERY: './json/meals.json',
        FADE_IN: 200, FADE_OUT: 400, FADE_DELAY: 50,
        FOOD_HOR: NaN, FOOD_VERT: NaN,
        PLATE_RAD: 270, PLATE_DISTANCE: 40000// 200*200
    },
    templates = ['INTRO', 'TRIAL','VIDEO','GAME','SCENARIO'],
    defaultTemplate = templates[0], //  templates[3]
    sounds = {
        DROPPED_FOOD: 'dropped-food',
        NEW_GAME: 'new-game',
        CHANGE_TAB: 'change-tab',
        FAILED: "failed",
        CLICK_FORK: "G_on_click",
        CLICK_SPOON: "L_on_click",
        LEAVE_TAB: "leave_tab",
        SNORING: "snoring",
        SUCCESS: "success"
    };
    
    game.sounds = [{selector: '.navi-container > div', whichSound: sounds.CHANGE_TAB}];
    
    $(function() {
        
        helper.initMisc();

        configs.menuAtTop = (location.hash.indexOf('at-top') >= 0)
        
        $.getJSON(constants.JSON_PATH, function(data) {
            app.json = data;
            
             //  set balancing-vars from json
            game.co2_max = app.json.rules.co2_max;
            game.kcal_min = app.json.rules.kcal_min;
            game.inactive_fallasleep = app.json.rules.inactive_fallasleep;
            game.inactive_restart = app.json.rules.inactive_restart;
            cutlery.showDelay = app.json.rules.showbubble_delay;
            cutlery.hideDelay = app.json.rules.hidebubble_delay;
            
            app.setFoodArys();
            
            if (constants.STATS) {
                configs.stats = new Stats();
                configs.stats.setMode(0);
                document.body.appendChild(configs.stats.domElement);
                window.setInterval(function() { configs.stats.update(); }, 1000 / constants.FPS);
            }
            
            app.init();

            $.getJSON(constants.JSON_PATH_GALLERY + '?rid=' + Math.random(), function(data) {
                game.meals = data;
            });
        });
    });
    
    app = {
        
        clicklistener: function(e) {
            log('clicklistener');
            log(e.originalEvent.srcElement);
        },

        renderTemplate: function(template) {
            log('renderTemplate: ' + template);

            game.currentTemplate = template;

            switch(game.currentTemplate) {
                case 'INTRO': 
                    constants.SKIP_INTRO ? intro.hide() : setTimeout(intro.init, 500);
                    break;

                case 'GAME':
                    log('GAME');
                    intro.hide();
                    break;

                default:

                    break;
            }
        },

        init: function() {
            log('app.init');

            if (constants.CHECK_INACTIVITY) setInterval(app.checkInactivity, 1000);
            
            // game.constants.FOODITEMS_VERTOFF_BIG.sides = -game.constants.FOOD_BIG_DIMS;
            // game.constants.FOODITEMS_VERTOFF_BIG.animals = -2 * game.constants.FOOD_BIG_DIMS;
            constants.FOOD_HOR = constants.FOOD_VERT = game.constants.FOOD_BIG_DIMS / 2;
            
            if (constants.DEV) {
                refs.$window.on({keydown: this.keyDownListener});
            }
            
            $('.navi-container > div').on(configs.clickEvent, function() {
                if (game.freezeTab[$(this).data('foodcat')]) return;
                
                game.currentFoodCat = game.constants.FOOD_CATS[$(this).data('foodcat')];
                
                $('.navi-container > div.active').removeClass('active');
                $(this).addClass('active');
                app.renderFoodMenu();
                game.activeTabID = $(this).data('foodcat');
                game.$activeTab = $(this);
            });
            
            refs.$window.on(configs.clickEvent, app.resetInactCounter);
            
            $('.logo').on({click: app.reload});
           
            refs.$newGameButton.on({click: game.startNewGame});
            $('.' + buttons.START_TRIAL).on({click: function() {
                game.trialmode = true;
                intro.hide();
            }});
            
            $('.info.icon, .gallery.icon').on({click: function() {
                var pagetype = $(this).data('pagetype');

                if (storm.stormOn) return;
                $(this).toggleClass('close');

                if (!!game.$activePage && $(this).hasClass('close')) {
                    $('body').find('[data-pagetype="' + game.$activePage.attr('id') + '"]').removeClass('close');
                    app.hideContentPage(game.$activePage.attr('id'));
                }

                $('#' + pagetype).hasClass('visible') ? app.hideContentPage(pagetype) : app.showContentPage(pagetype);
            }});
            
            refs.$continueButton.on({click: function() {
                refs.$infobtn.toggleClass('close');
                app.hideContentPage("infopage");
            }});

            $('.hud .toggle').on({click: barchart.toggle});
            
            //  init sounds
            for (var i = 0; i < game.sounds.length; i++) {
                $(game.sounds[i].selector).data('whichSound', game.sounds[i].whichSound).on(configs.clickEvent, function(e, mode) {
                    if (mode !== 'no-sound') app.playSound($(this).data('whichSound'));
                });
            }

            app.renderTemplate(defaultTemplate);
        },
        
        setFoodArys: function() {
            var tmpAry = app.json.expressions.positive[0];
            
            for (var i = 0; i < tmpAry.length; i++) {
                game.bestFoodsAry.push(tmpAry[i]['triggered-by']);
            }
            
            tmpAry = app.json.expressions.negative[0];
            for (i = 0; i < tmpAry.length; i++) {
                game.worstFoodsAry.push(tmpAry[i]['triggered-by']);
            }
        },
        
        initVideo: function() {

            log('initVideo');

            // init video
            refs.$videocontainer.removeClass('transparent hidden');
            refs.$videocontainer.on({click: app.finishVideo});
            $('#intro-video').on({ended: app.finishVideo });

            $('#intro-video')[0].play();
        },
        
        finishVideo: function() {

            log('finishVideo');

            $('.logo, .info, .gallery').removeClass('transparent');
            
            $('#intro-video')[0].pause();
            refs.$videocontainer.addClass('hidden');
            setTimeout(app.startGame, 1000);
        },
        
        checkInactivity: function() {
            if (game.started) game.inactivityCounter++;
            switch(game.inactivityCounter) {
                
                case game.inactive_fallasleep:
                    if (game.running) app.startSleeping();
                    break;
                
                case game.inactive_restart:
                    if (constants.RELOAD_ON_INACTIVE) app.reload();
                    break;
            }
            
            //log('ia counter: ' + game.inactivityCounter);
            //log('game.running: ' + game.running);
        },
        
        startSleeping: function() {
            game.sleeping = true;
            cutlery.setExpression({exp: game.constants.SNORE_EXP});
            app.playSound(sounds.SNORING, true);
        },
        
        stopSleeping: function() {
            game.sleeping = false;
            cutlery.setExpression({exp: game.constants.WAKEUP_EXP});
            app.stopSound('stopSleeping');
        },
        
        resetInactCounter: function() {
            game.inactivityCounter = 0;
            
            if (game.sleeping) app.stopSleeping();
        },
        
        startGame: function() {
            game.started = true;
            game.startNewGame();

            refs.$plates.fadeIn();
            refs.$fork.show();
            refs.$spoon.show();

            $('body').addClass('table-cloth');
            refs.$menu.removeClass('down');
            
            setTimeout(app.clearSounds, 900);
        },

        stopTrialMode: function() {
            log('stopTrialMode');

            game.trialmode = false;

            refs.$menu.addClass('down');
            refs.$fork.hide();
            refs.$spoon.hide();
            refs.$plates.fadeOut();

            setTimeout(app.initVideo, 1500);
        },
        
        isLabelAlreadyInCurrentFood: function (label) {
            var exists = false;
                for(var j = 0; j < game.currentMeal.length; j++) {
                    if(game.currentMeal[j] != undefined && game.currentMeal[j].label == label) {
                        exists = true;
                        break;
                    }
                }
            return exists;
        },
        
        freezeFoodMenu: function() {
            refs.$foodCont.addClass('inactive');
            game.freezeTab[game.activeTabID] = true;
            game.$activeTab.addClass('freeze');
        },
        
        renderFoodMenu: function() {
            var foodClass = configs.isTouch ? 'm-item touch' : 'm-item no-touch',
                foodHtml = '<div class="' + foodClass + '"></div>',
                html = '',
                foodCat = game.currentFoodCat,
                vertOff = game.constants.FOODITEMS_VERTOFF[foodCat],
                specs = {};
                
            for (var i = 0; i < app.json.avFood[foodCat].length; i++) {
                html += foodHtml;
            }
            
            refs.$foodCont.empty().append(html).removeClass('inactive');
                    
            $('.m-item').each(function(i, el) {
                specs = app.json.avFood[foodCat][i];
                specs.foodCat = game.currentFoodCat;
                specs.bgHorPos = i;
                
                if (!app.isLabelAlreadyInCurrentFood(specs.label)) {
                    $(el).css({backgroundPosition: -i * $(el).width() + 'px ' + vertOff + 'px'}).
                    data('specs', specs).addClass('visible');

                    $(el).append('<p>' + specs.label + '</p>');
                    
                    $(el).draggable({
                        helper: 'clone',
                        cursorAt: {left: constants.FOOD_HOR, top: constants.FOOD_VERT},
                        start: function(e, ui) {
                            refs.$dragfood = ui.helper;
                            refs.$dragfood.addClass('dragged');
                            
                            dragfood.setBackground(refs.$dragfood, $(this).data('specs'));
                            refs.$body.addClass('hidesvg');
                            //app.stopSound(); // needed for ipad performance (weird)
                        },
                        stop: dragfood.stopDragging,
                        drag: $.throttle(300, dragfood.calcDistance)
                    });
                } else {
                    $(el).css("visibility", "hidden");
                }
            });
        },
        
        switchTab: function(foodCat) {
            $('.navi-container .' + foodCat).trigger(configs.clickEvent, 'test');
        },
        
        showContentPage: function(pagetype) {
            log('showContentPage');
            $('html').addClass('overflow');

            if (pagetype === 'gallery') dq.gallery.render();

            game.$activePage = $('#' + pagetype);
            game.$activePage.addClass('visible');
            
            refs.$plates.hide();
            refs.$barchart.hide();
            refs.$fork.hide();
            refs.$spoon.hide();
            refs.$menu.hide();
            refs.$hud.addClass('hidden');

            $('.logo, #newGameButton, .meal-check').hide();
        },
        
        hideContentPage: function(pagetype) {
            log('hideContentPage: ' + pagetype);

            $('html').removeClass('overflow');
            // $('#' + pagetype).removeClass('visible');
            game.$activePage.removeClass('visible');
            game.$activePage = undefined;

            refs.$plates.show();
            refs.$barchart.show();
            refs.$fork.show();
            refs.$spoon.show();

            if (game.running) {
                refs.$menu.show();
                
            } else {
                refs.$hud.removeClass('hidden');
            }

            $('.logo, #newGameButton, .meal-check').show();
        },
        
        convertGrammToKG: function (gramm) {
              return gramm / 1000;
        },
        
        generateChart: function($target) {
            var html = '',
                specs = {},
                tmpAry = [],
                showSpecific = !!$target,
                addChart = false;

            log('generateChart / showSpecific: ' + showSpecific);
            if (!showSpecific) app.resetChart();
            
            refs.$plate.find('.food').each(function(i, el) {
               
                if (showSpecific) {
                    addChart = $(el).attr('id') === $target.attr('id');
                } else {
                    addChart = true;
                }

                if (addChart) {
                
                    specs = $(el).data('specs');

                    html = '<div class="_CLASSES_"><h3>_LABEL_</h3><p>_SERVING_ g, _CO2_ KG CO<sub>2</sub</p></div>';
                    html = html.replace('_CLASSES_', specs.bigbg ? "big-chart chart" : "normal-chart chart");
                    html = html.replace('_SERVING_', specs.serving);
                    html = html.replace('_LABEL_', specs.label);
                    html = html.replace('_CO2_', app.convertGrammToKG(specs.c02));
                   
                    $(el).append(html);
                   
                    if (specs.chart.length > 0) {
                        tmpAry = $(el).data('specs').chart.split(',');
                        $(el).children().css({left: tmpAry[0] + 'px', top: tmpAry[1] + 'px'});
                   }
               }
            });

            if (showSpecific) {
                refs.$plate.find('.food .chart').delay(2000).fadeOut(500, function() { log('remove .food .chart'); $(this).remove(); });
            }
            
            //  catch mouse down
            refs.$plate.find('.food .chart').on(configs.clickEvent, function(e) {
                e.stopImmediatePropagation();
                log('label: down');
            });

            refs.$plate.find('.food .chart').on(configs.clickEventEnd, function(e) {
                e.stopImmediatePropagation();
                log('clicked label: up');
                if (game.running) game.removeFood($(this).parent());
            });

            // refs.$chart.show();
            // refs.$menu.fadeOut();
            // refs.$mealCheck.addClass('visible');
        },
        
        resetChart: function() {
            log('resetChart');
             refs.$plate.find('.food .chart').remove();
            // refs.$chart.hide();
        },
        
        reload: function() {
            location.reload();
        },
        
        keyDownListener: function(e) {
            
            log(e.keyCode);
            
            switch(e.keyCode) {
                case 67: // c
                    debug.printObject(game.calcMealVals(game.currentMeal));
                    break;
                
                case 78:
                    game.startNewGame();
                    break;

                case 80: // p
                    cutlery.trigger(game.BUBBLES_TRIAL_LOST);
                    break;

                //  r
                case 82:
                    location.reload();
                    break;
            }
        },
        
        playSound: function(whichSound, loop) {
            
            if (!constants.SOUNDS) return;

            if (game.lastSound === 'snoring') app.stopSound('playSound');
            
            //if (whichSound === 'new-game') return;
            //log('playSound / whichSound: ' + whichSound);
            
            refs[whichSound].play();
            game.lastSound = whichSound;
        },
        
        stopSound: function(trigger) {
            
            log('stopSound / trigger: ' + trigger);
            
            if (game.lastSound) {
                refs[game.lastSound].pause();
                //log('dur: ' + refs[game.lastSound].duration);
                refs[game.lastSound].currentTime = 0;
                //log('pause');
            }
        },
       
        _playSound: function(whichSound, loop) {
            
            //if (!constants.SOUNDS) return;
            
                        
            //if (whichSound !== ('failed' || 'success')) return;
            if (whichSound !== 'failed' && whichSound !== 'change-tab') return;
            
            log('whichSound: ' + whichSound);
            
             
            
            var sndpath = app.json.sounds[whichSound],
                html = '',
                id = 'active-sound',
                $snd = undefined;
                
            
            
            if (Modernizr.audio) {
                html = '<audio id="' + id + '" ';
                if (loop) html += 'loop';
                html += ' class="btn-audio"><source src="./media/sound/' + sndpath + '.mp3" type="audio/mpeg" /></audio>';
                
                refs.$audiocontainer.empty().append(html);
                
                log(html);
                
                $snd = document.getElementById(id);
                $snd.volume = 0.3;
                $snd.play();
            }
        },
        
        clearSounds: function() {
            log('clearSounds');
            refs.$audiocontainer.empty();
        }
    }

    /******* SVG *******/

    svg = {

        $foodOnPlate: undefined,

        loadSVG: function($newFoodRef, specs) {
            var svgPath = './img/svg/onplate/' + specs.foodCat + '/' + specs.bgHorPos + '.svg';

            svg.$foodOnPlate = $newFoodRef;

            $.get(svgPath, function(data) {
                var xmlString = (new XMLSerializer()).serializeToString(data);

                svg.$foodOnPlate.append(xmlString);
            });
        }
    }

    /******* Barchart *******/

    barchart = {

        active: false,
        $el: $('.barchart-container'),
        $mask: $('#barchart .mask'),

        calcBarHeight: function(val) {
            var height, normHeight = 350, maxHeight = 450, minHeight = 30,
            height = Math.round((val / 700) * normHeight);

            if (height > maxHeight) height = maxHeight;
            if (height < minHeight) height = minHeight;
            return height;
        },

        render: function() {

            log('-----barchart render-----');

            var that = barchart,
                html = '',
                hSnippet = '<div class="item"><div class="bar"></div><p></p></div>',
                bottomOff = 0, $target, text = '',
                data = dq.game.meals[0].ingredients;

            // log(data);

            data = data.sort(function(obj1,obj2) { return obj1.c02 - obj2.c02; });
            // data = data.sort(function(obj1,obj2) { return obj2.c02 - obj1.c02; });

            for (var i = 0; i < data.length; i++) {
                html += hSnippet;
            }
            that.$el.empty().append(html);

            $('.barchart-container .item').each(function(i, $el) {

                $target = $($el);

                //  row
                $target.css({bottom: bottomOff});

                //  bar
                $target.find('.bar').css({background: data[i].color, height: that.calcBarHeight(data[i].c02)});

                //  label
                text = data[i].serving + ' g ' + data[i].label + '<br>'+ helper.convertToKG(data[i].c02) + ' kg CO<sub>2</sub>';
                $target.find('p').html(text);

                bottomOff += $($el).find('.bar').height();
            });

            refs.$barchart.addClass('show');
            that.$mask.addClass('expand');
        },

        hide: function() {
            refs.$barchart.removeClass('show');
            barchart.$mask.removeClass('expand');
        },

        toggle: function() {
            log('barchart toggle');

            var $p = $(this).find('p'),
                label = $p.data('label');

            $p.data('label', $p.text()).text(label).removeClass('show-food');

            if (barchart.active) {
                refs.$plate.find('.food').show();
                barchart.hide();

            } else {
                refs.$plate.find('.food').hide();
                barchart.render();
                $p.addClass('show-food');
            }

            barchart.active = !barchart.active;
        },

        showHud: function() {
            refs.$plates.addClass('collapse border-bottom');
            setTimeout(function() { refs.$hud.removeClass('hidden'); }, 300);
        },

        hideHud: function() {
            refs.$plates.removeClass('collapse');
            refs.$hud.addClass('hidden');
            setTimeout(function() { refs.$plates.removeClass('border-bottom'); }, 300);
        },

        reset: function() {
            barchart.hide();
            barchart.hideHud();
        }
    }

    /******* piechart *******/

    piechart = {

        // Store the displayed angles in _current.
        // Then, interpolate from _current to the new angles.
        // During the transition, _current is updated in-place by d3.interpolate.
        arcTween: function(a) {
            var i = d3.interpolate(this._current, a);
                this._current = i(0);
                return function(t) {
                return piechart.arc(i(t));
            };
        },

        renderChart: function() {
            var width = 960, height = 500, radius = Math.min(width, height) / 2,
                color = d3.scale.ordinal().range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
            
            var arc = d3.svg.arc().outerRadius(radius - 10).innerRadius(0);
            var pie = d3.layout.pie().sort(null).value(function(d) { return d.population; });

            dq.refs.$piechart.empty();

            piechart.arc = arc;

            var svg = d3.select("#piechart").append("svg").attr({width: width, height: height})
                .append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            d3.csv("./json/data.csv", function(error, data) {
                data.forEach(function(d) {
                    d.population = +d.population;
                });

                var g = svg.selectAll(".arc")
                    .data(pie(data))
                    .enter().append("g")
                    .attr("class", "arc");

                g.append("path")
                    .attr("d", arc)
                    .style("fill", function(d) { return color(d.data.age); });

                g.append("text")
                    .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
                    .attr("dy", ".35em")
                    .style("text-anchor", "middle")
                    .text(function(d) { return d.data.age; });
            });
        },

        drawBarChart: function() {

            var width = 960, height = 500,
                data = [4, 8, 15, 16, 23, 42],
                y = d3.scale.linear().range([height, 0]),
                chart = d3.select(".d3chart").attr({width: width, height: height});
        },

        learnSomething: function() {
            var alphabet = "abcdefghijklmnopqrstuvwxyz".split(""),
                width = 960, height = 500,
                svg = undefined;

            svg = d3.select('#piechart').append('svg').attr({width: width, height: height})
                    .append('g').attr('transform' , 'translate(0,' + height / 4 + ')');


            // piechart.update(alphabet);

            // piechart.update(piechart.shuffle(alphabet).slice(0, Math.floor(Math.random() * 26)).sort());

            
            // window.setInterval(function() {
            //   piechart.update(piechart.shuffle(alphabet)
            //       .slice(0, Math.floor(Math.random() * 26)).sort());
            // }, 3000);
        },

        shuffle: function(array) {
            var m = array.length, t, i;

            while (m) {
                i = Math.floor(Math.random() * m--);
                t = array[m];
                array[m] = array[i];
                array[i] = t;
            }
            return array;
        },

        update: function(data) {

            log('--function update--');
            // DATA JOIN
            // Join new data with old elements, if any.
            var text = d3.select('#piechart g').selectAll("text").data(data, function(d) { return d; });

            // UPDATE
            // Update old elements as needed.
            text.attr("class", "update")
            .transition().duration(750)
            .attr({x: function(d, i) { log('update'); return i * 20; }});

            // ENTER
            // Create new elements as needed.
            text.enter().append("text").attr({class: 'enter', dy: '.35em'})
                .text(function(d) { return d; })
                .attr({x: function(d, i) { log('enter'); return i * 20; }});          

            // ENTER + UPDATE
            // Appending to the enter selection expands the update selection to include
            // entering elements; so, operations on the update selection after appending to
            // the enter selection will apply to both entering and updating nodes.
            
            // text.attr({x: function(d, i) { return i * 20; }})

            // EXIT
            // Remove old elements as needed.
            text.exit().remove();
        },

        traceRawData: function() {
            var meal = game.currentMeal,
                mealVals = game.calcMealVals(game.currentMeal),
                html = '',
                data = [];

            log('traceRawData');
            // log(mealVals);

            for (var i = 0; i < meal.length; i++) {
                
                // log(meal[i]);
                // log('label: ' + meal[i].label);                
                // log('co2: ' + meal[i].c02);
                // log('percentage: ' + (meal[i].c02 / mealVals.co2) * 100);
                // log('--<br>');

                html += 'label: ' + meal[i].label;
                html += '<br>percentage: ' + (meal[i].c02 / mealVals.co2) * 100;
                html += '<br>----------';

                data.push({serving: meal[i].serving, 
                    c02: meal[i].c02,
                    kcal: meal[i].kcal,
                    color: meal[i].color, 
                    label: meal[i].label, value: (meal[i].c02 / mealVals.co2) * 100});
            }           

            refs.$piechart.empty();

            var width = 540, height = 540, radius = height / 2;

            // return;
            
            // data = [{"label":"Category A", "value": 10, test: 'test a'}, 
            //         {"label":"Category B", "value": 20, test: 'test b'}, 
            //         {"label":"Category C", "value": 30, test: 'test c'},
            //         {"label":"Category D", "value": 40, test: 'test d'}];

            // data = [{"label":"Category B", "value": 70}];

            var vis = d3.select('#piechart').append("svg:svg").attr("class", "big").data([data]).attr({width: width, height: height})
                    .append("svg:g").attr("transform", "translate(" + radius + "," + radius + ")");

            var pie = d3.layout.pie().value(function(d) {
                log(d.value);
                return d.value;
            });           

            // declare an arc generator function
            var arc = d3.svg.arc().outerRadius(radius).innerRadius(0);

            piechart.arc = arc;

            // select paths, use arc generator to draw
            var arcs = vis.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");

            // log(arcs);
            
            arcs.append("svg:path")
                .attr("fill", function(d, i) {
                    log('fill');
                    log(d.data);
                    // return color(i);
                    return d.data.color;
                })
                // .attr("d", function(d,i) { log('---');log(d); log(i); return arc({startAngle: 0, endAngle: 3.143185307179587});})
                // .each(function(d) { this._current = d; })
                .attr("opacity", 0)
                .transition()
                .duration(750)
                .attr("d", arc)
                .attr("opacity", 1)
                // .attrTween("d", piechart.arcTween);

                // .attr("d", function (d) {
                //     // log the result of the arc generator to show how cool it is :)
                //     log('--');
                //     log(d);
                //     log(arc(d));
                //     return arc(d);
                // });

            
            // add the text
            arcs.append("svg:text").attr("transform", function(d) {
                d.innerRadius = 0;
                d.outerRadius = radius;
                return "translate(" + arc.centroid(d) + ")";}).attr("text-anchor", "middle").html( function(d, i) {
                    log('hola');
                    var txt = '<tspan x="0">' + data[i].serving + ' g ' + data[i].label + '</tspan>';
                        txt += '<tspan x="0" dy="15">' + data[i].c02 + ' kg CO2' + '</tspan>';
                return txt;
                       
                });
            

            piechart.littlePie(); 


            $('#piechart').append('<svg class="txt" width="540" height="540"><g transform="translate(250,250)">');
            $('svg.txt g').append($('svg.big text'));

                      
        },

        littlePie: function() {
            var width = 100, height = 100, radius = height / 2,
                data = [{"label":"CO2", "value": 90, color: game.constants.PIECOLOR}, 
                        {"label":"", "value": 10, color: '#e8e8e8'}],
                vals = game.calcMealVals(game.currentMeal);

            var vis = d3.select('#piechart').append("svg:svg").data([data]).attr("class", "little").attr({width: 2.5*width, height: height})
                    .append("svg:g").attr("transform", "translate(" + radius + "," + radius + ")");
                    

            //  second miniplate
            d3.select('svg.little').append("svg:g").attr("class", "little2").attr("transform", "translate(" + Math.round(3.1*radius) + "," + radius + ")");

            var percentage = vals.co2 / game.co2_max,
                percentage2 = NaN;

             if (percentage > 1) {
                percentage2 = percentage - 1;
                percentage = 1;
             }
            
            data[0].value = percentage;
            data[1].value = 1 - percentage;

            log('---- percentage ------');
            log(percentage);

            var pie = d3.layout.pie().sort(null).value(function(d) {
                // log(d.value);
                return d.value;
            });           

            // declare an arc generator function
            var arc = d3.svg.arc().outerRadius(radius).innerRadius(radius * game.constants.RADIUS_INNER);

            piechart.arc = arc;

            // select paths, use arc generator to draw
            var arcs = vis.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");

            // log(arcs);
            
            arcs.append("svg:path")
                .attr("fill", function(d, i) {
                    log('fill');
                    log(d.data);
                    // return color(i);
                    return d.data.color;
                })
                // .attr("d", function(d,i) { log('---');log(d); log(i); return arc({startAngle: 0, endAngle: 3.143185307179587});})
                // .each(function(d) { this._current = d; })
                .attr("opacity", 0)
                .transition()
                .duration(750)
                .attr("d", arc)
                .attr("opacity", function(d,i) { var opacity = i == 0 ? 1 : .6; return opacity; });
            // add the text
            arcs.append("svg:text").attr("transform", function(d) {
                d.innerRadius = 0;
                d.outerRadius = radius;
                return "translate(" + arc.centroid(d) + ")";}).attr("text-anchor", "middle").text( function(d, i) {
                    // data[i].value
                return data[i].label;
                       
                }
                );

            if (!isNaN(percentage2)) {
                piechart.little2(radius, percentage2);
            }
        },

        little2: function(radius, percentage) {
            log('little2');
            var data = [{"label":"CO2", "value": 10, color: game.constants.PIECOLOR},{"label":"", "value": 90, color: '#e8e8e8'}],
                vis = d3.select('#piechart g.little2').data([data]);          

            var pie = d3.layout.pie().sort(null).value(function(d) { return d.value; }); 


            if (percentage > 1) percentage = 1;
            
            data[0].value = percentage;
            data[1].value = 1 - percentage;          

            // declare an arc generator function
            var arc = d3.svg.arc().outerRadius(radius).innerRadius(radius * game.constants.RADIUS_INNER);

            // select paths, use arc generator to draw
            var arcs = vis.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");

            arcs.append("svg:path")
            .attr("fill", function(d, i) {
                log('fill little2');
                log(d.data);
                // return color(i);
                return d.data.color;
            })
            // .attr("d", function(d,i) { log('---');log(d); log(i); return arc({startAngle: 0, endAngle: 3.143185307179587});})
            // .each(function(d) { this._current = d; })
            .attr("opacity", 0)
            .transition()
            .duration(750)
            .attr("d", arc)
            .attr("opacity", function(d,i) { var opacity = i == 0 ? 1 : .6; return opacity; });

            // add the text
            arcs.append("svg:text").attr("transform", function(d) {
                d.innerRadius = 0;
                d.outerRadius = radius;
                return "translate(" + arc.centroid(d) + ")";}).attr("text-anchor", "middle").text( function(d, i) {
                    // data[i].value
                return data[i].label;
                       
                }
                );

        }
    };

    hud = {
        showButton: function(selector) {
            $('.hud-new .' + selector).removeClass('hidden').fadeTo(constants.FADEIN_SPEED, 1);
        },

        hideButton: function(selector) {
            $('.hud-new .' + selector).fadeTo(constants.FADEOUT_SPEED, 0, function() { $(this).addClass('hidden'); });
        }
    }

    intro = {

        clearplate: false,

        init: function() {
            var delays = [1000, 200, 200, 200],
                buttonDelay = 1000,
                delay = 0,
                html = '';

            for (var i = 0; i < delays.length; i++) {
                html += '<div></div>';
            }

            refs.$intro.empty().html(html);
            game.addPlate();
            intro.clearplate = true;

            $('.intro-container > div').each(function(i, el) {
                delay += delays[i];
                $(el).delay(delay).fadeTo(constants.FADEIN_SPEED, 1);
            });

            delay += buttonDelay;
            setTimeout(hud.showButton, delay, buttons.START_TRIAL);
        },

        hide: function() {
            refs.$intro.fadeTo(constants.FADEOUT_SPEED, 0, function() { $(this).remove(); });
            hud.hideButton(buttons.START_TRIAL);
            setTimeout(app.startGame, 1000);
        }
    }

    /********** Game **********/
    
    game.startNewGame = function() {

        log('startNewGame');
        
        storm.stop();
        confettis.stop();
        app.stopSound('startNewGame');
        
        clearTimeout(game.showFeedbackInt);
        
        game.running = true;
        game.currentFoodCat = game.constants.DEFAULT_TAB;
        game.platesCounter++;
            
        //  resets after first game
        if (game.currentMeal.length > 0) {
            refs.$menu.fadeIn();
            refs.$mealCheck.removeClass('visible');
            setTimeout(function() { refs.$mealCheck.removeClass('failed'); }, 2000);

            app.resetChart();
        }

        setTimeout(cutlery.trigger, 2000, game.trialmode ? game.BUBBLES_TRIAL_START : game.BUBBLES_NEWGAME);
        
        //  resets
        game.currentMeal = [];
        game.foodCounter = 0;
        game.mealMix = {veggies: 0, sides: 0, animals: 0};
        game.freezeTab = {0: false, 1: false, 2: false};
        game.activeTabID = NaN;
        game.$activeTab = undefined;
        game.lastSound = undefined;
        refs.$piechart.empty();

        // refs.$foodstack.empty();
        debug.printObject({});
        
        $('.navi-container > div.freeze').removeClass('freeze');

        game.addPlate();
        
        app.playSound(sounds.NEW_GAME);
        $('.navi-container .' + game.constants.DEFAULT_TAB).trigger(configs.clickEvent, 'no-sound');

        barchart.reset();

        //  temp
        // barchart.showHud();
    },

    game.addPlate = function() {

        if (intro.clearplate) {
            intro.clearplate = false;
            return;
        }

        var html = '<div class="plate"></div>';

        // log('HOLA: ' + $('.plate').children().length);

        refs.$plates.empty().append(html);
        // refs.$plate =  $(dq.refs.$plates.children()[dq.refs.$plates.children().length - 1]);
        refs.$plate = $('.plate');
        if (!configs.isTouch) refs.$plate.addClass('desktop');
        refs.$plate.fadeIn();
    },
    
    game.addFood = function(specs, $target) {
        specs.$target = $target;
        game.currentMeal.push(specs);
    }

    game.removeFood = function($target) {

        var label = $target.data('specs').label;

        for (var i = 0; i < game.currentMeal.length; i++) {

            if (game.currentMeal[i].label === label) {
                game.currentMeal.splice(i, 1);
            }
        }

        $target.fadeOut(constants.FADE_OUT, function() { log('removed'); log($(this)); $(this).remove(); });
    },
    
    game.calcMealVals = function(meal) {
        var cals = 0, co2 = 0;
        
        for (var i = 0; i < meal.length; i++) {
            cals += meal[i].kcal;
            co2 += meal[i].c02;
        }
        
        return {cals: cals, co2: co2};
    }
    
    game.getFeedback = function(meal) {
        //var cals = 0, co2 = 0;
        
        var worstFood = '', bestFood = '',
            maxCO2 = 0, minCO2 = 10000000;
            
        // add check: worstFood in json, bestFood in json
        
        for (var i = 0; i < meal.length; i++) {
            
            if (meal[i].c02 > maxCO2 && helper.isInArray(meal[i].label, game.worstFoodsAry)) {
                maxCO2 = meal[i].c02;
                worstFood = meal[i].label;
            }
            
            if (meal[i].c02 < minCO2 && helper.isInArray(meal[i].label, game.bestFoodsAry)) {
                minCO2 = meal[i].c02;
                bestFood = meal[i].label;
            }
        }
        
        return {worstFood: worstFood, bestFood: bestFood};
    }
    
    game.isVegan = function(meal) {
        var isVegan = true;
        
        for (var i = 0; i < meal.length; i++) {
            if (meal[i].foodCat === 'animals') isVegan = false;
        }
        
        return isVegan;
    }
    
    game.checkMealVals = function($target) {
        var vals = game.calcMealVals(game.currentMeal),
            tooMuchC02 = (vals.co2 >= game.co2_max),
            enoughCalories = (vals.cals >= game.kcal_min),
            gameOver = tooMuchC02 || enoughCalories,
            startAniDelay = 500,
            showChartDelay = 5000;
        
        if (gameOver) {
            game.running = false;
            refs.$menu.fadeOut();

            game.addMealToGallery(vals, tooMuchC02, vals.co2 / game.co2_max);

            window.setTimeout(barchart.showHud, 500);
            app.generateChart();
            
            //app.freezeFoodMenu();
            
            if (tooMuchC02) {
                // lost
                log('---------- lost ----------');
                cutlery.trigger(game.BUBBLES_FAILED);
                refs.$mealCheck.addClass('failed');
                setTimeout(storm.start, startAniDelay);
                
                game.showFeedbackInt = setTimeout(cutlery.trigger, showChartDelay, game.BUBBLES_NEGATIVE);
            } else {
                // won
                log('---------- won ----------');
                cutlery.trigger(game.BUBBLES_SUCCESS);
                setTimeout(confettis.init, startAniDelay);
                game.showFeedbackInt = setTimeout(cutlery.trigger, showChartDelay, game.BUBBLES_POSITIVE);
            }

            $target = undefined;
        }

        app.generateChart($target);
    }

    game.addMealToGallery = function(vals, lost, ratio) {
        log('addMealToGallery');

        for (var i = 0; i < game.currentMeal.length; i++) {
            game.currentMeal[i].x = game.currentMeal[i].$target.css('left');
            game.currentMeal[i].y = game.currentMeal[i].$target.css('top');
            delete game.currentMeal[i].$target;
        }

        var dish = {stats: {kcal: vals.cals, co2: vals.co2, lost: lost, ratio: ratio, date: Date.now()}};
            dish.ingredients = game.currentMeal;

        game.meals.unshift(dish);

        $.ajax({
            type: 'POST',
            dataType : 'text',
            async: true,
            url: './json/write-json.php',
            data: {data: JSON.stringify(game.meals)},
            success: function (data) {
                console.log(data);
                // String: SUCCESS || TRUE
            }
        });


    },
    
    game.checkFoodMix = function() {
        
        if (game.mealMix[game.currentFoodCat] === app.json.rules.switch_tab[game.currentFoodCat]) {
            
            if (game.currentFoodCat === 'veggies') cutlery.trigger(game.BUBBLES_FREEZE_VEGGIES);
            else if (game.currentFoodCat === 'sides') cutlery.trigger(game.BUBBLES_FREEZE_SIDES);
            
            app.freezeFoodMenu();
        }
    }

    /*
    game.addToFoodstack = function(specs, $foodOnPlate) {
        var id = 'foodstack-' + game.currentMeal.length, 
            foodHTML = '<div class="food-ref" id="' + id + '">' + specs.label + ', ' + specs.kcal + ' kcal<span>x</span></div>',
            $foodRef = undefined;

        refs.$foodstack.prepend(foodHTML);

        $foodRef = $('#' + id);


        $foodRef.data('$foodOnPlate', $foodOnPlate);
        $foodRef.data('label', specs.label);

        $foodRef.on(configs.clickEvent, function() {             
            $(this).data('$foodOnPlate').trigger(configs.clickEvent, 'clicked-on-stackbutton');
            $(this).fadeOut(constants.FADE_OUT, function() { $(this).remove(); });
            game.removeFood($(this).data('label')); 
        });
    }
    */
    
    /********** Dragfood **********/
    
    dragfood = {
        
        droppClassAdded: false,

        removeFromPlate: function($ref, extraparam) {
            var onPlate = false,
                $foodref = extraparam === 'clicked' ? $ref : $(this);
                // foodStackID = $foodref.data('foodStackID');
            
            refs.$body.removeClass('hidesvg');


            refs.$dragfood = $foodref;
            onPlate = dragfood.calcDistance(true);

            log('removeFromPlate');
            log('extraparam: ' + extraparam)
            log($foodref);
            log('onPlate: ' + onPlate);

            if (onPlate) {

                log('--- APPEND ON PLATE ----');  
                dragfood.setOffPlateVals($foodref,$foodref.css('left'), $foodref.css('top'));

                dragfood.setOnPlateVals($foodref);
                refs.$plate.append($foodref);

                dragfood.setDroppableStatus(false);

            } else {
                game.removeFood($(this));
            }
        },

        setOffPlateVals: function($target, left, top) {
            $target.data('offplate-left', left);
            $target.data('offplate-top', top);
        },

        setOnPlateVals: function($target) {

            log('setOnPlateVals');
            log('target-offleft: ' + $target.offset().left);
            log('plate-offleft: ' + refs.$plate.offset().left);

            $target.css({left: $target.offset().left - dq.refs.$plate.offset().left, top: $target.offset().top - dq.refs.$plate.offset().top});
            log($target.css('left'));
            log($target.css('right'));
        },
        
        stopDragging: function() {
            
            var onPlate = dragfood.calcDistance(true),
                foodID = 'food-' + game.meals.length + '-' + game.foodCounter,
                foodHTML = '<div class="food" id="' + foodID + '"></div>',
                left = dq.refs.$dragfood.offset().left,
                top = dq.refs.$dragfood.offset().top,
                specs = $(this).data('specs'),
                $newFood = undefined;
                
            refs.$plate.append(foodHTML);
            $newFood = $('#' + foodID);

            window.setTimeout(svg.loadSVG, 1000, $newFood, specs);
            
            // game.foodCounter++;
            $newFood.css({left: left - dq.refs.$plate.offset().left, top: top - dq.refs.$plate.offset().top});
            
            dragfood.setBackground($newFood, specs);
        
            if (onPlate) {
                log('on plate');

                game.addFood(specs, $newFood);
                // game.addToFoodstack(specs, $newFood);
                
                //  cutlery / bubbles
                cutlery.setExpression(specs);
               
                //  tmp Code
                if (game.trialmode) {
                    // setTimeout(cutlery.trigger, 1000, game.BUBBLES_TRIAL_LOST);
                    setTimeout(cutlery.trigger, 1000, game.BUBBLES_TRIAL_WON);
                }

                $newFood.data('specs', specs);
                dragfood.setOffPlateVals($newFood,dq.refs.$dragfood.css('left'), dq.refs.$dragfood.css('top'));
                // $newFood.data('foodStackID', game.currentMeal.length);
                
                if (app.json.rules.food_only_once) {
                    $(this).addClass('inactive').draggable('disable');
                }
                
                game.mealMix[specs.foodCat]++;
                game.checkFoodMix();
                game.checkMealVals($newFood);
                
                // debug.printObject(specs);
                debug.printObject(game.calcMealVals(game.currentMeal), true);

                //  food clickstart
                $newFood.on(configs.clickEvent, function(e, triggered) { 

                    log('START: move-food-on-plate');

                    //  if triggerd by foodstack-btn
                    if (triggered) {
                        $(this).fadeOut(constants.FADE_OUT, function() { $(this).remove(); });
                       
                    } else {

                        log('--- APPEND OFF PLATE ----');
                        refs.$foodCont.append($(this));
                        $(this).css({left: $(this).data('offplate-left'), top: $(this).data('offplate-top')});
                    }             
                });

                 //  food clickend
                $newFood.on(configs.clickEventEnd, function(e) { 
                    log('END: move-food-on-plate');  
                    dragfood.removeFromPlate($(this), 'clicked');
                });

                // $newFood.draggable();
                $newFood.draggable({
                    start: function(e, ui) {
                        refs.$dragfood = ui.helper;
                        refs.$dragfood.addClass('dragged');
                        // $(this).addClass('hidesvg');
                        refs.$body.addClass('hidesvg');
                    },
                    stop: dragfood.removeFromPlate
                    // drag: $.throttle(300, dragfood.calcDistance)
                });
                
                // app.generateChart($newFood);
                
            } else {
                $newFood.fadeOut(constants.FADE_OUT, function() { $(this).remove(); });
            }
            
            dragfood.setDroppableStatus(false);  
            refs.$body.removeClass('hidesvg');
            
            app.playSound(sounds.DROPPED_FOOD);
            game.foodCounter++;
        },
        
        setDroppableStatus: function(droppable) {
            
            if (droppable) {
                if (!dragfood.droppClassAdded) {
                    dragfood.droppClassAdded = true;
                    dq.refs.$plate.addClass('drop');
                }
            } else {
                if (dragfood.droppClassAdded) {
                    dragfood.droppClassAdded = false;
                    dq.refs.$plate.removeClass('drop');
                }
            }
        },
        
        calcDistance: function(dropped) {
            
            if (typeof dropped === 'object') dropped = false;
            
            //log('calcDistance / dropped: ' + dropped);
            
            var food_x = dq.refs.$dragfood.offset().left + constants.FOOD_HOR,
                food_y = dq.refs.$dragfood.offset().top + constants.FOOD_VERT,
                plate_x = dq.refs.$plate.offset().left + constants.PLATE_RAD,
                plate_y = dq.refs.$plate.offset().top + constants.PLATE_RAD,
                x = plate_x - food_x,
                y = plate_y - food_y,
                //dist = Math.round(Math.sqrt(x*x + y*y)),
                dist = Math.round(x*x + y*y),
                onPlate = (dist < constants.PLATE_DISTANCE);
            
            dragfood.setDroppableStatus(onPlate);

            // log('------');
            // log('calcDistance');
            // log('dist:' + dist);
            
            if (dropped) return onPlate;
            else return true;
        },
        
        setBackground: function($el, specs) {
            var backgroundImage = 'url(./img/svg/onplate/' + specs.foodCat + '/' + specs.bgHorPos + '.svg)';
            $el.css({backgroundImage: backgroundImage});
        }
    }
    
    /********** Confettis **********/
    
    confettis = {
        FPS: 30,
        HOW_MANY: 200, // ipad: 200
        
        init: function() {
            
            var confHtml = '<div class="conf"></div>',
                html = '', transition = '',
                top = 330, left = 512,
                speed = NaN,
                delay = NaN,
                translate = 'translate(0px,0px)',
                speedAry = [1.3,1.8,2.4],
                colorsAry = ['orange', 'purple', 'green', 'yellow', 'blue'],
                rid = NaN;
                
            for (var i = 0; i < confettis.HOW_MANY; i++) {
                html += confHtml;
            }
            
            refs.$confettis.empty().append(html).addClass('active');
            
            $('.conf').each(function(i) {
                rid = Math.floor(Math.random() * speedAry.length);
                speed = speedAry[rid] * 0.8;
                delay = helper.roundNumber(0.3 + Math.random() * 2.2, 10);
                
                if (Math.random() <= 0.5) {
                    $(this).addClass('small');
                }
                
                transition = '-webkit-transform ' + speed + 's linear ' + delay + 's';
                translate = 'translate(' + left + 'px,' + top + 'px)';
                $(this).css({'transform': translate}).data('transition', transition).addClass(colorsAry[helper.getRandomNumber(colorsAry.length)]);
                
            });
            
            confettis.setTransition();
            setTimeout(confettis.start, 200);
        },
        
        setTransition: function() {
            $('.conf').each(function(i) {
                $(this).css({'transition': $(this).data('transition')})
            });
        },
        
        start: function() {
            
            app.playSound(sounds.SUCCESS);
            
            var left = 0,
                top = 0,
                translate = 'translate(' + left + 'px,' + top + 'px)',
                range =  2 * Math.PI,
                alpha = NaN,
                scale = 1.85;
            
            $('.conf').each(function(i) {
                alpha = Math.random() * range;
                left =  $(this).position().left +  Math.cos(alpha) * $(this).offset().left * scale;
                top =  $(this).position().top +  Math.sin(alpha) * $(this).offset().top * scale;
                
                translate = 'translate(' + left + 'px,' + top + 'px)';
                $(this).css({'transform': translate});
            });
        },
        
        stop: function() {
            refs.$confettis.removeClass('active');
        }
    }
    
    /********** Storm **********/
    
    storm = {
        
        ANI_LENGTH: 8000,
        $storm: $('#anitest'),
        boltInt: NaN,
        moveBackInt: NaN,
        killSoundInt: NaN,
        stopStormInt: NaN,
        stormOn: false,
        
        start: function() {
            
            storm.stormOn = true;
            
            storm.$storm.addClass('rotate').css({left: refs.$window.width()});
            storm.$storm.removeClass('transparent');
            storm.moveBackInt = setTimeout(function() { storm.$storm.removeClass('rotate').removeAttr('style'); }, 4500);
            //storm.killSoundInt = setTimeout(app.stopSound, storm.ANI_LENGTH, 'killSoundInt');
            storm.stopStormInt = setTimeout(storm.stop, storm.ANI_LENGTH);
            
            storm.boltInt = setInterval(function() {
                if (Math.random() > 0.5) {
                    refs.$actBolt = $(refs.$bolts[helper.getRandomNumber(refs.$bolts.length)]);
                    refs.$actBolt.removeClass('hidden');
                    setTimeout(function() { refs.$actBolt.addClass('hidden'); }, 150);
                }
            }, 300);
            
            
            app.playSound(sounds.FAILED, false);
        },
        
        stop: function() {
            
            if (!storm.stormOn) return;
            
            log('--- stop storm ----');
            storm.stormOn = false;
            storm.$storm.removeClass('rotate').addClass('transparent').removeAttr('style');
            clearInterval(storm.boltInt);
            clearTimeout(storm.killSoundInt);
            clearTimeout(storm.moveBackInt);
            clearTimeout(storm.stopStormInt);
        }
    }
    
    /********** Cutlery **********/
    
    cutlery = {
        
        showBubbleTO: NaN,
        hideBubbleTO: NaN,
        showDelay: NaN,
        hideDelay: NaN,
        bubblemode: undefined,
        bubbleData: {},
        chatid: 0,
        SHOW_BUBBLETXT: true,
        
        trigger: function(bubblemode) {
            
            log('trigger / bubblemode: ' + bubblemode);
            
            var arrayID = NaN, rid = NaN, bubbleData = {}, worstFood = '', bestFood = '',
                exprAry = [], bgIDsAry = [], bgid = NaN,
                hideBubble = false;
            
            switch(bubblemode) {
                case game.BUBBLES_NEWGAME:
                    arrayID = (game.platesCounter < 3) ? game.platesCounter : 2;
                    rid = helper.getRandomNumber(app.json.expressions[bubblemode][arrayID].length);
                    bubbleData = app.json.expressions[bubblemode][arrayID][rid];
                    break;
                
                case game.BUBBLES_FAILED:
                    if (game.platesCounter < 2) arrayID = game.platesCounter;
                    else if (game.platesCounter === 2) arrayID = 1;
                    else arrayID = 2;
                    
                    rid = helper.getRandomNumber(app.json.expressions[bubblemode][arrayID].length);
                    bubbleData = app.json.expressions[bubblemode][arrayID][rid];
                    break;
                
                case game.BUBBLES_SUCCESS:
                case game.BUBBLES_FREEZE_SIDES:
                case game.BUBBLES_FREEZE_VEGGIES:
                    rid = helper.getRandomNumber(app.json.expressions[bubblemode][0].length);
                    bubbleData = app.json.expressions[bubblemode][0][rid];
                    break;
                
                case game.BUBBLES_POSITIVE:
                    //  new logic needed: triggerd by potatoes, tofu, no-animals, or nothing
                    //rid = helper.getRandomNumber(app.json.expressions[bubblemode][0].length);
                    //bubbleData = app.json.expressions[bubblemode][0][rid];
                    
                    log('game.BUBBLES_POSITIVE');
                    
                    bestFood = game.getFeedback(game.currentMeal).bestFood;
                    
                    //  check for vegan menu, overrules specific stuff
                    if (game.isVegan(game.currentMeal)) bestFood = 'no-animals';
                    
                    log('bestFood: ' + bestFood);
                    
                    var exprAry = app.json.expressions.positive[0], bgIDsAry = [], bgid = NaN;
                    
                    for (var i = 0; i < exprAry.length; i++) {
                        if (exprAry[i]['triggered-by'] === bestFood) {
                            bgIDsAry.push(exprAry[i]['bgid']);
                        }
                    }
                    
                    log(bgIDsAry);
                    log(bgIDsAry.length);

                    //  no food specific message found
                    if (bgIDsAry.length === 0) return;
                    
                    rid = helper.getRandomNumber(bgIDsAry.length);
                    bgid = bgIDsAry[rid];
                    
                    bgid -= 5;
                    
                    bubbleData = app.json.expressions[bubblemode][0][bgid];
                    
                    break;
                
                case game.BUBBLES_NEGATIVE:
                    log('game.BUBBLES_NEGATIVE');
                    
                    worstFood = game.getFeedback(game.currentMeal).worstFood;
                    
                    var exprAry = app.json.expressions.negative[0], bgIDsAry = [], bgid = NaN;
                    
                    for (var i = 0; i < exprAry.length; i++) {
                        if (exprAry[i]['triggered-by'] === worstFood) {
                            bgIDsAry.push(exprAry[i]['bgid']);
                        }
                    }
                    
                    log('worstFood: ' + worstFood);
                    
                    log(bgIDsAry);
                    log(bgIDsAry.length);

                    //  no food specific message found
                    if (bgIDsAry.length === 0) return;
                    
                    //rid = helper.getRandomNumber(app.json.expressions[bubblemode][0].length);
                    
                    rid = helper.getRandomNumber(bgIDsAry.length);
                    bgid = bgIDsAry[rid];
                    
                    //bubbleData = app.json.expressions[bubblemode][0][rid];
                    bubbleData = app.json.expressions[bubblemode][0][bgid];
                    //bubbleData = app.json.expressions[bubblemode][0][7];
                    break;

                case game.BUBBLES_TRIAL_START:
                case game.BUBBLES_TRIAL_WON:
                case game.BUBBLES_TRIAL_LOST:
                    
                    if (cutlery.chatid === app.json.expressions[bubblemode][0].length) {
                        cutlery.chatid = 0;
                        hideBubble = true;

                        if (bubblemode !== game.BUBBLES_TRIAL_START) {
                            app.stopTrialMode();
                        }

                        break;
                    }
                    
                    bubbleData = app.json.expressions[bubblemode][0][cutlery.chatid];
                    cutlery.chatid++;

                    cutlery.triggerNextBubble(bubbleData.showNext, bubblemode);
                    break;
            }
            
            cutlery.bubbleData = bubbleData;
            cutlery.bubblemode = bubblemode;

            if (!!bubbleData.standard) {
                cutlery.bubblemode = bubbleData.standard;
            }

            // log(bubbleData);
            // log(bubblemode);

            if (hideBubble) cutlery.hideBubble();
            else cutlery.setExpression(bubbleData, bubblemode);
        },
        
        setExpression: function(bubbleData, bubblemode) {
            
            log('setExpression / bubblemode: ' + bubblemode);
            
            var spoonID = parseInt(bubbleData.exp.split(',')[0].substr(1)),
                forkID = parseInt(bubbleData.exp.split(',')[1].substr(1)),
                backgroundPosition = -game.constants.CUTLERY_HOROFF * (forkID - 1) + 'px 0';
            
            refs.$fork.css({backgroundPosition: backgroundPosition});
            
            backgroundPosition = -game.constants.CUTLERY_HOROFF * (spoonID - 1) + 'px 0';
            refs.$spoon.css({backgroundPosition: backgroundPosition});
            
            cutlery.hideBubble();
            clearTimeout(cutlery.showBubbleTO);
            
            if (bubblemode) {
                // cutlery.showBubbleTO = setTimeout(cutlery.showBubble, cutlery.showDelay);
                cutlery.showBubbleTO = setTimeout(cutlery.showBubble, 150);
            }
        },

        triggerNextBubble: function(delay, mode) {
            setTimeout(cutlery.trigger, delay, mode);
        },
        
        showBubble: function() {

            log('showBubble');
            
            var vertOffset = (!!cutlery.bubbleData.standard) ? 200 : 150;
            
            var data = cutlery.bubbleData,
                backgroundPosition = '0px ' + -vertOffset * data.bgid + 'px',
                $ref = (data.txt.split(';')[0].indexOf('G') >= 0) ? refs.$forkBub: refs.$spoonBub;

            //  debug
            if (cutlery.SHOW_BUBBLETXT) {
                $ref.html('<p>' + data.txt.split(';')[1] + '</p>');
            }
            
            $ref.css({backgroundPosition: backgroundPosition});
            
            $ref.removeClass().addClass('bubble visible');
            $ref.addClass(cutlery.bubblemode);
            
            clearTimeout(cutlery.hideBubbleTO);

            if (!game.trialmode) {
                cutlery.hideBubbleTO = setTimeout(cutlery.hideBubble, cutlery.hideDelay);
            }
        },
        
        hideBubble: function() {
            log('hideBubble'); 
            // return;
            refs.$spoonBub.removeClass('visible');
            refs.$forkBub.removeClass('visible');
        },
        
        clearTimeouts: function() {
            
        }
    }
    
    /********** Debug **********/
    
    debug = {
        printObject: function(data, noClear) {
            var html = noClear ? $('[role="debug"] p').html() : '';
            
            for (var key in data) {
                html += key + ': ' + data[key] + '<br>'
            }
            
            $('[role="debug"] p').html(html);
        }
    }

     return {
        refs: refs,
        constants: constants,
        app: app,
        gallery: gallery,
        game: game,
        barchart: barchart,
        piechart: piechart,
        cutlery: cutlery,
        confettis: confettis,
        storm: storm
    };

}(jQuery, window));

/*
 * INTRO > TRIAL > VIDEO > GAME
 * 
 * 
 */