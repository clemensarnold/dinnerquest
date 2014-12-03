<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>DINNER Quest</title>
        <meta name="description" content="">
            
        <meta name="apple-touch-fullscreen" content="YES" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="HandheldFriendly" content="true" />
        <meta http-equiv="x-rim-auto-match" content="none" />
            
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, minimal-ui">
        <link rel="stylesheet" href="css/normalize.css">
        <link rel="stylesheet" href="css/main.css">

        <script>
            if (location.hash.indexOf('#dev') >= 0) document.write('<link rel="stylesheet" href="css/main-v2.css">');
        </script>

        <link href="css/ui-lightness/jquery-ui-1.10.4.css" rel="stylesheet">
        <script src="js/vendor/modernizr-2.6.2.min.js"></script>
    </head>
    <body>

        <div id="anitest">
            <div class="bolt2 one hidden"></div>
            <div class="bolt2 two hidden"></div>
            <div class="bolt2 three hidden"></div>
        </div>
        
        <div id="performance-boost"><p></p></div>
        
        <div role="debug" hidden><p></p></div>

        <div class="content-pages">
            <div id="gallery">
                <div class="gal-header"></div>
                <!-- <div class="gal-wrapper"></div> -->
                <div class="gal-wrapper">
                    <div class="dish-wrapper">
                        <div class="dish-mask">
                            <div class="dish">
                               <!--  <div class="food" id="food-0-0" style="left: -6px; top: -29px; background-image: url(http://localhost/dinnerquest/img/svg/onplate/veggies/6.svg);"></div>
                                <div class="food" id="food-0-0" style="left: 10px; top: 20px; background-image: url(http://localhost/dinnerquest/img/svg/onplate/veggies/5.svg);"></div>
                                <div class="food" id="food-0-0" style="left: 140px; top: 150px; background-image: url(http://localhost/dinnerquest/img/svg/onplate/veggies/2.svg);"></div>
                                <div class="food" id="food-0-0" style="left: 190px; top: 190px; background-image: url(http://localhost/dinnerquest/img/svg/onplate/veggies/3.svg);"></div> -->
                            </div>
                        </div>
                    </div>
                    <div class="dish-wrapper">
                        <div class="dish"></div>
                    </div>
                    <div class="dish-wrapper last-in-row">
                        <div class="dish"></div>
                    </div>

                    

                </div>
            </div>
            <div id="infopage"><div id="continueButton"></div></div>
        </div>        
        
        <div id="overlays">
            <div id="stage">
                <div class="meal-check"></div>
                <div id="piechart">
                    <div id="d3"></div>
                    <svg class="d3chart"></svg>
                </div>
                <div id="saturationbar">
                    <p>wie satt bin ich?</p>
                    <div class="bar-mask">
                        <div class="satbar"></div>
                    </div>
                </div>
                <div id="foodstack"></div>
                <div id="confettis"></div>
                <div class="fork">
                    <div class="bubble"></div>
                </div>
                <div class="spoon">
                    <div class="bubble"></div>
                </div>
                <div id="plates"></div>

                <div id="chart"><div id="newGameButton"></div></div>
                <div class="logo icon transparent"></div>
                <div class="info icon transparent" data-pagetype="gallery"></div>
            </div>
        </div>
        
        <!-- 
        <div id="storm" class="stormSize">
            <img class="stormSize" src="img/png/storm.png">
            <img class="bolt stormSize" src="img/png/bolt1.png">
            <img class="bolt stormSize" src="img/png/bolt2.png">
            <img class="bolt stormSize" src="img/png/bolt3.png">
            <img class="bolt stormSize" src="img/png/bolt4.png">
            <img class="bolt stormSize" src="img/png/bolt5.png">
        </div>
        -->
        
        <!-- .menu-wrapper -->
        <div class="menu-mask">
            <div class="menu-wrapper down">
                <div class="menu-container">
                    <div class="navi-container">
                        <div data-foodcat="0" class="veggies"></div>
                        <div data-foodcat="1" class="sides"></div>
                        <div data-foodcat="2" class="animals"></div>
                    </div>
                    <div class="food-container"></div>
                </div>
            </div><!-- /.menu-wrapper -->
        </div>
        
        <div id="audiocontainer">
            <audio class="btn-audio snd change-tab" preload="auto"><source src="./media/sound/change_tab.mp3" type="audio/mpeg" /></audio>
            <audio class="btn-audio snd dropped-food" preload="auto"><source src="./media/sound/food_on_plate.mp3" type="audio/mpeg" /></audio>
            <audio class="btn-audio snd failed"><source src="./media/sound/failed.mp3" type="audio/mpeg" /></audio>
            <audio class="btn-audio snd success"><source src="./media/sound/success.mp3" type="audio/mpeg" /></audio>
            <audio class="btn-audio snd new-game" preload="auto"><source src="./media/sound/new_game.mp3" type="audio/mpeg" /></audio>
            <audio class="btn-audio snd snoring" loop><source src="./media/sound/snoring.mp3" type="audio/mpeg" /></audio>
        </div>
        <div id="videocontainer" class="transparent">
            <video id="intro-video" autoplay="autoplay" width="1024" height="768">
                <source src="./media/video/dq.mp4" type="video/mp4">
            </video>
        </div>

        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
        <script>window.jQuery || document.write('<script src="js/vendor/jquery-1.10.2.min.js"><\/script>')</script>
        <script src="js/vendor/jquery-ui-1.10.4.min.js"></script>
        <script src="js/vendor/jquery.ui.touch-punch.min.js"></script>
        <script src="js/vendor/throttle-1.1.js"></script>
        <script src="js/plugins.js"></script>
        <script src="js/main.js"></script>
        <script src="js/gallery.js"></script>        
        <script src="js/vendor/stats.js"></script>
        <script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>        
    </body>
</html>
