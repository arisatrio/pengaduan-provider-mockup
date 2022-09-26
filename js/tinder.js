
'use strict';

var tinderContainer = document.querySelector('.tinder');
var allCards = document.querySelectorAll('.tinder--card');
var nope = document.getElementById('nope');
var love = document.getElementById('love');
var undo = document.getElementById('undo');

function getData(kategori) {
    $.ajax({
        url: "/find/item/" + kategori,
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        type: "GET",
        datatype: 'json',
        success: function (data) {
            for (var $i = 0; $i < data.length; $i++) {
                var output =
                    '<div class="tinder--card" style="touch-action: pan-y; user-select: none; -webkit-user-drag: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0);"> <img src="/storage/' + data[$i].gambar +'"'+ 'style="width: 100%; height: 250px; object - fit: cover; margin - bottom: 10px; "> <h3>' + data[$i].nama_produk + '</h3 > ' + ' <p> ' + data[$i].deskripsi + '</p> </div> <input type="hidden" id="produk_id" value="'+ data[$i].id +'"> ';
                $('#card-tinder').append(output);
            }
        }, error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
        },
    })
}


function initCards(card, index) {    
    var k = $('#kategori_id').val();
    getData(k);
    var newCards = document.querySelectorAll('.tinder--card:not(.removed)');
    var allCards = document.querySelectorAll('.tinder--card.removed');    

    // if (newCards.length <= 0) {
    //     allCards.forEach(function (card, index) {
    //         card.classList.remove('removed');
    //     });
    //     initCards();
    // } else {
        newCards.forEach(function (card, index) {
            card.style.zIndex = allCards.length - index;
            card.style.transform = 'scale(' + (20 - index) / 20 + ') translateY(-' + 30 * index + 'px)';
            card.style.opacity = (10 - index) / 10;
         });
    // }
    
    tinderContainer.classList.add('loaded');
}

initCards();

allCards.forEach(function (el) {
    var hammertime = new Hammer(el);

    console.log(el);

    hammertime.on('pan', function (event) {
        el.classList.add('moving');
    });

    hammertime.on('pan', function (event) {
        if (event.deltaX === 0) return;
        if (event.center.x === 0 && event.center.y === 0) return;

        tinderContainer.classList.toggle('tinder_love', event.deltaX > 0);
        tinderContainer.classList.toggle('tinder_nope', event.deltaX < 0);

        var xMulti = event.deltaX * 0.03;
        var yMulti = event.deltaY / 80;
        var rotate = xMulti * yMulti;

        event.target.style.transform = 'translate(' + event.deltaX + 'px, ' + event.deltaY + 'px) rotate(' + rotate + 'deg)';
    });

    hammertime.on('panend', function (event) {
        el.classList.remove('moving');
        tinderContainer.classList.remove('tinder_love');
        tinderContainer.classList.remove('tinder_nope');

        var moveOutWidth = document.body.clientWidth;
        var keep = Math.abs(event.deltaX) < 80 || Math.abs(event.velocityX) < 0.5;

        event.target.classList.toggle('removed', !keep);

        if (keep) {
            event.target.style.transform = '';
        } else {
            var endX = Math.max(Math.abs(event.velocityX) * moveOutWidth, moveOutWidth);
            var toX = event.deltaX > 0 ? endX : -endX;
            var endY = Math.abs(event.velocityY) * moveOutWidth;
            var toY = event.deltaY > 0 ? endY : -endY;
            var xMulti = event.deltaX * 0.03;
            var yMulti = event.deltaY / 80;
            var rotate = xMulti * yMulti;

            event.target.style.transform = 'translate(' + toX + 'px, ' + (toY + event.deltaY) + 'px) rotate(' + rotate + 'deg)';
            let user_id = $('#user_id').val();
            let produk_id = $('#produk_id').val();
            postData(user_id, produk_id);
            initCards();
        }
    });
});

function createButtonListener(love) {
    return function (event) {
        var cards = document.querySelectorAll('.tinder--card:not(.removed)');
        var moveOutWidth = document.body.clientWidth * 1.5;

        if (!cards.length) return false;

        var card = cards[0];

        card.classList.add('removed');

        if (love) {
            card.style.transform = 'translate(' + moveOutWidth + 'px, -100px) rotate(-30deg)';
            let user_id = $('#user_id').val();
            let produk_id = $('#produk_id').val();
            postData(user_id, produk_id);
            initCards();
        } else {
            card.style.transform = 'translate(-' + moveOutWidth + 'px, -100px) rotate(30deg)';
        }

        initCards();

        event.preventDefault();
    };
}

function undoCards() {
    return function (event) {
        var undoCard = document.querySelectorAll('.tinder--card.removed');
        var last = undoCard[undoCard.length - 1];

        last.classList.remove('removed');
        initCards();
    }
}

function postData(user_id, produk_id) {
    $.ajax({
        url: "/match",
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        type: "POST",
        data: {
            user_id: user_id,
            produk_id: produk_id,
        },
        success: function (response) {
            console.log(response);
        }, error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
        },
    });
}

var nopeListener = createButtonListener(false);
var loveListener = createButtonListener(true);
var undoListener = undoCards();

nope.addEventListener('click', nopeListener);
love.addEventListener('click', loveListener);
undo.addEventListener('click', undoListener);