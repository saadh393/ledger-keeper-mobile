package expo.modules.notificationcapture

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.util.Base64
import java.io.ByteArrayOutputStream

object LaunchableApps {
  private const val ICON_SIZE = 96

  fun list(context: Context): List<Map<String, String>> {
    val intent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
    val pm = context.packageManager
    return pm.queryIntentActivities(intent, 0)
      .map { it.activityInfo.applicationInfo }
      .filter { it.packageName != context.packageName }
      .distinctBy { it.packageName }
      .map { mapOf("packageName" to it.packageName, "label" to pm.getApplicationLabel(it).toString()) }
  }

  fun icon(context: Context, packageName: String): String? = try {
    val drawable = context.packageManager.getApplicationIcon(packageName)
    val bitmap = Bitmap.createBitmap(ICON_SIZE, ICON_SIZE, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    drawable.setBounds(0, 0, ICON_SIZE, ICON_SIZE)
    drawable.draw(canvas)
    val stream = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
    "data:image/png;base64," + Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
  } catch (error: Exception) {
    null
  }
}
