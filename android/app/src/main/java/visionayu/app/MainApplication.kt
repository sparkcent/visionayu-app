package visionayu.app

import android.app.Application
import android.content.Intent
import androidx.annotation.Nullable
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.UpdateAvailability
import android.app.Activity
import android.app.Activity.RESULT_OK
import android.util.Log
import com.google.android.play.core.appupdate.AppUpdateInfo

class MainApplication : Application(), ReactApplication {

    private var currentActivity: Activity? = null // Store current activity reference

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    // Packages that cannot be autolinked yet can be added manually here, for example:
                    // add(MyReactNativePackage())
                }

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        }

    override val reactHost: ReactHost
        get() = getDefaultReactHost(applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted-in for the New Architecture, we load the native entry point for this app.
            load()
        }
        checkForUpdates()
    }

    // Set the current activity
    fun setCurrentActivity(activity: Activity?) {
        currentActivity = activity
    }

    fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == REQUEST_CODE_UPDATE) {
            if (resultCode != RESULT_OK) {
                // Handle the update failure or cancellation
            }
        }
    }

    private fun checkForUpdates() {
        val appUpdateManager = AppUpdateManagerFactory.create(this)
        val appUpdateInfoTask = appUpdateManager.appUpdateInfo
        Log.d("update available","Checking for updates...")
        appUpdateInfoTask.addOnSuccessListener { appUpdateInfo ->
            Log.d("update available", "Update availability: ${appUpdateInfo.updateAvailability()}")
            Log.d("update available", "Is immediate update allowed: ${appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)}")

            if (appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE &&
                appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)) {

                Log.d("update available", "Update available and immediate update is allowed")
                currentActivity?.let {
                    appUpdateManager.startUpdateFlowForResult(
                        appUpdateInfo,
                        AppUpdateType.IMMEDIATE,
                        it,
                        REQUEST_CODE_UPDATE
                    )
                }
            } else {
                Log.d("update available", "No update available or immediate update not allowed")
            }
        }.addOnFailureListener { exception ->
            Log.e("update available", "Update check failed", exception)
        }
    }


    companion object {
        const val REQUEST_CODE_UPDATE = 1001
    }
}
