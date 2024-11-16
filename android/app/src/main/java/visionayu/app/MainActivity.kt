package visionayu.app

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "app"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(null) // Pass null to avoid restoring the fragment state
    }
    override fun onResume() {
        super.onResume()
        (application as MainApplication).setCurrentActivity(this)
    }

    override fun onPause() {
        (application as MainApplication).setCurrentActivity(null)
        super.onPause()
    }
}
