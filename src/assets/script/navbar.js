$(window).scroll(function () {
  var scroll = $(window).scrollTop();
  if (scroll >= 64){
    $('.nav-secondary').addClass('navbar-fixed');
  }else{
    $('.nav-secondary').removeClass('navbar-fixed');
  }
});