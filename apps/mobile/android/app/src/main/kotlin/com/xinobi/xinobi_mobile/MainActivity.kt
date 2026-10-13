package com.xinobi.xinobi_mobile

import io.flutter.embedding.android.FlutterActivity
import android.app.Activity
import android.content.Intent
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private var imageResult: MethodChannel.Result? = null
    private val imageRequestCode = 1210

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "xinobi_u/file_picker")
            .setMethodCallHandler { call, result ->
                if (call.method != "pickImage") {
                    result.notImplemented()
                } else if (imageResult != null) {
                    result.error("picker_busy", "A picker is already open", null)
                } else {
                    imageResult = result
                    val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                        addCategory(Intent.CATEGORY_OPENABLE)
                        type = "image/*"
                        putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("image/jpeg", "image/png", "image/webp"))
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }
                    try {
                        startActivityForResult(intent, imageRequestCode)
                    } catch (error: android.content.ActivityNotFoundException) {
                        imageResult = null
                        result.error("picker_unavailable", "No image picker available", null)
                    }
                }
            }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == imageRequestCode) {
            val result = imageResult
            imageResult = null
            val uri = if (resultCode == Activity.RESULT_OK) data?.data else null
            result?.success(if (uri != null && uri.scheme == "content") listOf(uri.toString()) else emptyList<String>())
        } else {
            super.onActivityResult(requestCode, resultCode, data)
        }
    }

    override fun onDestroy() {
        imageResult?.success(emptyList<String>())
        imageResult = null
        super.onDestroy()
    }
}
