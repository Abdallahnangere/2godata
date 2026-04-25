# 2GO DATA Android WebView

Open `android-webview` directly in Android Studio.

What it does:
- loads `https://2godata.com/app`
- supports pull-to-refresh
- keeps cookies/session state
- handles in-app back navigation inside the WebView

Notes:
- update `BuildConfig.APP_URL` in `app/build.gradle.kts` if your deployed app URL changes
- Android SDK/Gradle sync is required inside Android Studio before running
