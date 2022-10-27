function include(url) {
  document.write('<script src="' + url + '"></script>');
  return false;
}

/* cookie.JS
========================================================*/
include('js/jquery.cookie.js');


/* DEVICE.JS
========================================================*/
include('js/device.min.js');

/* Stick up menu
========================================================*/
include('js/tmstickup.js');
$(window).load(function () {
  if ($('html').hasClass('desktop')) {
      $('#stuck_container').TMStickUp({})
  }
});

/* Easing library
========================================================*/
include('js/jquery.easing.1.3.js');

/* ToTop
========================================================*/
include('js/jquery.ui.totop.js');
$(function () {
  $().UItoTop({
      easingType: 'easeOutQuart'
  });
});


/* DEVICE.JS AND SMOOTH SCROLLIG
========================================================*/
include('js/jquery.mousewheel.min.js');
include('js/jquery.simplr.smoothscroll.min.js');
$(function () {
  if ($('html').hasClass('desktop')) {
      $.srSmoothscroll({
          step: 150,
          speed: 800
      });
  }
});

/* Copyright Year
========================================================*/
var currentYear = (new Date).getFullYear();
$(document).ready(function () {
  $("#copyright-year").text((new Date).getFullYear());
});


/* Superfish menu
========================================================*/
include('js/superfish.js');
include('js/jquery.mobilemenu.js');

/* Unveil
========================================================*/
include('js/jquery.unveil.js');
$(document).ready(function () {
  $('img').unveil(0, function () {
      $(this).load(function () {
          $(this).addClass("js-unveil");
      });
  });
});

/* Orientation tablet fix
========================================================*/
$(function () {
  // IPad/IPhone
  var viewportmeta = document.querySelector && document.querySelector('meta[name="viewport"]'),
      ua = navigator.userAgent,

      gestureStart = function () {
          viewportmeta.content = "width=device-width, minimum-scale=0.25, maximum-scale=1.6, initial-scale=1.0";
      },

      scaleFix = function () {
          if (viewportmeta && /iPhone|iPad/.test(ua) && !/Opera Mini/.test(ua)) {
              viewportmeta.content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0";
              document.addEventListener("gesturestart", gestureStart, false);
          }
      };

  scaleFix();
  // Menu Android
  if (window.orientation != undefined) {
      var regM = /ipod|ipad|iphone/gi,
          result = ua.match(regM)
      if (!result) {
          $('.sf-menu li').each(function () {
              if ($(">ul", this)[0]) {
                  $(">a", this).toggle(
                      function () {
                          return false;
                      },
                      function () {
                          window.location.href = $(this).attr("href");
                      }
                  );
              }
          })
      }
  }
});
var ua = navigator.userAgent.toLocaleLowerCase(),
  regV = /ipod|ipad|iphone/gi,
  result = ua.match(regV),
  userScale = "";
if (!result) {
  userScale = ",user-scalable=0"
}
document.write('<meta name="viewport" content="width=device-width,initial-scale=1.0' + userScale + '">')

$(document).ready(function () {
  var obj;
  if ((obj = $('#camera')).length > 0) {
      obj.camera({
          height: '51,5625%',
          minHeight: '200px',
          pagination: false,
          thumbnails: false,
          playPause: false,
          hover: false,
          loader: 'none',
          navigation: true,
          navigationHover: false,
          mobileNavHover: false,
          fx: 'simpleFade',
          onLoaded: function () {
              $('.box1_cnt').css("display", "block");
          }
      })
  }

  //clock
  if ((obj = $('#clock')).length > 0) {
      $('#clock').countdown('2019/04/25 09:00:00')
          .on('update.countdown', function (event) {
              var format = '<span class="clr3">%D<small>Days</small></span>:<span class="clr1">%H<small>Hrs</small></span>:<span class="clr2">%S<small>Seconds</small></span>';
              $(this).html(event.strftime(format));
          });
  }

  if ((obj = $('a[data-type="lightbox"]')).length > 0) {
      // obj.touchTouch();
  }

  if ((obj = $('#calendar')).length > 0) {
      var calendar = obj.calendario({
          year: 2020,
          month: 4,
          weekabbrs: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
          displayWeekAbbr: true
      })
  }

  if ((obj = $('#isotope')).length > 0) {
      obj.isotope({
          itemSelector: '.item',
          masonry: {
              columnWidth: '.grid-sizer',
              gutter: '.gutter-sizer'
          }
      });

      $('#filters').on('click', 'a', function () {
          var filterValue = $(this).attr('data-filter');

          if (filterValue == '*') {
              obj.isotope({
                  filter: filterValue
              });
          } else {
              obj.isotope({
                  filter: '.' + filterValue
              });
          }

          $('#filters').find('li').removeClass('active');
          $(this).parent().addClass('active');
          return false;
      });
  }

  $('#clock').countdown('2020/4/25', function (event) {
      var $this = $(this).html(event.strftime('' +
          '<span>%w</span> weeks ' +
          '<span>%d</span> days ' +
          '<span>%H</span> hr ' +
          '<span>%M</span> min ' +
          '<span>%S</span> sec '))
  })
});

$(window).load(function () {
  var obj = $('#isotope');
  if (obj.length > 0) {
      setTimeout(function () {
          setInterval(function () {
              obj.isotope('layout')
          }, 1000)
      }, 300);
  }
});