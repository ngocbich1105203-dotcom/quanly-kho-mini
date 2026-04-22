import 'zone.js'; 
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // Kiểm tra kỹ dòng này

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));