# Party Crashers Android widget companion

Native Android home-screen widgets require an installed Android component. This companion adds a real resizable widget; it is not a PWA shortcut or WebView wrapper.

- Android 8.0+; Java 17, Gradle 8.13, Android Gradle plugin 8.13.2, SDK 36.
- No login tokens, contacts, background GPS or native notification permissions.
- Each widget stores its chosen area/interests locally, caches up to 3 public events and opens event links in the browser.
- Refreshes through JobScheduler approximately every 30 minutes, subject to Android battery/network restrictions. Explicit Refresh schedules an earlier update.
- Light/dark widget colours follow the system.
- Profile → Open widget setup passes only area and interest names for confirmation in the companion. Browser authentication is never copied into Android.

Before a local preview build, create `.widget-signing/debug.keystore` with `keytool` (alias `androiddebugkey`, store/key password `android`). This development key must not be used for a production release. CI creates and caches its own development key.

Build: `gradle -p android-widget testDebugUnitTest lintDebug assembleDebug`.

The GitHub Actions `Android event widget` workflow runs these checks and uploads `party-crashers-widget-debug`. The debug APK is for preview installation, not a Play Store production release. A production signing identity, Play listing and device testing are separate release requirements. Debug signing identity is reused via the private repository Actions cache to permit preview updates.

If compiling outside CI, install SDK `platforms;android-36` and `build-tools;35.0.0`, and point `ANDROID_HOME` to that SDK. Android resources use the existing canonical Party Crashers app icon.
