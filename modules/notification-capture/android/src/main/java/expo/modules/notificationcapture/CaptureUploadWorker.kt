package expo.modules.notificationcapture

import android.content.Context
import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import java.util.concurrent.TimeUnit

class CaptureUploadWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
  override suspend fun doWork(): Result {
    val store = CaptureStore(applicationContext)
    if (!store.isEnabled()) return Result.success()
    val auth = store.auth() ?: return Result.success()
    if (!CaptureUploader.isSecure(auth.baseUrl)) return Result.success()
    var retry = false
    for (item in store.queue(System.currentTimeMillis())) {
      if (!store.isEnabled()) return Result.success()
      when (UploadDecision.of(CaptureUploader.upload(auth, item))) {
        UploadOutcome.DELETE, UploadOutcome.DROP -> store.remove(setOf(item.id))
        UploadOutcome.RETRY -> retry = true
        UploadOutcome.STOP -> return Result.success()
      }
    }
    return if (retry) Result.retry() else Result.success()
  }

  companion object {
    private const val NAME = "notification-capture-upload"

    fun schedule(context: Context) {
      val request = OneTimeWorkRequestBuilder<CaptureUploadWorker>()
        .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
        .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
        .build()
      WorkManager.getInstance(context).enqueueUniqueWork(NAME, ExistingWorkPolicy.APPEND_OR_REPLACE, request)
    }

    fun cancel(context: Context) {
      WorkManager.getInstance(context).cancelUniqueWork(NAME)
    }
  }
}
