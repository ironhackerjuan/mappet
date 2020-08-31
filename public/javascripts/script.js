document.addEventListener(
  'DOMContentLoaded',
  () => {
    console.log('IronGenerator JS imported successfully!')
  },
  false
)

$(document).ready(function () {
  bsCustomFileInput.init()
})

const rangeSlider = function () {
  const slider = $('.range-slider'),
    range = $('.range-slider__range'),
    value = $('.range-slider__value')

  slider.each(function () {
    value.each(function () {
      let value = $(this).prev().attr('value')
      $(this).html(value)
    })

    range.on('input', function () {
      $(this).next(value).html(this.value)
    })
  })
}

rangeSlider()
