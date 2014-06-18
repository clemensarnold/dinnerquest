var dq = (function($, window, undefined) {
    
    "use strict";
    
    var refs = {
        $window: $(window),
        $document: $(document),
        $dragfood: undefined,
        $plates: $('#plates'),
        $chart: $('#chart'),
        $plate: undefined,
        $fork: $('.fork'),
        $spoon: $('.spoon'),
        $forkBub: $('.fork .bubble'),
        $spoonBub: $('.spoon .bubble'),
        $menu: $('.menu-wrapper'),
        $foodCont: $('.food-container'),
        $mealCheck: $('.meal-check'),
        $infopage: $('#infopage'),
        $infobtn: $('.info'),
        $audiocontainer: $('#audiocontainer'),
        $videocontainer: $('#videocontainer'),
        $thunder: $('#thunder'),
        $confettis: $('#confettis'),
        $storm: $("#storm"),
        $bolt :$("#bolt")
    },
    configs = {
        isTouch: 'ontouchstart' in window,
        clickEvent: ('ontouchstart' in window) ? 'touchstart' : 'mousedown',
        stats: undefined
    },
    game = {
        co2_max: NaN,
        kcal_min: NaN,
        inactive_restart: NaN,
        inactive_fallasleep: NaN,
        inactivityCounter: 0,
        started: false,
        sleeping: false,
        constants: {
            FOODITEMS_VERTOFF: {veggies: 0, sides: -105, animals: -210},
            FOODITEMS_VERTOFF_BIG: {veggies: 0, sides: NaN, animals: NaN},
            FOOD_CATS: ['veggies', 'sides', 'animals'],
            FOOD_BGVERT_OFF: {veggies: 0, sides: 1, animals: 2},
            DEFAULT_TAB: 'veggies', 
            FOOD_BIG_DIMS: 450,
            CUTLERY_HOROFF: 120,
            FPS: 30,
            SNORE_EXP: "L04,G07",
            WAKEUP_EXP: "L01,G01"
        },
        currentFoodCat: 'veggies',
        currentMeal: [],
        meals: [],
        mealMix: {},
        freezeTab: {},
        activeTabID: NaN,
        $activeTab: undefined,
        platesCounter: -1,
        foodCounter: NaN,
        BUBBLES_NEWGAME: "new-game",
        BUBBLES_FAILED: "failed",
        BUBBLES_SUCCESS: "success"
    },
    app = {},
    dragfood = {},
    debug = {},
    cutlery = {},
    thunder = {},
    storm = {},
    confettis = {},
    constants = {
        DEV: true,
        STATS: true,
        SOUNDS: false,
        SKIP_VIDEO: true,
        URL_HOME: '',
        JSON_PATH: './json/data.json',
        FADE_IN: 200, FADE_OUT: 400, FADE_DELAY: 50,
        FOOD_HOR: NaN, FOOD_VERT: NaN,
        PLATE_RAD: 270, PLATE_DISTANCE: 40000 // 200*200
    },
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
    
    game.sounds = [{selector: '.navi-container > div, #chart', whichSound: sounds.CHANGE_TAB}];
    
    $(function() {
        
        helper.initMisc();
        
        $.getJSON(constants.JSON_PATH, function(data) {
            app.json = data;
            
             //  set balancing-vars from json
            game.co2_max = app.json.rules.co2_max;
            game.kcal_min = app.json.rules.kcal_min;
            game.inactive_fallasleep = app.json.rules.inactive_fallasleep;
            game.inactive_restart = app.json.rules.inactive_restart;
            cutlery.showDelay = app.json.rules.showbubble_delay;
            cutlery.hideDelay = app.json.rules.hidebubble_delay;
            
            app.initApp();
            
            //  tmp code
            $('[role="debug"]').hide();
        });
    });
    
    /********** App **********/
    app = {
        
        initApp: function() {
            
            setInterval(app.checkInactivity, 1000);
            
            game.constants.FOODITEMS_VERTOFF_BIG.sides = -game.constants.FOOD_BIG_DIMS;
            game.constants.FOODITEMS_VERTOFF_BIG.animals = -2 * game.constants.FOOD_BIG_DIMS;
            constants.FOOD_HOR = constants.FOOD_VERT = game.constants.FOOD_BIG_DIMS / 2;
            
            if (constants.DEV) {
                refs.$window.on({keydown: this.keyDownListener});
            }
            
            if (constants.STATS) {
                configs.stats = new Stats();
                configs.stats.setMode(0);
                document.body.appendChild(configs.stats.domElement);
                window.setInterval(function() { configs.stats.update(); }, 1000 / constants.FPS);
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
            
            refs.$videocontainer.on({click: app.startGame});
                        
            if (constants.SKIP_VIDEO) app.startGame();
            else {
                //  start video
            }
            
            refs.$chart.on({click: game.startNewGame});
            refs.$mealCheck.on({click: game.startNewGame});
            
            refs.$infobtn.on({click: function() {
                $(this).toggleClass('close');
                refs.$infopage.hasClass('visible') ? app.hideInfoPage() : app.showInfoPage();
            }});
            
            $('.menu-container').fadeTo(constants.FADE_IN, 1);
            
            //  init sounds
            for (var i = 0; i < game.sounds.length; i++) {
                $(game.sounds[i].selector).data('whichSound', game.sounds[i].whichSound).on(configs.clickEvent, function() {
                    app.playSound($(this).data('whichSound'));
                });
            }
        },
        
        checkInactivity: function() {
            if (game.started) game.inactivityCounter++;
            
            switch(game.inactivityCounter) {
                case game.inactive_fallasleep:
                    game.sleeping = true;
                    cutlery.setExpression({exp: game.constants.SNORE_EXP});
                    app.playSound(sounds.SNORING, true);
                    break;
                
                case game.inactive_restart:
                    app.reload();
                    break;
            }
            
            //log('ia counter: ' + game.inactivityCounter);
        },
        
        stopSleeping: function() {
            game.sleeping = false;
            cutlery.setExpression({exp: game.constants.WAKEUP_EXP});
            app.stopSound();
        },
        
        resetInactCounter: function() {
            game.inactivityCounter = 0;
            
            if (game.sleeping) app.stopSleeping();
        },
        
        startGame: function() {
            game.started = true;
            game.startNewGame();
            refs.$fork.show();
            refs.$spoon.show();
            refs.$videocontainer.hide();
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
            var foodClass = configs.isTouch ? 'm-item touch' : 'm-item',
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
                
                if(!app.isLabelAlreadyInCurrentFood(specs.label)) {
                    $(el).css({backgroundPosition: -i * $(el).width() + 'px ' + vertOff + 'px'}).
                    data('specs', specs).
                    delay(i*constants.FADE_DELAY).fadeTo(400, 1);
                    
                    $(el).draggable({
                        helper: 'clone',
                        cursorAt: {left: constants.FOOD_HOR, top: constants.FOOD_VERT},
                        start: function(e, ui) {
                            refs.$dragfood = ui.helper;
                            refs.$dragfood.addClass('dragged');
                            
                            dragfood.setBackground(refs.$dragfood, $(this).data('specs'));
                        },
                        stop: dragfood.stopDragging,
                        drag: $.throttle(250, dragfood.calcDistance)
                    });
                } else {
                    $(el).css("visibility", "hidden");
                }
            });
        },
        
        switchTab: function(foodCat) {
            $('.navi-container .' + foodCat).trigger(configs.clickEvent);
        },
        
        showInfoPage: function() {
            $('html').addClass('overflow');
            refs.$infopage.addClass('visible');
            dq.refs.$plates.hide();
            dq.refs.$fork.hide();
            dq.refs.$spoon.hide();
            dq.refs.$menu.hide();
        },
        
        convertGrammToKG: function (gramm) {
              return gramm / 1000;
        },
        
        generateChart: function() {
            var html = '',
                specs = {},
                tmpAry = [];
            
            refs.$plate.find('.food').each(function(i, el) {
                
                specs = $(el).data('specs');

                html = '<div class="_CLASSES_"><p>_SERVING_ g _LABEL_<br>_CO2_ KG CO<sub>2</sub</p></div>';
                html = html.replace('_CLASSES_', specs.bigbg ? "big-chart chart" : "normal-chart chart");
                html = html.replace('_SERVING_', specs.serving);
                html = html.replace('_LABEL_', specs.label);
                html = html.replace('_CO2_', app.convertGrammToKG(specs.c02));
               
                $(el).append(html);
               
                if (specs.chart.length > 0) {
                    tmpAry = $(el).data('specs').chart.split(',');
                    $(el).children().css({left: tmpAry[0] + 'px', top: tmpAry[1] + 'px'});
               }
            });
            
            refs.$chart.show();
            
            
            refs.$menu.fadeOut();
            refs.$mealCheck.addClass('visible');

        },
        
        resetChart: function() {
            refs.$chart.hide();
        },
        
        hideInfoPage: function() {
            $('html').removeClass('overflow');
            refs.$infopage.removeClass('visible');
            
            dq.refs.$plates.show();
            dq.refs.$fork.show();
            dq.refs.$spoon.show();
            dq.refs.$menu.show();
        },
        
        reload: function() {
            location.reload();
        },
        
        keyDownListener: function(e) {
            
            //log(e.keyCode);
            
            switch(e.keyCode) {
                case 67: // c
                    debug.printObject(game.calcMealVals(game.currentMeal));
                    break;
                
                case 78:
                    game.startNewGame();
                    break;
            }
        },
        
        playSound: function(whichSound, loop) {
            
            if (!constants.SOUNDS) return;
            
            var sndpath = app.json.sounds[whichSound],
                html = '',
                id = 'active-sound',
                $snd = undefined;
            
            if (Modernizr.audio) {
                html = '<audio id="' + id + '" ';
                if (loop) html += 'loop';
                html += ' class="btn-audio"><source src="./media/sound/' + sndpath + '.mp3" type="audio/mpeg" /></audio>';
                
                refs.$audiocontainer.empty().append(html);
                
                $snd = document.getElementById(id);
                $snd.volume = 0.3;
                $snd.play();
            }
        },
        
        stopSound: function() {
            refs.$audiocontainer.empty();
        }
    }
    
    /********** Game **********/
    
    game.startNewGame = function() {
        var html = '<div class="plate"></div>';
        
        game.platesCounter++;
            
        //  resets after first game
        if (game.currentMeal.length > 0) {
            game.meals.push(game.currentMeal);
            refs.$menu.fadeIn();
            refs.$mealCheck.removeClass('visible');
            setTimeout(function() { refs.$mealCheck.removeClass('failed'); }, 2000);
            
            app.resetChart();
        }
        
        cutlery.trigger(game.BUBBLES_NEWGAME); 
        
        //  resets
        game.currentMeal = [];
        game.foodCounter = 0;
        game.mealMix = {veggies: 0, sides: 0, animals: 0};
        game.freezeTab = {0: false, 1: false, 2: false};
        game.activeTabID = NaN;
        game.$activeTab = undefined;
        
        debug.printObject({});
        
        $('.navi-container > div.freeze').removeClass('freeze');
        
        //  pre-gallery times
        refs.$plates.empty();
        
        refs.$plates.append(html);
        refs.$plate =  $(dq.refs.$plates.children()[dq.refs.$plates.children().length - 1]);
        
        if (!configs.isTouch) refs.$plate.addClass('desktop');
        
        app.playSound(sounds.NEW_GAME);
        app.renderFoodMenu();
        app.switchTab(game.constants.DEFAULT_TAB);
        
        refs.$plate.fadeIn();
    },
    
    game.addFood = function(specs) {
        game.currentMeal.push(specs);
    }
    
    game.calcMealVals = function(meal) {
        var cals = 0, co2 = 0;
        
        for (var i = 0; i < meal.length; i++) {
            cals += meal[i].kcal;
            co2 += meal[i].c02;
        }
        
        return {cals: cals, co2: co2};
    }
    
    game.checkMealVals = function() {
        var vals = game.calcMealVals(game.currentMeal),
            tooMuchC02 = (vals.co2 > game.co2_max),
            enoughCalories = (vals.cals > game.kcal_min),
            gameOver = tooMuchC02 || enoughCalories;
        
        if (gameOver) {
            
            if (tooMuchC02) {
                
                log('checkMealVals');
                
                // lost
                cutlery.trigger(game.BUBBLES_FAILED);
                refs.$mealCheck.addClass('failed');
                
                setTimeout(storm.start, 1500);
                setTimeout(thunder.start, 1500);
            } else {
                // won
                cutlery.trigger(game.BUBBLES_SUCCESS);
                app.generateChart();
                confettis.init();
            }
        }
    }
    
    game.checkFoodMix = function() {
        log('checkFoodMix');
        if (game.mealMix[game.currentFoodCat] === app.json.rules.switch_tab[game.currentFoodCat]) app.freezeFoodMenu();
    }
    
    /********** Dragfood **********/
    
    dragfood = {
        
        droppClassAdded: false,
        
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
            
            game.foodCounter++;
            $newFood.css({left: left - dq.refs.$plate.offset().left, top: top - dq.refs.$plate.offset().top});
            
            dragfood.setBackground($newFood, specs);
        
            if (onPlate) {
                game.addFood(specs);
                cutlery.setExpression(specs);
                $newFood.data('specs', specs);
                game.checkMealVals();
                
                if (app.json.rules.food_only_once) {
                    $(this).addClass('inactive').draggable('disable');
                }
                
                game.mealMix[specs.foodCat]++;
                game.checkFoodMix();
                
                debug.printObject(specs);
                debug.printObject(game.calcMealVals(game.currentMeal), true);
                
            } else {
                $newFood.fadeOut(constants.FADE_OUT, function() { $(this).remove(); });
            }
            
            dragfood.setDroppableStatus(false);
            
            app.playSound(sounds.DROPPED_FOOD);
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
        ANI_LENGTH: 2500,
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
                
            for (var i = 0; i < this.HOW_MANY; i++) {
                html += confHtml;
            }
            
            refs.$confettis.empty().append(html);
            
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
            //setTimeout(confettis.stop, thunder.ANI_LENGTH);
            setTimeout(confettis.start, 500);
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
                scale = 1.75;
            
            $('.conf').each(function(i) {
                alpha = Math.random() * range;
                left =  $(this).position().left +  Math.cos(alpha) * $(this).offset().left * scale;
                top =  $(this).position().top +  Math.sin(alpha) * $(this).offset().top * scale;
                
                translate = 'translate(' + left + 'px,' + top + 'px)';
                $(this).css({'transform': translate});
            });
            
            refs.$confettis.addClass('active');
            
        },
        
        stop: function() {
            log('confettis stop');
            refs.$confettis.removeClass('active');
        }
    }
    
    /********** Thunder **********/
    
    thunder = {
        intid: NaN,
        FPS: 30,
        ANI_LENGTH: 2500,
        
        start: function() {
        
            app.playSound(sounds.FAILED);
        
            refs.$thunder.addClass('active');
            
            /*thunder.intid = setInterval(function() {*/
                /*if(refs.$thunder.hasClass('active')) {*/
                //}
            /*}, 250);*/
            
            thunder.animate();
            setTimeout(thunder.animate, 1000);
            setTimeout(thunder.animate, 2000);
            setTimeout(thunder.animate, 2250);
            
            setTimeout(thunder.stop, thunder.ANI_LENGTH);
        },
        
        animate: function () {
            refs.$thunder.animate({"background-color": "rgba(255,255,200,1)"}, 50, function () {
                refs.$thunder.animate({"background-color": "rgba(0,0,0,1)"}, 100, function () {
                    refs.$thunder.animate({"background-color": "rgba(0,0,0,0)"}, 100, function () {
                    
                    });
                });
            });
        },
        
        stop: function() {
            refs.$thunder.removeClass('active');
            /*clearInterval(thunder.intid);*/
            setTimeout(app.generateChart, 500);
        }
    }
    
    
    /********** Storm **********/
    
    storm = {
        intid: NaN,
        ANI_LENGTH: 5000,
        FLASH_REPEAT: 1500,
        FLASH_DURATION: 150,
        
        start: function start () {
            console.log("Started");
            refs.$storm.addClass("startStorm");

            storm.intid = setInterval(function() {
                if(refs.$storm.hasClass('startStorm')) {
                    storm.flash();
                }
            }, storm.FLASH_REPEAT);
            
            setTimeout(storm.stop, storm.ANI_LENGTH);
        },
        
        stop: function stop () {
            console.log("Stopped");
            clearInterval(storm.intid);
            refs.$storm.removeClass("startStorm");
        },
    
        flash: function flash() {
            refs.$bolt.css({"visibility": "visible"});
            setTimeout(function()
            {
                refs.$bolt.css({"visibility": "hidden"});
            }, storm.FLASH_DURATION);
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
        
        trigger: function(bubblemode) {
            var arrayID = NaN, rid = NaN, bubbleData = {};
            
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
                    rid = helper.getRandomNumber(app.json.expressions[bubblemode][0].length);
                    bubbleData = app.json.expressions[bubblemode][0][rid];
                    break;
            }
            
            cutlery.bubbleData = bubbleData;
            cutlery.bubblemode = bubblemode;
            
            cutlery.setExpression(bubbleData, bubblemode);
        },
        
        setExpression: function(bubbleData, bubblemode) {
            var spoonID = parseInt(bubbleData.exp.split(',')[0].substr(1)),
                forkID = parseInt(bubbleData.exp.split(',')[1].substr(1)),
                backgroundPosition = -game.constants.CUTLERY_HOROFF * (forkID - 1) + 'px 0';
                
            //log('setExpression');
            //log(bubbleData);
            
            refs.$fork.css({backgroundPosition: backgroundPosition});
            
            backgroundPosition = -game.constants.CUTLERY_HOROFF * (spoonID - 1) + 'px 0';
            refs.$spoon.css({backgroundPosition: backgroundPosition});
            
            cutlery.hideBubble();
            clearTimeout(cutlery.showBubbleTO);
            if (bubblemode) {
                cutlery.showBubbleTO = setTimeout(cutlery.showBubble, cutlery.showDelay);
            }
        },
        
        showBubble: function() {
            
            var data = cutlery.bubbleData,
                backgroundPosition = '0px ' + -150 * data.bgid + 'px',
                $ref = (data.txt.split(';')[0] === 'G') ? refs.$forkBub: refs.$spoonBub;
            
            $ref.css({backgroundPosition: backgroundPosition});
            
            $ref.removeClass().addClass('bubble visible');
            $ref.addClass(cutlery.bubblemode);
            
            clearTimeout(cutlery.hideBubbleTO);
            cutlery.hideBubbleTO = setTimeout(cutlery.hideBubble, cutlery.hideDelay);
        },
        
        hideBubble: function() {
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
            //log(data);
        }
    }

     return {
        refs: refs,
        constants: constants,
        app: app,
        game: game,
        cutlery: cutlery,
        confettis: confettis
    };

}(jQuery, window));

/*
 * todos
 * throttle device based
 * transition: border 0.3s ease-out; device based
 * opacity: 0.8 !important; of dragged food device based
 * app.playSound(sounds.SNORING);
 */