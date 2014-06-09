var dq = (function($, window, undefined) {
    
    refs = {
        $window: $(window),
        $document: $(document),
        $dragfood: undefined,
        $plate: $('#plate')
    },
    configs = {
        isTouch: 'ontouchstart' in window
    },
    game = {
        constants: {
            CO2_MAX: 700,
            KCAL_MIN: 500,
            FOODITEMS_VERTOFF: {veggies: 0, sides: -105, animals: -210},
            FOOD_CATS: ['veggies', 'sides', 'animals']
        },
        currentFoodCat: 'veggies',
        currentMeal: [],
        meals: [],
        foodCounter: 0
    },
    app = {},
    dragfood = {},
    debug = {},
    constants = {
        DEV: true,
        URL_HOME: '',
        JSON_PATH: './json/data.json',
        FADE_IN: 200, FADE_OUT: 400, FADE_DELAY: 150,
        FOOD_HOR: 150,
        FOOD_VERT: 150,
        PLATE_RAD: 270,
        PLATE_DISTANCE: 40000 // 200*200
    };
    
    $(function() {
        
        helper.initMisc();
        
        $.getJSON(constants.JSON_PATH, function(data) {
            app.json = data;
            app.initApp();
        });
    });
    
    /********** App **********/
    app = {
        
        initApp: function() {
            
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
            
            $('.logo').on({click: app.reload});
            
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
                cursorAt: {left: 150, top: 150},
                start: function(e, ui) {
                    refs.$dragfood = ui.helper;
                    refs.$dragfood.addClass('dragged');
                },
                stop: dragfood.stopDragging,
                drag: $.throttle(400, dragfood.calcDistance)
            });
        },
        
        reload: function() {
            location.reload();
        },
        
        keyDownListener: function(e) {
            
            switch(e.keyCode) {
                case 67: // c
                    debug.printObject(game.calcMealVals(game.currentMeal));
                    break;
            }
        }
    }
    
    /********** Game **********/
    
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
                foodID = 'food-' + game.foodCounter,
                foodHTML = '<div class="food" id="' + foodID + '"></div>',
                left = dq.refs.$dragfood.offset().left,
                top = dq.refs.$dragfood.offset().top;
                
            refs.$plate.append(foodHTML);
            game.foodCounter++;
            $('#' + foodID).css({left: left - dq.refs.$plate.offset().left, top: top - dq.refs.$plate.offset().top});
        
            if (onPlate) {
                game.addFood($(this).data('specs'));
            } else {
                $('#' + foodID).fadeOut(constants.FADE_OUT, function() { $(this).remove(); });
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
                onPlate = false;
         
            if (dist < constants.PLATE_DISTANCE) onPlate = true;
            
            dragfood.setDroppableStatus(onPlate);
            
            if (dropped) return onPlate;
            else return true;
        }
    }
    
    /********** Debug **********/
    
    debug = {
        printObject: function(data) {
            var html = '';
            
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
 * throttle device based
 * transition: border 0.3s ease-out; device based
 * opacity: 0.8 !important; of dragged food device based
 */