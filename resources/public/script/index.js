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
  },
  deviceProperties = {
    name: '',
    os:'',
    api: '',
    resolution: '',
    aspect_ratio: '',
    release_date: '',
    date_of_introduction: '',
    market_share: '',
    popularity: '',
    imageFileName: ''
  },
  $deviceForm = '',
  $deviceFormObject = {};

  var androidChargerSrc = 'resources/public/images/cables/cable-android-typec-1.png';
  var appleChargerSrc = 'resources/public/images/cables/cable-ios-1.png';
  var $chargerContainer = $('#device-charger');
  var chargerOffsetTop;
  var chargerOffsetLeft;
  var chargerCss;

  function setCharger() {
    var svgInitialHeight = $('#device-grid-lines').height();
    chargerOffsetTop = svgInitialHeight-115;
    if (deviceProperties.os == 'android'){
      $chargerContainer.attr('src',androidChargerSrc);
    } else {
      $chargerContainer.attr('src',appleChargerSrc);
    }
    $chargerContainer.css('z-index',999);
  }

  function init(){
    $deviceForm = $('#set-device-name');
    $deviceFormName = $('#device-name');
    $deviceFormOS = $('#device-type option:selected')[0].value;
    $deviceFormRes = $('#device-resolution');
    $deviceFormAPI = $('#device-api');
    $deviceFormAspectRatio = $('#device-aspect-ratio');
    $deviceFormReleaseDate = $('#device-release-date');
    $deviceFormMarketShare = $('#device-market-share');
    $deviceFormDateAdded = $('#device-date-of-introduction');
    $deviceFormpopularity = $('#device-popularity');

    $deviceUpdateForm = $('#update-form');
    $devicePropertyForm = $('#device-property-form-data');

    $bsFromContainer = $('#step_1_device_form');
    $bsDatContainer = $('#bsdat_main_wrapper');

    $bsDatTextAreaDevicesJS = $('#devices_js');
    $bsDatTextAreaConstantRB = $('#constants_rb');
  }

  function getFormData(){
    $deviceFormObject = {
      name: $('')
    }
  }

  function generateDeviceImageName(deviceName){
    var imageName = deviceName.toLowerCase().replace(/\s+/g, '-');
    return imageName;
  }

  function populateDeviceObject(deviceName, os, resolution, api, aspect_ratio, release_date, date_added, market_share, popularity){
    deviceProperties.name = deviceName;
    deviceProperties.os = os;
    deviceProperties.api = api;
    deviceProperties.resolution = resolution;
    deviceProperties.aspect_ratio = aspect_ratio;
    deviceProperties.release_date = release_date;
    deviceProperties.date_of_introduction = date_added;
    deviceProperties.market_share = market_share;
    deviceProperties.popularity = popularity;
    deviceProperties.imageFileName = generateDeviceImageName(deviceName);
  }

  function showBsDat(){
    $bsFromContainer.toggleClass('hide');
  }

  function populateDataInTextArea(rawContent){
    var final_content = rawContent.split('wonder-boy:');
    $bsDatTextAreaDevicesJS.text(final_content[0].trim());
    $bsDatTextAreaConstantRB.text(final_content[1].trim());
  }

  function sendDataToNodeJS(deviceProperties) {
    fetch('http://localhost:8080/device-info', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deviceProperties)
    }).then(function(response){
      if (response.status == 200){
        showBsDat();
        return response.text();
      } else {
        console.log('Failure');
      }
    }).then(function(output){
      populateDataInTextArea(output);
    });
  }

  $(document).ready(function (){
    init();

    $("#smartwizard").on("showStep", function(e, anchorObject, stepNumber, stepDirection, stepPosition) {
      if(stepPosition === 'first') {
        $("#prev-btn").addClass('disabled');
      } else if(stepPosition === 'final') {
        $("#next-btn").addClass('disabled');
      } else {
        $("#prev-btn").removeClass('disabled');
        $("#next-btn").removeClass('disabled');
      }
    });
    $('#smartwizard').smartWizard({
      selected: 0,
      theme: 'arrows',
      transitionEffect:'fade',
      showStepURLhash: true,
      toolbarSettings: {
        toolbarPosition: 'top',
        toolbarButtonPosition: 'end'
      },
      keyNavigation: false
    });
    $("#prev-btn").on("click", function() {
      $('#smartwizard').smartWizard("prev");
    });

    $("#next-btn").on("click", function() {
      $('#smartwizard').smartWizard("next");
    });

    $deviceForm.on('submit', function(e){
      e.preventDefault();
      getFormData();
      populateDeviceObject($deviceFormName.val(),$('#device-type option:selected')[0].value, $deviceFormRes.val(),$deviceFormAPI.val(),$deviceFormAspectRatio.val(),$deviceFormReleaseDate.val(),$deviceFormDateAdded.val(), $deviceFormMarketShare.val(),$deviceFormpopularity.val());
      $('#smartwizard').smartWizard("next");
    });

    $('#enable-device-selector').on('click', function (e) {
      e.preventDefault();
      const railsPath = $('#railsAppPath').val();
      if (railsPath) {
        $('#after-device-wrapper').removeClass('hide').addClass('show');
        fetch('http://localhost:8080/device-list?railsapp='+$('#railsAppPath').val())
        .then(function (response) {
          return response.json();
        })
        .then(function (response) {
          var html = function (name) { return '<option value='+name+'>'+name+'</option>' };
          var optionList = response.list.map(function (deviceName) {
            return (
              html(deviceName)
            );
          });
          $('#after-device').html(optionList);
        });
      } else {
        $('#railsAppPath').css('border-color', 'red')
      }
    });

    $deviceUpdateForm.on('submit', function(e) {
      e.preventDefault();
      const railsAppPath = $('#railsAppPath').val();
      if (railsAppPath) {
        $devicePropertyToWrite = {
          devicesJSCode: $('#devices_js').text(),
          constantRbCode: $('#constants_rb').text(),
          realMobileScssCode: $('#real-mobile_scss').text(),
          railsAppPath: railsAppPath,
          afterDeviceName: $('#after-device').find(":selected").text()
        }
        fetch('http://localhost:8080/update-files', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify($devicePropertyToWrite)
        }).then(function(response){
          $("body").overhang({
            type: "success",
            message: "Successfulyy wrote to railsApp"
          });
          console.log(response);
        });
      } else {
        $('#railsAppPath').css('border-color', 'red')
      }
    });
  });
