dq.gallery = {

    $target: undefined,

    render: function() {
        this.$target = this.$target || $('.gal-wrapper');

        var data = dq.game.meals,
            html = '', obj = {}, 
            greenRatio = NaN, redRatio = NaN, maskHeight = NaN, marginTop = NaN;

        log('render gallery, data.length: ' + data.length);

        // for (var c = 0; c < 30; c++) {
        //     data = data.concat(dq.game.meals);
        // }
        // log('render gallery, data.length: ' + data.length);

        for (var i = 0; i < data.length; i++) {
            data[i].stats.lost = data[i].stats.lost || data[i].stats.co2 >= dq.game.co2_max;
            data[i].stats.ratio = data[i].stats.ratio || data[i].stats.co2 / dq.game.co2_max;
            html += '<div class="dish-wrapper"><div class="dish-mask"><div class="dish"></div><div class="barchart">';
            html += '<p>' + helper.convertToKG(data[i].stats.co2) + ' kg CO<sub>2</sub></p><div class="chartmask"><div class="green"></div><div class="red"></div></div></div></div><div class="crossed hidden"></div></div>';
        }

        this.$target.empty().append(html);

        this.$target.find('.dish-wrapper').each(function(i, el) {
            if (i%3 === 2) $(el).addClass('last-in-row');
            $(el).find('.crossed').removeClass('hidden');

            // log(data[i].stats);
            // log(data[i].ingredients);
            
            if (data[i].stats.lost) {
                $(el).find('.crossed').addClass('hidden');
                // $(el).find('.red').removeClass('hidden');
                $(el).find('p').addClass('lost');
                $(this).addClass('lost');
            }

            // log('ratio: ' + data[i].stats.ratio);

            greenRatio = data[i].stats.ratio;
            maskHeight = Math.round(61 * greenRatio); // 72

            $(el).data('maskHeight', maskHeight).delay(1000 + i * 200).queue(function() {
                $(this).find('.chartmask').css({height: $(this).data('maskHeight')});
                $(this).find('p').css({opacity: 1});
            });

            marginTop = 190 - maskHeight;
            if (marginTop > 125) marginTop = 125;
            $(el).find('p').css({marginTop: marginTop});

            html = '';
            for (var j = 0; j < data[i].ingredients.length; j++) {
                obj = data[i].ingredients[j];
                html += '<div class="food" style="left: ' + obj.x + '; top: ' + obj.y + '; background-image: url(./img/svg/onplate/' + obj.foodCat + '/' + obj.bgHorPos + '.svg);"></div>';
            }

            $(el).find('.dish').append(html);

            $(el).data('data', data[i]);
            $(el).data('index', i);
        });

        $('.dish-wrapper').on('click', function() {
            $('.gallery.icon').trigger(dq.configs.clickEvent);
            dq.game.renderMeal($(this).data('data'), $(this).data('index'));
        });
    }
}
