import React, { useState } from 'react';
import { Smartphone, Apple, ChevronDown, ChevronRight, CheckCircle, AlertTriangle, Info, Package, Upload, Shield, Play, Terminal } from 'lucide-react';

const Section = ({ number, title, children, done, onToggle, open }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-3">
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 p-4 text-left"
    >
      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
        {number}
      </div>
      <span className="flex-1 font-semibold text-gray-900 text-sm">{title}</span>
      {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
    </button>
    {open && <div className="px-4 pb-4 border-t border-gray-50 pt-3">{children}</div>}
  </div>
);

const CodeBlock = ({ code }) => (
  <div className="bg-gray-900 text-green-400 rounded-xl px-4 py-3 font-mono text-xs my-2 whitespace-pre overflow-x-auto leading-relaxed">
    {code}
  </div>
);

const Note = ({ type = 'info', children }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warn: 'bg-amber-50 border-amber-200 text-amber-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };
  const icons = { info: Info, warn: AlertTriangle, danger: AlertTriangle, success: CheckCircle };
  const Icon = icons[type];
  return (
    <div className={`flex gap-2 border rounded-xl p-3 mt-2 text-sm ${styles[type]}`}>
      <Icon size={15} className="flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
};

const Checklist = ({ items }) => (
  <ul className="space-y-1.5 mt-2">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
        <CheckCircle size={13} className="text-indigo-400 flex-shrink-0 mt-0.5" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

// ─── CAPACITOR SETUP STEPS ───────────────────────────────────────────────────

const CAPACITOR_STEPS = [
  {
    title: 'Install Capacitor core + CLI',
    content: () => (
      <>
        <p className="text-sm text-gray-600 mb-2">Run in your project root (this is a Vite app — <code className="bg-gray-100 px-1 rounded">dist/</code> is the output folder):</p>
        <CodeBlock code={`npm install @capacitor/core @capacitor/cli`} />
        <CodeBlock code={`npx cap init FaithLight com.faithlight.app --web-dir=dist`} />
        <Note type="info">Use <strong>--web-dir=dist</strong> because FaithLight uses Vite. CRA apps use <code>build</code> instead.</Note>
      </>
    ),
  },
  {
    title: 'Install iOS and Android platforms',
    content: () => (
      <>
        <CodeBlock code={`npm install @capacitor/ios @capacitor/android`} />
      </>
    ),
  },
  {
    title: 'Build the web app',
    content: () => (
      <>
        <p className="text-sm text-gray-600 mb-2">Capacitor needs a production build to copy into the native shell:</p>
        <CodeBlock code={`npm run build`} />
        <p className="text-sm text-gray-500 mt-1">This creates the <code className="bg-gray-100 px-1 rounded">dist/</code> folder.</p>
      </>
    ),
  },
  {
    title: 'Add native platforms',
    content: () => (
      <>
        <p className="text-sm text-gray-600 mb-2">Only needed once:</p>
        <CodeBlock code={`npx cap add android\nnpx cap add ios`} />
        <p className="text-sm text-gray-500 mt-1">This creates the <code className="bg-gray-100 px-1 rounded">android/</code> and <code className="bg-gray-100 px-1 rounded">ios/</code> folders.</p>
      </>
    ),
  },
  {
    title: 'Sync web assets into native projects',
    content: () => (
      <>
        <CodeBlock code={`npx cap sync`} />
        <Note type="info">Run this after every <code>npm run build</code>. It copies your built web bundle into both iOS and Android native projects.</Note>
      </>
    ),
  },
  {
    title: 'Use this exact capacitor.config.ts',
    content: () => (
      <>
        <p className="text-sm text-gray-600 mb-2">Replace your <code className="bg-gray-100 px-1 rounded">capacitor.config.ts</code> with:</p>
        <CodeBlock code={`import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.faithlight.app',
  appName: 'FaithLight',
  webDir: 'dist',
  bundledWebRuntime: false,
};

export default config;`} />
      </>
    ),
  },
  {
    title: 'Open native projects',
    content: () => (
      <>
        <p className="text-sm text-gray-600 mb-2">Open Android Studio:</p>
        <CodeBlock code={`npx cap open android`} />
        <p className="text-sm text-gray-600 mb-2 mt-2">Open Xcode:</p>
        <CodeBlock code={`npx cap open ios`} />
        <Note type="success">Start with Android — it's easier to iterate. Move to iOS once Android is stable.</Note>
      </>
    ),
  },
  {
    title: 'Expected folder structure after setup',
    content: () => (
      <>
        <CodeBlock code={`FaithLight/
├─ src/
├─ public/
├─ dist/           ← Vite build output
├─ android/        ← Capacitor native project
├─ ios/            ← Capacitor native project
├─ package.json
├─ capacitor.config.ts
└─ vite.config.ts`} />
      </>
    ),
  },
  {
    title: 'Your everyday workflow after each code change',
    content: () => (
      <>
        <p className="text-sm text-gray-600 mb-2">Every time you update the web app, run:</p>
        <CodeBlock code={`npm run build\nnpx cap sync`} />
        <p className="text-sm text-gray-600 mt-2">Then reopen or rerun the native app in Android Studio or Xcode.</p>
        <Note type="warn">
          FaithLight uses <strong>audio, offline storage, API calls, and language switching</strong> — test all of these again inside the native shell after Capacitor setup. WebView behavior can differ from the browser.
        </Note>
      </>
    ),
  },
  {
    title: 'Recommended setup sequence (copy-paste ready)',
    content: () => (
      <>
        <p className="text-sm text-gray-600 mb-2">Run these in order from your project root:</p>
        <CodeBlock code={`npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init FaithLight com.faithlight.app --web-dir=dist
npm run build
npx cap add android
npx cap add ios
npx cap sync
npx cap open android`} />
        <Note type="success">Start with Android. Test Android fully before opening iOS.</Note>
      </>
    ),
  },
];

// ─── PREPARE STEPS ───────────────────────────────────────────────────────────

const PREPARE_STEPS = [
  {
    title: 'Fix broken states before packaging',
    content: () => (
      <>
        <p className="text-sm text-gray-600 mb-2">These must be resolved before any store submission. Bad reviews come fast.</p>
        <Checklist items={[
          'No raw API error messages shown to users (wrap in friendly fallback UI)',
          'Broken Bible / audio states show a clear "unavailable" message',
          'Unsupported Bible languages (Oromo, Amharic) show a clear fallback — not a blank screen or console error',
          'Offline download UI only appears when real offline data is available',
          'Audio unavailable state is friendly (not silent failure)',
        ]} />
        <Note type="danger">If you publish with broken Oromo/Amharic Bible or audio behavior, reviews will hurt you fast.</Note>
      </>
    ),
  },
  {
    title: 'App icon',
    content: () => (
      <>
        <Checklist items={[
          'iOS: 1024×1024 PNG, no transparency, no rounded corners (Apple applies them)',
          'Android: Adaptive icon — foreground layer + background layer, 108×108dp safe zone',
          'Place iOS icon in ios/App/App/Assets.xcassets/AppIcon.appiconset/',
          'Place Android icon in android/app/src/main/res/mipmap-*/',
          'Or use: npx @capacitor/assets generate (auto-generates all sizes from one source image)',
        ]} />
        <Note type="info">Use <strong>npx @capacitor/assets generate</strong> — it generates all required sizes for both platforms from a single 1024×1024 source file.</Note>
      </>
    ),
  },
  {
    title: 'Splash screen',
    content: () => (
      <>
        <Checklist items={[
          'Install: npm install @capacitor/splash-screen',
          'Add a splash image (2732×2732px recommended, centered content in 1200×1200 safe zone)',
          'Run: npx @capacitor/assets generate to auto-generate splash sizes',
          'Configure background color in capacitor.config: SplashScreen.backgroundColor',
          'Run npx cap sync after changes',
        ]} />
        <CodeBlock code={`// capacitor.config.ts\nplugins: {\n  SplashScreen: {\n    launchShowDuration: 2000,\n    backgroundColor: '#6C5CE7',\n    showSpinner: false,\n  }\n}`} />
      </>
    ),
  },
  {
    title: 'Privacy policy page',
    content: () => (
      <>
        <p className="text-sm text-gray-600 mb-2">Both stores require a privacy policy URL. FaithLight collects user data (auth, prayer requests, reading history) so this is mandatory.</p>
        <Checklist items={[
          'Create a /PrivacyPolicy page in your app (already exists)',
          'Host it at a public URL (your published app URL + /PrivacyPolicy)',
          'Include: what data you collect, how it is used, third-party services (Stripe, BibleBrain, AI)',
          'Provide a support email',
          'Link it from the app Settings or About page',
        ]} />
        <Note type="warn">Apple will reject your app without a valid, accessible privacy policy URL in App Store Connect.</Note>
      </>
    ),
  },
  {
    title: 'Working navigation',
    content: () => (
      <>
        <p className="text-sm text-gray-600 mb-2">Test every nav path in the native shell (not just the browser):</p>
        <Checklist items={[
          'Bottom tabs all navigate correctly',
          'Back button (Android hardware back) works as expected',
          'Deep links or direct URL routes do not 404 in native shell',
          'No broken routes or infinite loading states',
          'Settings, About, Privacy Policy all reachable',
        ]} />
        <Note type="info">Capacitor uses a WebView — Android hardware back button triggers browser history back by default. Test this carefully.</Note>
      </>
    ),
  },
];

// ─── ANDROID STEPS ───────────────────────────────────────────────────────────

const ANDROID_STEPS = [
  {
    title: 'Open the native Android project',
    content: () => (
      <>
        <p className="text-sm text-gray-600 mb-2">Run this command — Capacitor will open Android Studio automatically:</p>
        <CodeBlock code="npx cap open android" />
      </>
    ),
  },
  {
    title: 'Let Android Studio finish setup',
    content: () => (
      <>
        <p className="text-sm text-gray-600 mb-1">When Android Studio opens:</p>
        <Checklist items={[
          'Wait for Gradle sync to finish',
          'Install any missing SDK components if prompted',
          'Requires API 24+ (Android 7.0) or higher',
        ]} />
      </>
    ),
  },
  {
    title: 'Run on a device first',
    content: () => (
      <>
        <Checklist items={[
          'Connect an Android phone with USB debugging enabled, OR start an emulator',
          'Click the Run ▶ button in Android Studio',
        ]} />
        <Note type="warn">Test on a real device — WebView behavior for audio and storage can differ from browser.</Note>
      </>
    ),
  },
  {
    title: 'Set the app identity',
    content: () => (
      <>
        <p className="text-sm text-gray-600 mb-1">Confirm before building release:</p>
        <Checklist items={[
          'App name',
          'Package name (e.g. com.faithlight.app)',
          'Version code (integer, increment each release)',
          'Version name (user-facing, e.g. 1.0.0)',
        ]} />
        <Note type="warn">Set identity before uploading — Play Console requires it to match your production target.</Note>
      </>
    ),
  },
  {
    title: 'Test the critical flows on device',
    content: () => (
      <>
        <p className="text-sm text-gray-600 mb-1">Before building release, test all of:</p>
        <Checklist items={[
          'App startup',
          'Language switching',
          'Bible loading',
          'Audio playback',
          'Offline storage / downloads',
          'AI Tutor',
        ]} />
      </>
    ),
  },
  {
    title: 'Build the release bundle',
    content: () => (
      <>
        <p className="text-sm text-gray-600 mb-2">In Android Studio:</p>
        <div className="bg-gray-50 rounded-xl p-3 text-sm font-mono text-gray-700 leading-relaxed">
          Build → Generate Signed Bundle / APK
        </div>
        <Checklist items={[
          'Choose Android App Bundle (.aab)',
          'Create a new keystore if you don\'t have one',
          'Save the keystore file somewhere safe',
          'Choose Release build variant',
        ]} />
      </>
    ),
  },
  {
    title: 'Keep the keystore safe',
    content: () => (
      <>
        <Note type="danger">You CANNOT update your app on Play Store without this. Back it up now.</Note>
        <Checklist items={[
          'Keystore file (.jks or .keystore)',
          'Keystore password',
          'Key alias',
          'Key password',
        ]} />
      </>
    ),
  },
  {
    title: 'Upload to Google Play Console',
    content: () => (
      <>
        <Checklist items={[
          'Create app in Play Console',
          'Upload the .aab file to Internal testing track first',
          'Fill in store listing, screenshots, privacy policy',
        ]} />
        <Note type="success">Use Internal → Closed → Production. Do not go straight to production.</Note>
      </>
    ),
  },
];

// ─── IOS STEPS ───────────────────────────────────────────────────────────────

const IOS_STEPS = [
  {
    title: 'Open the native iOS project',
    content: () => (
      <>
        <CodeBlock code="npx cap open ios" />
        <p className="text-sm text-gray-600">Capacitor opens the Xcode workspace.</p>
      </>
    ),
  },
  {
    title: 'Let Xcode finish loading',
    content: () => (
      <Checklist items={[
        'Wait for package indexing to finish',
        'Check for any signing warnings',
      ]} />
    ),
  },
  {
    title: 'Set signing',
    content: () => (
      <>
        <p className="text-sm text-gray-600 mb-1">In Xcode:</p>
        <Checklist items={[
          'Click the project → select App target',
          'Open Signing & Capabilities tab',
          'Choose your Apple Developer team',
          'Enable automatic signing',
          'Confirm bundle identifier is unique (e.g. com.faithlight.app)',
        ]} />
      </>
    ),
  },
  {
    title: 'Set version and build number',
    content: () => (
      <Checklist items={[
        'Version → user-facing version e.g. 1.0.0',
        'Build → internal number e.g. 1 (must increment each upload)',
      ]} />
    ),
  },
  {
    title: 'Run on an iPhone first',
    content: () => (
      <>
        <Checklist items={[
          'Choose a simulator or a real iPhone connected to Mac',
          'Click Run ▶ in Xcode',
        ]} />
        <Note type="warn">iOS WebView may behave differently — especially for audio and offline storage.</Note>
      </>
    ),
  },
  {
    title: 'Test the critical flows on iPhone',
    content: () => (
      <Checklist items={[
        'Startup',
        'Bible pages',
        'Audio playback',
        'Offline mode',
        'Language switching',
        'AI Tutor',
      ]} />
    ),
  },
  {
    title: 'Archive the app',
    content: () => (
      <>
        <p className="text-sm text-gray-600 mb-2">Once testing passes:</p>
        <div className="bg-gray-50 rounded-xl p-3 text-sm font-mono text-gray-700">
          Product → Archive
        </div>
        <Note type="info">You must select "Any iOS Device" or a real device target before archiving — not a simulator.</Note>
      </>
    ),
  },
  {
    title: 'Upload to App Store Connect',
    content: () => (
      <Checklist items={[
        'Open Organizer (Window → Organizer)',
        'Select the archive',
        'Choose Distribute App',
        'Upload to App Store Connect',
      ]} />
    ),
  },
  {
    title: 'Use TestFlight first',
    content: () => (
      <>
        <Checklist items={[
          'Open App Store Connect',
          'Create the app record if not yet done',
          'Assign the build to TestFlight',
          'Test before public submission',
        ]} />
        <Note type="success">TestFlight → App Store. Never skip TestFlight for FaithLight — audio and offline edge cases matter.</Note>
      </>
    ),
  },
  {
    title: 'Apple deadline: April 28, 2026',
    content: () => (
      <Note type="danger">
        Starting April 28 2026, apps uploaded to App Store Connect must meet updated minimum build requirements (newer Xcode/SDK). Build and upload before this date or ensure your Xcode is up to date.
      </Note>
    ),
  },
];

const PRE_UPLOAD_CHECKLIST = [
  'App icon (1024×1024 for iOS, adaptive icon for Android)',
  'Screenshots for all required device sizes',
  'App description (short + long)',
  'Privacy policy URL',
  'Support email',
  'Version number',
  'Category selection',
  'Age / content rating answers',
  'Unsupported Bible languages show a clear fallback message',
  'Raw 404/500 errors are hidden from users',
  'Offline download shows friendly unavailable state when not real',
  'Audio unavailable state is friendly',
];

const TABS = [
  { id: 'capacitor', label: 'Capacitor Setup', icon: Terminal },
  { id: 'prepare', label: 'Prepare', icon: Package },
  { id: 'android', label: 'Android', icon: Play },
  { id: 'ios', label: 'iOS', icon: Apple },
];

export default function MobileDeployGuide() {
  const [platform, setPlatform] = useState('capacitor');
  const [openSteps, setOpenSteps] = useState({ 0: true });

  const toggle = (i) => setOpenSteps(s => ({ ...s, [i]: !s[i] }));

  const stepsMap = {
    capacitor: CAPACITOR_STEPS,
    android: ANDROID_STEPS,
    ios: IOS_STEPS,
    prepare: PREPARE_STEPS,
  };
  const steps = stepsMap[platform];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Smartphone size={20} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Mobile Deployment</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">Step-by-step guide for Android & iOS store release</p>

        {/* Launch order callout */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-6">
          <p className="text-sm font-bold text-indigo-800 mb-2">✅ Recommended Launch Order for FaithLight</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Capacitor setup',
              'Android device test',
              'Android internal track',
              'iPhone device test',
              'TestFlight',
              'Public release',
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{i + 1}</span>
                <span className="text-xs text-indigo-700 font-medium">{s}</span>
                {i < 5 && <ChevronRight size={10} className="text-indigo-300" />}
              </div>
            ))}
          </div>
        </div>

        {/* Platform toggle */}
        <div className="flex bg-white border border-gray-200 rounded-2xl p-1 mb-5 gap-1 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setPlatform(id); setOpenSteps({ 0: true }); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap min-w-[80px] ${platform === id ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* Steps */}
        {steps.map((step, i) => (
          <Section
            key={`${platform}-${i}`}
            number={i + 1}
            title={step.title}
            open={!!openSteps[i]}
            onToggle={() => toggle(i)}
          >
            {step.content()}
          </Section>
        ))}

        {/* Pre-upload checklist */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className="text-indigo-600" />
            <h2 className="font-bold text-gray-900">Pre-Upload Checklist</h2>
            <span className="text-xs text-gray-400">Both stores</span>
          </div>
          <Checklist items={PRE_UPLOAD_CHECKLIST} />
        </div>
      </div>
    </div>
  );
}