import $ from 'jquery'

$.fn.autoGrowInput = function (o) {
  o = $.extend({ maxWidth: 1000, minWidth: 0, comfortZone: 70 }, o)

  this.filter('input:text').each(function () {
    var minWidth = o.minWidth || $(this).width()
    var val = ''
    var input = $(this)
    var testSubject = $('<tester/>').css({
      position: 'absolute', top: -9999, left: -9999, width: 'auto',
      fontSize: input.css('fontSize'), fontFamily: input.css('fontFamily'),
      fontWeight: input.css('fontWeight'), letterSpacing: input.css('letterSpacing'),
      whiteSpace: 'nowrap'
    })
    var check = function () {
      if (val === (val = input.val())) return
      var escaped = val.replace(/&/g, '&amp;').replace(/\s/g, '&nbsp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      testSubject.html(escaped)
      var testerWidth = testSubject.width()
      var newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth
      var currentWidth = input.width()
      var isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth) || (newWidth > minWidth && newWidth < o.maxWidth)
      if (isValidWidthChange) input.width(newWidth)
    }
    testSubject.insertAfter(input)
    $(this).bind('keyup keydown blur update', check)
  })

  return this
}
