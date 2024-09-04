import { Animation, AnimationBuilder, AnimationController, createAnimation } from '@ionic/angular';

export const enterAnimation: AnimationBuilder = (baseEl: HTMLElement, opts?: any): Animation => {
  const DURATION = 5000;
  let ctr = new AnimationController();
  console.log('enter first')
  if (opts.direction === 'forward') {
    // Fade in the next page
    return ctr.create()
      .addElement(opts.enteringEl)
      .duration(DURATION)
      .easing('ease-in')
      .fromTo('opacity', 0, 1);
  } else {
    // Fade in the previous page
    const rootAnimation = createAnimation()
      .addElement(opts.enteringEl)
      .duration(DURATION)
      .easing('ease-out')
      .fromTo('opacity', 0, 1);

    // Fade out the current top page
    const leavingAnim = createAnimation()
      .addElement(opts.leavingEl)
      .duration(DURATION)
      .easing('ease-out')
      .fromTo('opacity', 1, 0);

    // Chain both animations
    return createAnimation().addAnimation([rootAnimation, leavingAnim]);
  }
};