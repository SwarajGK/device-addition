const chargerTemplate = (name, type, cableImage, top) => {
  /* eg.
    name: oneplus-6t, String
    cableImage: cable-android-1.png, String
    type: android || ios, String
    top: 89.56 Number
  */
  return `
    .real-mobile-stage[data-device='${name}'] {
      .rm-charger {
        background-image: url('../images/${cableImage}');
        width: 22.12%;
        height: 0;
        padding-bottom: 180%;
        background-size: cover;
        .rm-charger-cord {
          background: url('../images/cable-${type}-1-cord.png');
          background-size: contain;
        }
      }
      .rm-charger-final {
        ${type === 'android' ? `top: calc(${top}% - 12px);` : `top: ${top}%;`}
      }
    }
    
    .device-charger[data-device='${name}'] {
      background-image: url('../images/${cableImage}');
      width: 22.12%;
      height: 0;
      padding-bottom: 180%;
      background-size: cover;
      .device-charger-cord {
        background: url('../images/cable-${type}-1-cord.png');
        background-size: contain;
      }
    }
    
    .device-charger-final[data-device='${name}'] {
      top: ${top}%;
      z-index: 0;
    }
  `
};