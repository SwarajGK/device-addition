(function (d, w, $d, $, undefined) {

  var ROUNDING_FUNCTION = 'round';
  var STEP_MULTIPLIER = 10;
  var ACCURACY = 2;
  var SCALE_ACCURACY = 4;
  var $objects = {};
  var device = {
    id: '',
    name: '',
    image: '',
    width: 0,
    height: 0,
    skinWidth: 0,
    skinHeight: 0,
    scale: 1,
    isOverlay: false,
    deviceTransform: {},
    scaledDeviceTransform: {},
    ceiledDeviceTransform: {},
    leftAdjustment: 0
  };
  var undoOperations = [];

  var $deviceDimensions = $('.device-dimensions-div');
  var $buttonSetCharger = $('#set-charger');
  var $deviceSkinCssWidth = $('#set-device-skin-css-width');
  var $deviceSkinDimensionsDiv = $('.device-skin-dimensions-div');
  var $scaledTransformDiv = $('.scaled-transform-div');
  var $scaledTransformText = $('.scaled-transform-div p');
  var $deviceVideoInput = $('#device-video-transform-scale-input');
  var $generateRailsCode = $('#genrate_rails_code');

  function convertToCSS(cssTransform, tabs) {
    tabs = tabs || 1;
    return Object
      .keys(cssTransform)
      .map(function (property) {
        return `${property}: ${cssTransform[property]};`;
      })
      .join(`\n${'  '.repeat(tabs)}`);
  }

  function formatCSS(css) {
    return css
      .replace(/\{/g, '{\n\t')
      .replace(/\"/g, '')
      .replace(/\,/g, ';\n\t')
      .replace(/\:/g, ': ')
      .replace(/\}/g, '\n}');
  }

  function formatJSON(css) {
    return css
      .replace(/\{/g, '{\n\t')
      .replace(/\,/g, ',\n\t')
      .replace(/\}/g, '\n}');
  }

  function reset() {
    $objects.deviceVideo.removeAttr('style');
  }

  function calculateDeviceScale() {
    device.scale = parseFloat($objects.deviceVideoTransformScaleInput.val());
  }

  function getDeviceVideoTransformScale() {
    return parseFloat(device.skinWidth / device.width);
  }

  function getDeviceTransform() {
    var position = $objects.deviceVideo.position();
    var width = $objects.deviceVideo.width();
    var height = $objects.deviceVideo.height();

    return {
      top: position.top,
      left: position.left,
      width: width,
      height: height
    };
  }

  function getChargerTransform() {
    var position = $objects.deviceCharger.position();
    var width = $objects.deviceCharger.width();
    var height = $objects.deviceCharger.height();

    return {
      top: position.top,
      left: position.left,
      width: width,
      height: height
    };
  }

  function getLeftAdjustment() {
    return $objects.deviceVideoHorizontalCenterLine.offset().left - $objects.deviceImageHorizontalCenterLine.offset().left;
  }

  function getTopAdjustment() {
    return $objects.deviceVideoVerticalCenterLine.offset().top - $objects.deviceImageVerticalCenterLine.offset().top;
  }

  function updateDeviceName() {
    $objects.deviceName.text(device.name);
  }

  function updateDeviceImage() {
    var fileReader = new FileReader();
    fileReader.onload = function () {
        $objects.deviceImage.attr('src', fileReader.result);
    }
    fileReader.readAsDataURL(device.image);
  }

  function updateCalculatedScale() {
    $objects.deviceVideoTransformScaleInput
      .val(getDeviceVideoTransformScale().toFixed(SCALE_ACCURACY))
      .trigger('change');
  }

  function updateDeviceSkinDimensions() {
    $objects.deviceSkinCSSWidthInput.val(device.skinWidth);
    $objects.deviceSkinDimensions.text(`${device.skinWidth}px x ${device.skinHeight}px`);
  }

  function updateDeviceDimensions() {
    $objects.deviceDimensions.text(`${device.width}px x ${device.height}px (${device.aspectRatio})`);
  }

  function updateDeviceVideoTransform(deviceTransform) {
    deviceTransform = $.extend({}, deviceTransform);
    deviceTransform['border-top-left-radius'] = parseInt($objects.deviceVideo.css('border-top-left-radius'));
    deviceTransform['border-top-right-radius'] = parseInt($objects.deviceVideo.css('border-top-right-radius'));
    deviceTransform['border-bottom-left-radius'] = parseInt($objects.deviceVideo.css('border-bottom-left-radius'));
    deviceTransform['border-bottom-right-radius'] = parseInt($objects.deviceVideo.css('border-bottom-right-radius'));

    var leftAdjustment = getLeftAdjustment() / 2 * device.scale;
    var topAdjustment = getTopAdjustment() / 2 * device.scale;
    var scaledDeviceTransform = $.extend({}, deviceTransform);
    var ceiledDeviceTransform = $.extend({}, deviceTransform);

    for (var transfrom in deviceTransform) {
      var scaledTransform = scaledDeviceTransform[transfrom] * device.scale;

      deviceTransform[transfrom] = `${deviceTransform[transfrom]}px`;
      scaledDeviceTransform[transfrom] = `${scaledTransform.toFixed(ACCURACY)}px`;
      ceiledDeviceTransform[transfrom] = `${Math[ROUNDING_FUNCTION](scaledTransform)}px`;
    }

    leftAdjustment += parseFloat(scaledDeviceTransform.left);
    topAdjustment += parseFloat(scaledDeviceTransform.top);

    $objects.deviceVideoTransform.val(formatJSON(JSON.stringify(deviceTransform)));

    $objects.scaledDeviceVideoTransform.val(formatCSS(JSON.stringify(scaledDeviceTransform)));

    $objects.ceiledDeviceVideoTransform.val(formatCSS(JSON.stringify(ceiledDeviceTransform)));

    device.deviceTransform = deviceTransform;
    device.scaledDeviceTransform = scaledDeviceTransform;
    device.ceiledDeviceTransform = ceiledDeviceTransform;
    device.leftAdjustment = leftAdjustment;
  }

  function setDeviceImage(deviceImage) {
    device.image = deviceImage;
    device.id = deviceImage.name.toLowerCase().split('.')[0];
    device.name = deviceImage.name.split('.')[0].replace(/\-/g, ' ');
    updateDeviceName();
    updateDeviceImage();
  }

  function setDeviceSkinCSSWidth(deviceSkinCSSWidth) {
    device.skinWidth = deviceSkinCSSWidth;
    device.skinHeight = Math[ROUNDING_FUNCTION](device.skinWidth * device.aspectRatio);
    updateDeviceSkinDimensions();
    updateCalculatedScale();
  }

  function setDeviceVideoBorderRadius(deviceVideoBorderRadius) {
    for (var borderRadius in deviceVideoBorderRadius) {
      deviceVideoBorderRadius[borderRadius] += 'px';
    }
    $objects.deviceVideo.css(deviceVideoBorderRadius);
    updateDeviceVideoTransform(getDeviceTransform());
  }

  function onDeviceImageLoad() {
    device.width = $objects.deviceImage.width();
    device.height = $objects.deviceImage.height();
    device.aspectRatio = (device.height / device.width).toFixed(SCALE_ACCURACY);
    updateDeviceDimensions();
    setDeviceSkinCSSWidth(device.width);
  }

  function onDeviceVideoKeydown(event) {
    var prevent = true;
    var deviceTransform = getDeviceTransform();
    var step = 1 * (event.metaKey ? STEP_MULTIPLIER : 1);
    if (event.shiftKey) {
      switch (event.which) {
        // Up
        case 38:
          prevent = false;
          deviceTransform.height -= step;
          break;
        // Down
        case 40:
          prevent = false;
          deviceTransform.height += step;
          break;
        // Right
        case 39:
          prevent = false;
          deviceTransform.width += step;
          break;
        // Left
        case 37:
          prevent = false;
          deviceTransform.width -= step;
          break;
      }
    } else {
      switch (event.which) {
        // Up
        case 38:
          prevent = false;
          deviceTransform.top -= step;
          break;
        // Down
        case 40:
          prevent = false;
          deviceTransform.top += step;
          break;
        // Right
        case 39:
          prevent = false;
          deviceTransform.left += step;
          break;
        // Left
        case 37:
          prevent = false;
          deviceTransform.left -= step;
          break;
      }
    }
    if (!prevent) {
      event.preventDefault();
      $objects.deviceVideo.css(deviceTransform);
      undoOperations.push(deviceTransform);
      updateDeviceVideoTransform(deviceTransform);
    }
  }

  function onDeviceVideoDragStart() {
    var deviceTransform = getDeviceTransform();
    undoOperations.push(deviceTransform);
    updateDeviceVideoTransform(deviceTransform);
  }

  function onChargerDragStart() {
    getChargerTransform();
  }

  function onDeviceVideoDragStop() {
    updateDeviceVideoTransform(getDeviceTransform());
  }

  function onChargerDragStop() {
    updateDeviceVideoTransform(getDeviceTransform());
    const { top } = getChargerTransform();
    const chargerTop = (top / device.skinHeight) * 100;
    var deviceCssPropname = deviceProperties.imageFileName;
    if (deviceProperties.os == 'android') {
      chargerCss = chargerTemplate(deviceCssPropname, 'android', 'cable-android-1.png', chargerTop.toFixed(2));
    } else {
      chargerCss = chargerTemplate(deviceCssPropname, 'ios', 'cable-ios-1.png', chargerTop.toFixed(2));
    }
  }

  function onDeviceVideoResizeStop() {
    var deviceTransform = getDeviceTransform();
    undoOperations.push(deviceTransform);
    updateDeviceVideoTransform(deviceTransform);
  }

  function onDeviceVideoBorderRadiusUpdate(borderRadiusForm) {
    var borderRaius = {};
    $('input[type="number"]', borderRadiusForm).each(function () {
      borderRaius[`${this.className.toString()}-left-radius`] = parseInt(this.value);
      borderRaius[`${this.className.toString()}-right-radius`] = parseInt(this.value);
    });
    setDeviceVideoBorderRadius(borderRaius);
  }

  function computeCSS() {
    var ceiledDeviceTransform = $.extend({}, device.ceiledDeviceTransform);
    var percentageTransform = $.extend({}, ceiledDeviceTransform);
    if (device.isOverlay) {
      for (var transform in percentageTransform) {
        if (['top', 'left', 'width', 'height'].indexOf(transform) > -1) {
          var transformValue = parseInt(percentageTransform[transform]);
          var transformBase = parseInt(device[transformBaseMap[transform]]);
          percentageTransform[transform] = `${(transformValue / transformBase * 100).toFixed(ACCURACY)}%`;
        }
      }
    }

    var deviceCssPropname = deviceProperties.imageFileName;

    // var css = `${device.isOverlay ? `.real-mobile-stage[data-device="${device.id}"] .rm-skin,
    var css = `.real-mobile-stage[data-device="${device.id}"] .rm-skin,
  .device-skin-img.img-${deviceCssPropname} {
    &:before {
      content: '';
      background-color: #000;
      position: absolute;
      ${convertToCSS(percentageTransform, 2)}
      z-index: 1;
    }
  }
  .device-${deviceCssPropname} #flashlight-overlay-native {
    z-index: 4;
  }
  .skin-parent .img-${deviceCssPropname},
  .real-mobile-stage[data-device="${deviceCssPropname}"] .rm-skin {
    top: 0;
    left: 0;
    width: ${device.skinWidth}px;
    height: ${device.skinHeight}px;
  }
  .skin-parent .img-${deviceCssPropname} img,
  .real-mobile-stage[data-device="${deviceCssPropname}"] .rm-skin-img {
    display: block;
    position: relative;
    top: 0;
    left: 0;
    margin: 0;
    width: 100%;
    height: 100%;
    z-index: 3;
  }
  .skin-parent .video-${deviceCssPropname},
  .real-mobile-stage[data-device="${deviceCssPropname}"] .rm-skin .rm-loader-video {
    position: absolute;
    ${convertToCSS(ceiledDeviceTransform)}
    z-index: 2;
  }
  .skin-parent.device-${deviceCssPropname} {
    margin-left: ${Math[ROUNDING_FUNCTION](device.leftAdjustment / 2)}px;
  }
  .real-mobile-stage[data-device="${deviceCssPropname}"] .rm-skin-holder {
    margin-left: ${Math[ROUNDING_FUNCTION](device.leftAdjustment)}px;
  }
  ${chargerCss.trim()}
  `;
      return css;
    }

  $(function () {
    $objects.deviceImageInput = $('#device-image-input', d);
    $objects.deviceName = $('#device-name', d);
    $objects.deviceDimensions = $('#device-dimensions', d);
    $objects.deviceSkinCSSWidthInput = $('#device-skin-css-width-input', d);
    $objects.deviceSkinDimensions = $('#device-skin-dimensions', d);
    $objects.deviceVideoBorderRadiusInput = $('#device-video-border-radius-input', d);
    $objects.deviceImage = $('#device-image', d);
    $objects.deviceImage.get(0).onload = onDeviceImageLoad;
    $objects.deviceVideo = $('#device-video', d);
    $objects.deviceCharger = $('#device-charger', d);
    $objects.deviceCharger
      .draggable({
        start: onChargerDragStart,
        stop: onChargerDragStop
      });
    $objects.deviceVideo
      .draggable({
        start: onDeviceVideoDragStart,
        stop: onDeviceVideoDragStop
      })
      .resizable({
        helper: 'device-video-resize-helper',
        grid: 1,
        stop: onDeviceVideoResizeStop
      });
    $objects.setDeviceVideoTransformForm = $('#set-device-video-transform-form');
    $objects.deviceVideoTransform = $('#device-video-transform', d);
    $objects.scaledDeviceVideoTransform = $('#scaled-video-transfrom', d);
    $objects.ceiledDeviceVideoTransform = $('#ceiled-video-transfrom', d);
    $objects.deviceVideoTransformScaleInput = $('#device-video-transform-scale-input', d);
    $objects.deviceIsOverlayInput = $('#device-is-overlay-input', d);
    $objects.computedCSS = $('#computed-css', d);
    $objects.deviceVideoHorizontalCenterLine = $('#device-video-horizontal-center-line', d);
    $objects.deviceImageHorizontalCenterLine = $('#device-image-horizontal-center-line', d);
    $objects.deviceVideoVerticalCenterLine = $('#device-video-vertical-center-line', d);
    $objects.deviceImageVerticalCenterLine = $('#device-image-vertical-center-line', d);
    calculateDeviceScale();
  });

  

  $d
    .on('submit', '#set-device-image-form', function () {
      setDeviceImage($objects.deviceImageInput.get(0).files[0]);
      reset();
      $objects.setDeviceVideoTransformForm.trigger('submit');
      setTimeout(() => {
        $('#bsdat_main_wrapper').css('height', `${$('#device-image-container').height() + 50}px`);
      }, 100);
      $deviceDimensions.removeClass('hide');
      $buttonSetCharger.removeClass('hide');
    })
    .on('submit', '#set-device-skin-css-width', function () {
      setDeviceSkinCSSWidth(parseFloat($objects.deviceSkinCSSWidthInput.val()));
      $deviceSkinDimensionsDiv.removeClass('hide');
      $scaledTransformDiv.removeClass('hide');
      $scaledTransformText.removeClass('hide');
      $deviceVideoInput.removeClass('hide');
      $generateRailsCode.removeClass('hide');
    })
    .on('submit', '#set-device-video-border-radius-form', function () {
      onDeviceVideoBorderRadiusUpdate(this);
    })
    .on('change', '#set-device-video-border-radius-form input[type="number"]', function () {
      var form = $(this).parent().get(0);
      onDeviceVideoBorderRadiusUpdate(form);
    })
    .on('submit', '#set-device-video-transform-form', function () {
      try {
        var deviceTransform = JSON.parse($objects.deviceVideoTransform.val());
        $objects.deviceVideo
          .css(deviceTransform);
        $('#set-device-video-border-radius-form input[type="number"]').each(function () {
          var $input = $(this);
          $input.val(parseInt($objects.deviceVideo.css(`${$input.attr('class')}-left-radius`)));
        });
        updateDeviceVideoTransform(getDeviceTransform());
      } catch { }
    })
    .on('submit', 'form', function (event) {
      event.preventDefault();
    })
    .on('change', '#device-type',function () {
      const selectedValue = $(this).children("option:selected").val();
    })
    .on('keydown', '#device-video', onDeviceVideoKeydown)
    .on('keydown', function (event) {
      if (event.metaKey && (event.which === 90)) {
        var deviceTransform = undoOperations.pop();
        if (deviceTransform) {
          $objects.deviceVideo.css(deviceTransform);
          updateDeviceVideoTransform(deviceTransform);
        }
      }
    })
    .on('change', '#device-video-transform-scale-input', function () {
      calculateDeviceScale();
      updateDeviceVideoTransform(getDeviceTransform());
    })
    .on('click', '#set-charger', function (e) {
      e.preventDefault();
      setCharger();
      $deviceSkinCssWidth.removeClass('hide');
    })
    .on('click', '#genrate_rails_code', function (e) {
      e.preventDefault();
      sendDataToNodeJS(deviceProperties);
      $('#real-mobile_scss').text(computeCSS().trim());
      $('#smartwizard').smartWizard("next");
    });

})(document, window, jQuery(document), jQuery);