dq.gallery = {

    $target: undefined,

    render: function() {
        this.$target = this.$target || $('.gal-wrapper');

        var data = dq.game.meals,
            html = '', obj = {};

        log('render gallery, data.length: ' + data.length);

        for (var i = 0; i < data.length; i++) {
            html += '<div class="dish-wrapper"><div class="dish-mask"><div class="dish"></div></div></div>';
        }

        this.$target.empty().append(html);

        this.$target.find('.dish-wrapper').each(function(i, el) {
            if (i%3 === 2) $(el).addClass('last-in-row');

            // log(data[i].stats);
            // log(data[i].ingredients);

            html = '';
            for (var j = 0; j < data[i].ingredients.length; j++) {
                obj = data[i].ingredients[j];
                html += '<div class="food" style="left: ' + obj.x + '; top: ' + obj.y + '; background-image: url(./img/svg/onplate/' + obj.foodCat + '/' + obj.bgHorPos + '.svg);"></div>';
            }

            $(el).find('.dish').append(html);
        });
    }
}
