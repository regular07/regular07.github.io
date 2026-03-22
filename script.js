/* ============================================================
   RetroVibe Studio — script.js  (v2)
   ============================================================
   01. Belge Hazır
   02. Navbar Scroll Efekti
   03. Smooth Scroll
   04. Scroll-to-Top
   05. Collection Card Slider (orta kart büyük, yan kartlar küçük)
       · Sağ/sol ok kontrolü
       · Klavye desteği (←/→)
       · Dokunmatik / sürükleme desteği
       · Karta tıklayınca ilgili ürün kartına scroll
       · Nokta göstergeleri
   06. Ürün Kartı Giriş Animasyonu (IntersectionObserver)
   07. Navbar Aktif Link Güncellemesi
   08. Ripple Efekti (Butonlar)
   ============================================================ */

$(document).ready(function () {

  /* ============================================================
     02. Navbar Scroll Efekti
  ============================================================ */
  function checkNavbar() {
    if ($(window).scrollTop() > 60) {
      $('#mainNav').addClass('scrolled');
    } else {
      $('#mainNav').removeClass('scrolled');
    }
  }
  checkNavbar();
  $(window).on('scroll.nav', checkNavbar);


  /* ============================================================
     03. Smooth Scroll
     .smooth-scroll sınıflı linklerde navbar offsetini hesaplar.
  ============================================================ */
  $(document).on('click', '.smooth-scroll, .nav-link[href^="#"]', function (e) {
    var href = $(this).attr('href');
    if (!href || href === '#' || !$(href).length) return;
    e.preventDefault();
    var offset = $(href).offset().top - ($('#mainNav').outerHeight() + 12);
    $('html, body').animate({ scrollTop: offset }, 620, 'swing');
    // Mobil menü kapat
    if ($('#navMenu').hasClass('show')) {
      $('#navMenu').collapse('hide');
    }
  });


  /* ============================================================
     04. Scroll-to-Top
  ============================================================ */
  $(window).on('scroll.stt', function () {
    if ($(this).scrollTop() > 400) {
      $('#scrollTop').addClass('visible');
    } else {
      $('#scrollTop').removeClass('visible');
    }
  });

  $('#scrollTop').on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 600, 'swing');
  });


  /* ============================================================
     05. Collection Card Slider
  ============================================================ */
  var $track     = $('#collTrack');
  var $cards     = $track.find('.coll-card');
  var $dotsWrap  = $('#collDots');
  var total      = $cards.length;
  var current    = 0;          // Aktif (ortadaki) kart indeksi
  var cardWidth  = 0;          // JS ile hesaplanacak
  var cardGap    = 24;         // CSS gap: 1.6rem ≈ 24px
  var isAnimating = false;

  /* Nokta göstergelerini oluştur */
  for (var i = 0; i < total; i++) {
    var $dot = $('<button class="coll-dot" aria-label="Kart ' + (i + 1) + '"></button>');
    $dotsWrap.append($dot);
  }
  var $dots = $dotsWrap.find('.coll-dot');

  /* Kart genişliğini hesapla (DOM render sonrası) */
  function measureCard() {
    cardWidth = $cards.first().outerWidth(true);
  }

  /* ── Slider konumlandır & sınıfları güncelle ── */
  function goTo(index, animate) {
    if (animate === undefined) animate = true;

    // Sınır kontrolü
    if (index < 0)       index = total - 1;
    if (index >= total)  index = 0;
    current = index;

    measureCard();

    /*
      Merkez hesabı:
      Tüm bandı container ortasına hizala; aktif kart tam ortada olsun.
      Wrapper genişliğinin ortası — (current * (cardWidth + gap)) — aktif kartın yarısı
    */
    var wrapperW = $('#collTrackWrap').width();
    var centerOffset = (wrapperW / 2) - (current * (cardWidth + cardGap)) - (cardWidth / 2);

    if (!animate) {
      $track.css('transition', 'none');
    } else {
      $track.css('transition', 'transform 0.55s cubic-bezier(0.4,0,0.2,1)');
    }
    $track.css('transform', 'translateX(' + centerOffset + 'px)');

    // Kart sınıflarını güncelle
    $cards.removeClass('is-active is-near');
    $cards.eq(current).addClass('is-active');
    if (current > 0)         $cards.eq(current - 1).addClass('is-near');
    if (current < total - 1) $cards.eq(current + 1).addClass('is-near');

    // Nokta güncelle
    $dots.removeClass('active');
    $dots.eq(current).addClass('active');
  }

  /* Animasyon kilitlemeli geçiş yardımcısı */
  function navigate(dir) {
    if (isAnimating) return;
    isAnimating = true;
    goTo(current + dir);
    setTimeout(function () { isAnimating = false; }, 600);
  }

  /* Ok tıklamaları */
  $('#collPrev').on('click', function () { navigate(-1); });
  $('#collNext').on('click', function () { navigate(+1); });

  /* Nokta tıklamaları */
  $dots.on('click', function () {
    var idx = $(this).index();
    if (idx !== current) { isAnimating = false; navigate(idx - current); }
  });

  /* Klavye desteği */
  $(document).on('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { navigate(-1); }
    if (e.key === 'ArrowRight') { navigate(+1); }
  });

  /* ── Dokunmatik / sürükleme desteği ── */
  var touchStartX = 0;
  var touchStartY = 0;
  var isDragging  = false;
  var dragStartX  = 0;
  var currentTranslate = 0;
  var prevTranslate    = 0;

  /* Touch */
  $('#collTrackWrap')[0].addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  $('#collTrackWrap')[0].addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      navigate(dx < 0 ? 1 : -1);
    }
  }, { passive: true });

  /* Mouse sürükleme */
  $('#collTrackWrap').on('mousedown', function (e) {
    isDragging  = true;
    dragStartX  = e.clientX;
    $track.css('transition', 'none');
  });

  $(document).on('mousemove', function (e) {
    if (!isDragging) return;
    var delta = e.clientX - dragStartX;
    var wrapperW = $('#collTrackWrap').width();
    var baseOffset = (wrapperW / 2) - (current * (cardWidth + cardGap)) - (cardWidth / 2);
    $track.css('transform', 'translateX(' + (baseOffset + delta) + 'px)');
  });

  $(document).on('mouseup', function (e) {
    if (!isDragging) return;
    isDragging = false;
    var dx = e.clientX - dragStartX;
    if (Math.abs(dx) > 60) {
      navigate(dx < 0 ? 1 : -1);
    } else {
      goTo(current); // Yerine geri dön
    }
  });

  /* ── Karta tıklayınca ilgili ürün kartına scroll ── */
  $cards.on('click', function (e) {
    // Sadece aktif karta tıklanınca scroll yap
    // Aktif değilse önce o karta git
    var idx = $(this).index();

    if (!$(this).hasClass('is-active')) {
      isAnimating = false;
      navigate(idx - current);
      return;
    }

    var targetId = $(this).data('target');
    if (targetId && $(targetId).length) {
      var offset = $(targetId).offset().top - ($('#mainNav').outerHeight() + 16);
      $('html, body').animate({ scrollTop: offset }, 680, 'swing');
    }
  });

  /* ── İlk render ── */
  // Pencere yüklendiğinde ölçümü al ve konumlandır
  $(window).on('load resize', function () {
    goTo(current, false);
  });

  // DOM hazır olduğunda da bir kez başlat (gecikmeli)
  setTimeout(function () { goTo(0, false); }, 50);


  /* ============================================================
     06. Ürün Kartı Giriş Animasyonu
  ============================================================ */
  // Başlangıç stili
  $('.prod-card, .why-card').css({
    opacity: 0,
    transform: 'translateY(36px)',
    transition: 'opacity 0.55s ease, transform 0.55s ease'
  });

  var cardObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var $el    = $(entry.target);
        var allEls = $('.prod-card, .why-card');
        var delay  = (allEls.index($el) % 4) * 90; // Stagger

        setTimeout(function () {
          $el.css({ opacity: 1, transform: 'translateY(0)' });
        }, delay);

        cardObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  $('.prod-card, .why-card').each(function () {
    cardObs.observe(this);
  });


  /* ============================================================
     07. Navbar Aktif Link Güncellemesi
  ============================================================ */
  var navSections = ['#hero', '#collection', '#products', '#why-us', '#about', '#contact'];

  $(window).on('scroll.active', function () {
    var scrollPos = $(window).scrollTop() + $('#mainNav').outerHeight() + 20;
    navSections.forEach(function (id) {
      var $sec = $(id);
      if (!$sec.length) return;
      if (scrollPos >= $sec.offset().top && scrollPos < $sec.offset().top + $sec.outerHeight()) {
        $('.nav-link').removeClass('active');
        $('.nav-link[href="' + id + '"]').addClass('active');
      }
    });
  });

  $(window).trigger('scroll.active');


  /* ============================================================
     08. Ripple Efekti (Birincil Butonlar)
  ============================================================ */
  // Dinamik CSS ekle
  if (!$('#ripple-css').length) {
    $('head').append(
      '<style id="ripple-css">' +
      '@keyframes rippleAnim { to { transform: scale(3); opacity: 0; } }' +
      '</style>'
    );
  }

  $(document).on('click', '.btn-primary-retro, .btn-ghost-retro', function (e) {
    var $btn   = $(this);
    $btn.find('.rv-ripple').remove();

    var off = $btn.offset();
    var x   = e.pageX - off.left;
    var y   = e.pageY - off.top;
    var d   = Math.max($btn.outerWidth(), $btn.outerHeight());

    $('<span class="rv-ripple"></span>').css({
      position:      'absolute',
      borderRadius:  '50%',
      width:  d, height: d,
      left:   x - d / 2,
      top:    y - d / 2,
      background:    'rgba(255,255,255,0.4)',
      transform:     'scale(0)',
      pointerEvents: 'none',
      animation:     'rippleAnim 0.6s linear forwards'
    }).appendTo($btn.css({ position: 'relative', overflow: 'hidden' }));

    setTimeout(function () { $btn.find('.rv-ripple').remove(); }, 650);
  });

}); // document.ready
