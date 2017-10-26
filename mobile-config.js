
App.info({
  id: 'com.rssl.sms',
  name: 'smsapp',
  description: 'School Management System',
  author: 'Rockstar Softlogic',
  email: 'wisdomabioye@gmail.com',
  website: 'lovelampsys.com'
});
App.launchScreens({
  // 'iphone_2x': 'splash/Default@2x~iphone.png',
  // 'iphone5': 'splash/Default~iphone5.png',
  'android_ldpi_portrait':'public/rssl2320-480.png',
  'android_ldpi_landscape':'public/rssl2320-480.png',
  'android_mdpi_portrait':'public/rssl2320-480.png',
  'android_mdpi_landscape':'public/rssl2320-480.png',
  'android_hdpi_portrait':'public/rssl2320-480.png',
  'android_hdpi_landscape':'public/rssl2320-480.png',
  'android_xhdpi_portrait':'public/rssl2320-480.png',
  ' android_xhdpi_landscape':'public/rssl2320-480.png',

  // More screen sizes and platforms...
});
// Set PhoneGap/Cordova preferences.
App.setPreference("SplashMaintainAspectRatio", true, "android");
// App.setPreference('BackgroundColor', '0xff0000ff');
App.setPreference('HideKeyboardFormAccessoryBar', true);
App.setPreference('Orientation', 'default');
App.setPreference('Orientation', 'all', 'ios');
