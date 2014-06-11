var dq = (function($, window, undefined) {
    
    "use strict";
    
    var refs = {
        $window: $(window),
        $document: $(document),
        $dragfood: undefined,
        $plates: $('#plates'),
        $plate: undefined
    },
    configs = {
        isTouch: 'ontouchstart' in window
    },
    game = {
        constants: {
            CO2_MAX: 700,
            KCAL_MIN: 500,
            FOODITEMS_VERTOFF: {veggies: 0, sides: -105, animals: -210},        // small icons
            FOODITEMS_VERTOFF_BIG: {veggies: 0, sides: NaN, animals: NaN},      // big icons
            FOOD_CATS: ['veggies', 'sides', 'animals'],
            FOOD_BGVERT_OFF: {veggies: 0, sides: 1, animals: 2},
            FOOD_BIG_DIMS: 450
        },
        currentFoodCat: 'veggies',
        currentMeal: [],
        meals: [],
        foodCounter: NaN
    },
    app = {},
    dragfood = {},
    debug = {},
    constants = {
        DEV: true,
        URL_HOME: '',
        JSON_PATH: './json/data.json',
        FADE_IN: 200, FADE_OUT: 400, FADE_DELAY: 150,
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
            
            var clickEvent = (configs.isTouch ? 'touchstart' : 'mousedown');
            
            $('.navi-container > div').on(clickEvent, function() {
                game.currentFoodCat = game.constants.FOOD_CATS[$(this).data('foodcat')];
                
                $('.navi-container > div').removeClass('active');
                $(this).addClass('active');
                
                app.renderFoodMenu();
            });
            
            //$('.logo').on({click: app.reload});
            $('.logo').on({click: game.startNewGame});
            
            this.renderFoodMenu();
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
            
            $('.food-container').empty().append(html);
            
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
            }
        }
    }
    
    /********** Game **********/
    
    game.startNewGame = function() {
        var html = '<div class="plate"></div>';
            
        //  temp
        if (game.currentMeal.length > 0) {
            game.meals.push(game.currentMeal);
        }
        
        //  resets
        game.currentMeal = [];
        game.foodCounter = 0;
        debug.printObject({});
        
        refs.$plates.append(html);
        refs.$plate =  $(dq.refs.$plates.children()[dq.refs.$plates.children().length - 1]);
        
        if (!configs.isTouch) refs.$plate.addClass('desktop');
        
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

    
    /********** Dragfood **********/
    
    dragfood = {
        
        droppClassAdded: false,
        
        stopDragging: function() {
            
            var onPlate = dragfood.calcDistance(true),
                foodID = 'food-' + game.meals.length + '-' + game.foodCounter,
                foodHTML = '<div class="food" id="' + foodID + '"></div>',
                left = dq.refs.$dragfood.offset().left,
                top = dq.refs.$dragfood.offset().top,
                $newFood = undefined;
                
            refs.$plate.append(foodHTML);
            $newFood = $('#' + foodID);
            
            game.foodCounter++;
            $newFood.css({left: left - dq.refs.$plate.offset().left, top: top - dq.refs.$plate.offset().top});
            
            
            dragfood.setBackground($newFood, $(this).data('specs'));
        
            if (onPlate) {
                game.addFood($(this).data('specs'));
                
                debug.printObject($(this).data('specs'));
                debug.printObject(game.calcMealVals(game.currentMeal), true);
                
                $newFood.data('specs', $(this).data('specs')).on({click: function() {
                    debug.printObject($(this).data('specs'));
                }});
                
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
    
    /********** Debug **********/
    
    debug = {
        printObject: function(data, noClear) {
            var html = noClear ? $('[role="debug"] p').html() : '';
            
            for (var key in data) {
                html += key + ': ' + data[key] + '<br>'
            }
            
            $('[role="debug"] p').html(html);
            log(data);
        }
    }

     return {
        refs: refs,
        constants: constants,
        app: app,
        game: game
    };

}(jQuery, window));



/*
 * todos
 * new game function
 * throttle device based
 * transition: border 0.3s ease-out; device based
 * opacity: 0.8 !important; of dragged food device based
 */