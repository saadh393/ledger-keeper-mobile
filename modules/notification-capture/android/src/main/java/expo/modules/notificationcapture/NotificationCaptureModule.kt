package expo.modules.notificationcapture

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.core.app.NotificationManagerCompat
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NotificationCaptureModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val store: CaptureStore
    get() = CaptureStore(context)

  override fun definition() = ModuleDefinition {
    Name("NotificationCapture")

    AsyncFunction("isAccessGranted") {
      NotificationManagerCompat.getEnabledListenerPackages(context).contains(context.packageName)
    }

    AsyncFunction("openAccessSettings") {
      val component = ComponentName(context, CaptureListenerService::class.java).flattenToString()
      val detail = Intent(Settings.ACTION_NOTIFICATION_LISTENER_DETAIL_SETTINGS)
        .putExtra(Settings.EXTRA_NOTIFICATION_LISTENER_COMPONENT_NAME, component)
      val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && detail.resolveActivity(context.packageManager) != null) detail
      else Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
      context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }

    Function("setEnabled") { enabled: Boolean ->
      store.setEnabled(enabled)
      if (enabled) CaptureUploadWorker.schedule(context) else CaptureUploadWorker.cancel(context)
    }

    AsyncFunction("isEnabled") { store.isEnabled() }

    AsyncFunction("setAllowedPackages") { packages: List<String> -> store.setAllowedPackages(packages) }

    AsyncFunction("getAllowedPackages") { store.allowedPackages().toList() }

    AsyncFunction("getLaunchableApps") { LaunchableApps.list(context) }

    AsyncFunction("getAppIcon") { packageName: String -> LaunchableApps.icon(context, packageName) }

    AsyncFunction("setAuth") { token: String, baseUrl: String, bookId: String ->
      store.setAuth(CaptureAuth(token, baseUrl, bookId))
    }

    AsyncFunction("clearAuth") {
      CaptureUploadWorker.cancel(context)
      store.clearAuth()
      store.clearQueue()
    }

    AsyncFunction("clearQueue") { store.clearQueue() }

    AsyncFunction("getQueueSize") { store.queue(System.currentTimeMillis()).size }

    AsyncFunction("flush") { CaptureUploadWorker.schedule(context) }
  }
}
