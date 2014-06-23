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
        $confettis: $('#confettis'),
        $storm: $("#storm"),
        $bolt: $(".bolt"),
        $bolts: $(".bolt2"),
        $continueButton: $("#continueButton"),
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
        stats: undefined
    },
    game = {
        co2_max: NaN,
        kcal_min: NaN,
        inactive_restart: NaN,
        inactive_fallasleep: NaN,
        inactivityCounter: 0,
        started: false,
        running: false,
        sleeping: false,
        lastSound: undefined,
        constants: {
            FOODITEMS_VERTOFF: {veggies: 0, sides: -105, animals: -210},
            FOODITEMS_VERTOFF_BIG: {veggies: 0, sides: NaN, animals: NaN},
            FOOD_CATS: ['veggies', 'sides', 'animals'],
            FOOD_BGVERT_OFF: {veggies: 0, sides: 1, animals: 2},
            DEFAULT_TAB: 'veggies', 
            FOOD_BIG_DIMS: 450,
            CUTLERY_HOROFF: 120,
            FPS: 30,
            SNORE_EXP: "L04,G12",
            WAKEUP_EXP: "L01,G01"
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
        BUBBLES_NEWGAME: 'new-game',
        BUBBLES_FAILED: 'failed',
        BUBBLES_SUCCESS: 'success',
        BUBBLES_FREEZE_VEGGIES: 'freeze-veggies',
        BUBBLES_FREEZE_SIDES: 'freeze-sides',
        BUBBLES_POSITIVE: 'positive',
        BUBBLES_NEGATIVE: 'negative'
    },
    app = {},
    dragfood = {},
    debug = {},
    cutlery = {},
    storm = {},
    confettis = {},
    constants = {
        DEV: false,
        STATS: false,
        SOUNDS: true,
        SKIP_VIDEO: false,
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
    
    game.sounds = [{selector: '.navi-container > div', whichSound: sounds.CHANGE_TAB}];
    
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
            
            if (constants.STATS) {
                configs.stats = new Stats();
                configs.stats.setMode(0);
                document.body.appendChild(configs.stats.domElement);
                window.setInterval(function() { configs.stats.update(); }, 1000 / constants.FPS);
            }
            
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
            
            setTimeout(app.initVideo, 1000);

            if (constants.SKIP_VIDEO) app.finishVideo();
           
            refs.$chart.on({click: game.startNewGame});
            
            refs.$infobtn.on({click: function() {
                $(this).toggleClass('close');
                refs.$infopage.hasClass('visible') ? app.hideInfoPage() : app.showInfoPage();
            }});
            
            refs.$continueButton.on({click: function() {
                refs.$infobtn.toggleClass('close');
                app.hideInfoPage();
            }});
            
            $('.menu-container').fadeTo(constants.FADE_IN, 1);
            
            //  init sounds
            for (var i = 0; i < game.sounds.length; i++) {
                $(game.sounds[i].selector).data('whichSound', game.sounds[i].whichSound).on(configs.clickEvent, function(e, mode) {
                    if (mode !== 'no-sound') app.playSound($(this).data('whichSound'));
                });
            }
        },
        
        initVideo: function() {
            // init video
            refs.$videocontainer.removeClass('transparent');
            refs.$videocontainer.on({click: app.finishVideo});
            $('#intro-video').on({ended: app.finishVideo });
        },
        
        finishVideo: function() {
            $('.logo, .info').removeClass('transparent');
            
            
            $('#intro-video')[0].pause();
            refs.$videocontainer.addClass('transparent');
            setTimeout(app.startGame, 1000);
            $('body').addClass('table-cloth');
            refs.$menu.removeClass('down');
        },
        
        checkInactivity: function() {
            if (game.started) game.inactivityCounter++;
            switch(game.inactivityCounter) {
                
                case game.inactive_fallasleep:
                    if (game.running) app.startSleeping();
                    break;
                
                case game.inactive_restart:
                    app.reload();
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
            refs.$fork.show();
            refs.$spoon.show();
            refs.$videocontainer.hide();
            
            setTimeout(app.clearSounds, 900);
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
                    
                    $(el).draggable({
                        helper: 'clone',
                        cursorAt: {left: constants.FOOD_HOR, top: constants.FOOD_VERT},
                        start: function(e, ui) {
                            refs.$dragfood = ui.helper;
                            refs.$dragfood.addClass('dragged');
                            
                            dragfood.setBackground(refs.$dragfood, $(this).data('specs'));
                            //app.stopSound(); // needed for ipad performance (weird)
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
            $('.navi-container .' + foodCat).trigger(configs.clickEvent, 'test');
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
            //app.stopSound('playSound');
            
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
    
    /********** Game **********/
    
    game.startNewGame = function() {
        var html = '<div class="plate"></div>';
        
        storm.stop();
        confettis.stop();
        app.stopSound('startNewGame');
        
        clearTimeout(game.showFeedbackInt);
        
        game.running = true;
        game.currentFoodCat = game.constants.DEFAULT_TAB;
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
        game.lastSound = undefined;
        
        debug.printObject({});
        
        $('.navi-container > div.freeze').removeClass('freeze');
        
        //  pre-gallery times
        refs.$plates.empty();
        
        refs.$plates.append(html);
        refs.$plate =  $(dq.refs.$plates.children()[dq.refs.$plates.children().length - 1]);
        
        if (!configs.isTouch) refs.$plate.addClass('desktop');
        
        app.playSound(sounds.NEW_GAME);
        $('.navi-container .' + game.constants.DEFAULT_TAB).trigger(configs.clickEvent, 'no-sound');
        
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
    
    game.getFeedback = function(meal) {
        //var cals = 0, co2 = 0;
        
        var worstFood = '', bestFood = '',
            maxCO2 = 0, minCO2 = 10000000;
        
        for (var i = 0; i < meal.length; i++) {
            
            if (meal[i].c02 > maxCO2) {
                maxCO2 = meal[i].c02;
                worstFood = meal[i].label
            }
            
            if (meal[i].c02 < minCO2) {
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
    
    game.checkMealVals = function() {
        var vals = game.calcMealVals(game.currentMeal),
            tooMuchC02 = (vals.co2 > game.co2_max),
            enoughCalories = (vals.cals > game.kcal_min),
            gameOver = tooMuchC02 || enoughCalories,
            startAniDelay = 500,
            showChartDelay = 5000;
        
        if (gameOver) {
            
            game.running = false;
            
            //app.freezeFoodMenu();
            
            if (tooMuchC02) {
                // lost
                log('---------- lost ----------');
                cutlery.trigger(game.BUBBLES_FAILED);
                app.generateChart();
                refs.$mealCheck.addClass('failed');
                setTimeout(storm.start, startAniDelay);
                
                game.showFeedbackInt = setTimeout(cutlery.trigger, showChartDelay, game.BUBBLES_NEGATIVE);
            } else {
                // won
                log('---------- won ----------');
                cutlery.trigger(game.BUBBLES_SUCCESS);
                app.generateChart();
                setTimeout(confettis.init, startAniDelay);
                game.showFeedbackInt = setTimeout(cutlery.trigger, showChartDelay, game.BUBBLES_POSITIVE);
            }
        }
    }
    
    game.checkFoodMix = function() {
        
        if (game.mealMix[game.currentFoodCat] === app.json.rules.switch_tab[game.currentFoodCat]) {
            
            if (game.currentFoodCat === 'veggies') cutlery.trigger(game.BUBBLES_FREEZE_VEGGIES);
            else if (game.currentFoodCat === 'sides') cutlery.trigger(game.BUBBLES_FREEZE_SIDES);
            
            app.freezeFoodMenu();
        }
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
                
                if (app.json.rules.food_only_once) {
                    $(this).addClass('inactive').draggable('disable');
                }
                
                game.mealMix[specs.foodCat]++;
                game.checkFoodMix();
                game.checkMealVals();
                
                //debug.printObject(specs);
                //debug.printObject(game.calcMealVals(game.currentMeal), true);
                
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
    
    /*
    storm = {
        intid: NaN,
        ANI_LENGTH: 5000,
        FLASH_INTERVALL: 100,
        FLASH_AMOUNT_PICTURES: refs.$bolt.length,
        FLASH_NEXT: new Array (300, 500, 600, 700, 1100, 1300, 1600, 1700, 1900, 2200, 2300, 2500, 2750, 3000, 3100, 3400, 4000, 4100, 4400, 4600),
        FLASH_DURATION: 150,
        flash_picture_id: 0,
        flash_next_compare_time: 0,
        
        start: function () {
            refs.$storm.addClass("-->Storm");

            storm.intid = setInterval(function() {
                if(refs.$storm.hasClass('startStorm')) {
                    for(var i = 0; i < storm.FLASH_NEXT.length; i++) {
                        if(storm.flash_next_compare_time == storm.FLASH_NEXT[i]) {
                            storm.flash(storm.flash_picture_id);
                            storm.flash_picture_id = (storm.flash_picture_id + 1) % storm.FLASH_AMOUNT_PICTURES;
                        }
                    }

                storm.flash_next_compare_time += storm.FLASH_INTERVALL;
                }
            }, storm.FLASH_INTERVALL);
            
            setTimeout(storm.stop, storm.ANI_LENGTH);
        },
        
        stop: function () {
            clearInterval(storm.intid);
            refs.$storm.removeClass("startStorm");
            
            storm.flash_picture_id = 0;
            storm.flash_next_compare_time = 0;
            
            setTimeout(app.generateChart, 500);
        },
    
        flash: function (id) {
            var activeBolt = $(refs.$bolt[id]).css({"visibility": "visible"});

            setTimeout(function()
            {
               activeBolt.css({"visibility": "hidden"});
            }, storm.FLASH_DURATION);
        }
    }
    */
    
    /********** Cutlery **********/
    
    cutlery = {
        
        showBubbleTO: NaN,
        hideBubbleTO: NaN,
        showDelay: NaN,
        hideDelay: NaN,
        bubblemode: undefined,
        bubbleData: {},
        
        trigger: function(bubblemode) {
            
            //log('trigger / bubblemode: ' + bubblemode);
            
            var arrayID = NaN, rid = NaN, bubbleData = {}, worstFood = '', bestFood = '',
                exprAry = [], bgIDsAry = [], bgid = NaN;
            
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
            }
            
            cutlery.bubbleData = bubbleData;
            cutlery.bubblemode = bubblemode;
            
            cutlery.setExpression(bubbleData, bubblemode);
        },
        
        setExpression: function(bubbleData, bubblemode) {
            
            //log('setExpression / bubblemode: ' + bubblemode);
            
            var spoonID = parseInt(bubbleData.exp.split(',')[0].substr(1)),
                forkID = parseInt(bubbleData.exp.split(',')[1].substr(1)),
                backgroundPosition = -game.constants.CUTLERY_HOROFF * (forkID - 1) + 'px 0';
            
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
        }
    }

     return {
        refs: refs,
        constants: constants,
        app: app,
        game: game,
        cutlery: cutlery,
        confettis: confettis,
        storm: storm
    };

}(jQuery, window));

/*
 * todos
 * throttle device based
 * transition: border 0.3s ease-out; device based
 * opacity: 0.8 !important; of dragged food device based
 * 
 */