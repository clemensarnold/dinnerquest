var dq = (function($, window, undefined) {
    
    "use strict";
    
    var refs = {
        $window: $(window),
        $document: $(document),
        $dragfood: undefined,
        $plates: $('#plates'),
        $plate: undefined,
        $fork: $('.fork'),
        $spoon: $('.spoon'),
        $menu: $('.menu-wrapper'),
        $foodCont: $('.food-container'),
        $mealCheck: $('.meal-check'),
        $infopage: $('#infopage'),
        $infobtn: $('.info')
    },
    configs = {
        isTouch: 'ontouchstart' in window,
        clickEvent: ('ontouchstart' in window) ? 'touchstart' : 'mousedown'
    },
    game = {
        constants: {
            CO2_MAX: 700,
            KCAL_MIN: 1000,
            FOODITEMS_VERTOFF: {veggies: 0, sides: -105, animals: -210},
            FOODITEMS_VERTOFF_BIG: {veggies: 0, sides: NaN, animals: NaN},
            FOOD_CATS: ['veggies', 'sides', 'animals'],
            FOOD_BGVERT_OFF: {veggies: 0, sides: 1, animals: 2},
            DEFAULT_TAB: 'veggies',
            FOOD_BIG_DIMS: 450,
            CUTLERY_HOROFF: 120
        },
        currentFoodCat: 'veggies',
        currentMeal: [],
        meals: [],
        foodCounter: NaN
    },
    app = {},
    dragfood = {},
    debug = {},
    cutlery = {},
    constants = {
        DEV: true,
        URL_HOME: '',
        JSON_PATH: './json/data.json',
        FADE_IN: 200, FADE_OUT: 400, FADE_DELAY: 50,
        FOOD_HOR: NaN, FOOD_VERT: NaN,
        PLATE_RAD: 270, PLATE_DISTANCE: 40000 // 200*200
    };
    
    $(function() {
        
        helper.initMisc();
        
        $.getJSON(constants.JSON_PATH, function(data) {
            app.json = data;
            app.initApp();
            game.startNewGame();
        });
    });
    
    /********** App **********/
    app = {
        
        initApp: function() {
            
            game.constants.FOODITEMS_VERTOFF_BIG.sides = -game.constants.FOOD_BIG_DIMS;
            game.constants.FOODITEMS_VERTOFF_BIG.animals = -2 * game.constants.FOOD_BIG_DIMS;
            constants.FOOD_HOR = constants.FOOD_VERT = game.constants.FOOD_BIG_DIMS / 2;
            
            if (constants.DEV) {
                refs.$window.on({keydown: this.keyDownListener});
            }
            
            $('.navi-container > div').on(configs.clickEvent, function() {
                game.currentFoodCat = game.constants.FOOD_CATS[$(this).data('foodcat')];
                
                $('.navi-container > div.active').removeClass('active');
                $(this).addClass('active');
                app.renderFoodMenu();
            });
            
            $('.logo').on({click: game.startNewGame});
            
            //  sort out z-index issue
            //refs.$plates.on({click: game.startNewGame});
            
            refs.$infobtn.on({click: function() {
                $(this).toggleClass('close');
                refs.$infopage.hasClass('visible') ? app.hideInfoPage() : app.showInfoPage();
            }});
            
            $('.menu-container').fadeTo(constants.FADE_IN, 1);
        },
        
        renderFoodMenu: function() {
            var foodHtml = '<div class="m-item"></div>',
                html = '',
                foodCat = game.currentFoodCat,
                vertOff = game.constants.FOODITEMS_VERTOFF[foodCat],
                specs = {};
                
            for (var i = 0; i < app.json.avFood[foodCat].length; i++) {
                html += foodHtml;
            }
            
            refs.$foodCont.empty().append(html);
            
            $('.m-item').each(function(i, el) {
                
                specs = app.json.avFood[foodCat][i];
                specs.foodCat = game.currentFoodCat;
                specs.bgHorPos = i;
                
                $(el).css({backgroundPosition: -i * $(el).width() + 'px ' + vertOff + 'px'}).
                    data('specs', specs).
                    delay(i*constants.FADE_DELAY).fadeTo(400, 1);
            });
            
            //  DEV
            $('.m-item').on({click: function() {
                debug.printObject($(this).data('specs'));
            }});
            
            $('.m-item').draggable({
                helper: 'clone',
                cursorAt: {left: constants.FOOD_HOR, top: constants.FOOD_VERT},
                start: function(e, ui) {
                    refs.$dragfood = ui.helper;
                    refs.$dragfood.addClass('dragged');
                    
                    dragfood.setBackground(refs.$dragfood, $(this).data('specs'));
                },
                stop: dragfood.stopDragging,
                drag: $.throttle(300, dragfood.calcDistance)
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
        }
    }
    
    /********** Game **********/
    
    game.startNewGame = function() {
        var html = '<div class="plate"></div>';
            
        //  resets after first game
        if (game.currentMeal.length > 0) {
            game.meals.push(game.currentMeal);
            
            if (app.json.rules.food_only_once) {
                $('.food-container .inactive').removeClass('inactive').draggable('enable');
            }
            
            //dq.app.json.expressions['new-game'][0]
            cutlery.setExpression('L01,G01');
            
            refs.$menu.fadeIn();
            refs.$mealCheck.toggleClass('visible').removeClass('failed');
        }
        
        //  resets
        game.currentMeal = [];
        game.foodCounter = 0;
        debug.printObject({});
        
        //  pre-gallery times
        refs.$plates.empty();
        
        refs.$plates.append(html);
        refs.$plate =  $(dq.refs.$plates.children()[dq.refs.$plates.children().length - 1]);
        
        if (!configs.isTouch) refs.$plate.addClass('desktop');
        
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
            tooMuchC02 = (vals.co2 > game.constants.CO2_MAX),
            enoughCalories = (vals.cals > game.constants.KCAL_MIN),
            gameOver = tooMuchC02 || enoughCalories;
        
        if (gameOver || true) {
            refs.$menu.fadeOut();
            refs.$mealCheck.toggleClass('visible');
            
            if (tooMuchC02 || true) {
                refs.$mealCheck.addClass('failed');
            }
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
                cutlery.setExpression(specs.exp);
                game.checkMealVals();
                
                if (app.json.rules.food_only_once) {
                    $(this).addClass('inactive').draggable('disable');
                }
                
                debug.printObject(specs);
                debug.printObject(game.calcMealVals(game.currentMeal), true);
                
            } else {
                $newFood.fadeOut(constants.FADE_OUT, function() { $(this).remove(); });
            }
            
            dragfood.setDroppableStatus(false);
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
    
    /********** Cutlery **********/
    
    cutlery = {
        
        setExpression: function(exp) {
            var spoonID = parseInt(exp.split(',')[0].substr(1)),
                forkID = parseInt(exp.split(',')[1].substr(1)),
                backgroundPosition = -game.constants.CUTLERY_HOROFF * (forkID - 1) + 'px 0';
            
            refs.$fork.css({backgroundPosition: backgroundPosition});
            
            backgroundPosition = -game.constants.CUTLERY_HOROFF * (spoonID - 1) + 'px 0';
            refs.$spoon.css({backgroundPosition: backgroundPosition});
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
        cutlery: cutlery
    };

}(jQuery, window));

/*
 * todos
 * throttle device based
 * transition: border 0.3s ease-out; device based
 * opacity: 0.8 !important; of dragged food device based
 */