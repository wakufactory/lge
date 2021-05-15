import EventTarget from '@ungap/event-target';

const BUTTON_NAMES = ['square', 'left', 'right', 'circle'];

export class Buttons extends EventTarget {
  constructor() {
    super();

    this.lastButtonState = [];
    for (let i = 0; i < BUTTON_NAMES.length; i++) {
      this.lastButtonState.push(false);
    }

    this.gamepadInfo = null;

    window.addEventListener('gamepadconnected', (e) => {
      if (e.gamepad.id.indexOf('HoloPlay') > -1) {
        this.gamepadInfo = navigator.getGamepads()[e.gamepad.index];
      }
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      if (e.gamepad.id.indexOf('HoloPlay') > -1) {
        this.gamepadInfo = null;
      }
    });

    requestAnimationFrame(this.update.bind(this));
  }

  update() {
    requestAnimationFrame(this.update.bind(this));

    if (this.gamepadInfo == null) {
      return;
    }

    let holoplayGamepad;
    let allGamepads = navigator.getGamepads();
    for (let i = 0; i < allGamepads.length; i++) {
      if (allGamepads[i].index == this.gamepadInfo.index) {
        holoplayGamepad = allGamepads[i];
        break;
      }
    }

    if (!holoplayGamepad) {
      return;
    }

    for (let i = 0; i < holoplayGamepad.buttons.length; i++) {
      if (!this.lastButtonState[i] && holoplayGamepad.buttons[i].pressed) {
        this.dispatchButtonEvent('buttonDown', i);
        this.dispatchButtonEvent('buttonPressed', i);
      } else if (
          this.lastButtonState[i] && holoplayGamepad.buttons[i].pressed) {
        this.dispatchButtonEvent('buttonPressed', i);
      } else if (
          this.lastButtonState[i] && !holoplayGamepad.buttons[i].pressed) {
        this.dispatchButtonEvent('buttonUp', i);
      }

      this.lastButtonState[i] = holoplayGamepad.buttons[i].pressed;
    }
  }

  dispatchButtonEvent(type, buttonIndex) {
    this.dispatchEvent(new CustomEvent(type, {
      detail: {
        name: BUTTON_NAMES[buttonIndex],
        index: buttonIndex,
      }
    }));
  }
}
