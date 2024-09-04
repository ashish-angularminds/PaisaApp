import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { SplashScreen } from '@capacitor/splash-screen';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

SplashScreen.hide().then((data) => { });
