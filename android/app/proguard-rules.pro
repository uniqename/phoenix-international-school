# ────────────────────────────────────────────────────────────────────
# Phoenix International School — ProGuard / R8 rules
# Enables minifyEnabled + shrinkResources so Play Console gets a
# deobfuscation file (mapping.txt) bundled with every AAB.
# ────────────────────────────────────────────────────────────────────

# Keep crash-report-friendly metadata
-keepattributes SourceFile,LineNumberTable
-keepattributes Signature,InnerClasses,EnclosingMethod
-keepattributes *Annotation*
-keepattributes Exceptions

# Hide original source file name in stack traces (mapping.txt covers it)
-renamesourcefileattribute SourceFile

# ── Capacitor framework — uses reflection from JS bridge ──
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-keep enum com.getcapacitor.** { *; }
-keep class com.capacitorjs.** { *; }

# Keep classes annotated as Capacitor plugins
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod <methods>;
}

# Keep our MainActivity + Application class
-keep public class gh.edu.phoenixintlschool.** { *; }

# AndroidX + Material — keep generally
-keep class androidx.** { *; }
-keep interface androidx.** { *; }
-dontwarn androidx.**

# WebView with JS interface (Capacitor bridge)
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class * implements android.os.Parcelable {
    public static final ** CREATOR;
}

# Enum values() / valueOf() are accessed reflectively
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Suppress noisy warnings from third-party libs that don't affect runtime
-dontwarn java.lang.invoke.**
-dontwarn javax.annotation.**
-dontwarn org.slf4j.**

# Strip verbose logging from release builds (keeps Log.w / Log.e)
-assumenosideeffects class android.util.Log {
    public static *** v(...);
    public static *** d(...);
    public static *** i(...);
}
