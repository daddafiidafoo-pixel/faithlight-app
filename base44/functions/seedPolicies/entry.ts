import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const policies = [
      // Privacy Policy - English
      {
        policy_type: 'privacy_policy',
        lang: 'en',
        title: 'Privacy Policy',
        content: `<h1>Privacy Policy</h1>
<p>FaithLight ("we," "us," or "our") operates the FaithLight mobile application and website (the "Service").</p>

<h2>Information We Collect</h2>
<p>We collect information you provide directly, including:</p>
<ul>
<li>Account information (name, email, password)</li>
<li>Profile information (bio, location, interests)</li>
<li>Content you create (notes, highlights, study plans)</li>
<li>Communications you send through our platform</li>
</ul>

<h2>How We Use Your Information</h2>
<p>We use your information to:</p>
<ul>
<li>Provide, maintain, and improve the Service</li>
<li>Create and manage your account</li>
<li>Send you service-related announcements</li>
<li>Respond to your inquiries</li>
<li>Protect against fraud and abuse</li>
</ul>

<h2>Data Security</h2>
<p>We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>

<h2>Your Rights</h2>
<p>You can access, update, or delete your information at any time through your account settings. Contact us if you have questions about your data.</p>

<h2>Contact Us</h2>
<p>For privacy concerns, email: privacy@faithlight.com</p>`,
        version: '1.0'
      },

      // Privacy Policy - Oromo (Full)
      {
        policy_type: 'privacy_policy',
        lang: 'om',
        title: 'Imaammata Iccitii',
        content: `<h1>Imaammata Iccitii – FaithLight</h1>
<p><strong>Guyyaa hojiirra oole: Amajjii 2026</strong></p>

<p>FaithLight ("nutti", "keenya") iccitii fayyadamtoota kabaja. Imaammanni kun akkamitti odeeffannoo sitti wal qabate sassaabnu, itti fayyadamnu, fi eegu ibsa.</p>

<h2>1. Odeeffannoo Sassaabnu</h2>

<h3>1.1 Odeeffannoo Akaawuntii</h3>
<p>Yeroo galmaa'itu:</p>
<ul>
<li>Maqaa ykn maqaa fayyadamaa</li>
<li>Email</li>
<li>Suuraa (filannoo)</li>
<li>Afaan filatte</li>
<li>Gahee (user/admin)</li>
</ul>

<h3>1.2 Odeeffannoo Fayyadamaa</h3>
<ul>
<li>Tarkaanfii dubbisaa Kitaaba Qulqulluu</li>
<li>Karoora barnootaa hordofuu</li>
<li>Qormaata (quiz) bu'aa</li>
<li>Qabiyyee ati maxxansite</li>
</ul>

<h3>1.3 Odeeffannoo Sirnaa</h3>
<ul>
<li>Gosa meeshaa (device)</li>
<li>Version app</li>
<li>Odeeffannoo dogoggoraa (error logs)</li>
</ul>

<p><strong>Nutis:</strong></p>
<ul>
<li>❌ Odeeffannoo kee hin gurgurru</li>
<li>❌ Iccitii kee hin dabarsinu seeraan alatti</li>
</ul>

<h2>2. Akkamitti Odeeffannoo Kee Fayyadamnu</h2>
<ul>
<li>Tajaajila siif kennuuf</li>
<li>Muuxannoo kee dhuunfachuuf</li>
<li>Sirna fooyyessuuf</li>
<li>Nageenya mirkaneessuuf</li>
<li>Qabiyyee hin malle to'achuuf</li>
</ul>

<h2>3. AI Fayyadama</h2>
<p>FaithLight AI fayyadama. Beekaa:</p>
<ul>
<li>Deebiin AI dogoggora qabaachuu danda'a</li>
<li>Yaada AI Kitaaba Qulqulluu irratti mirkaneessi</li>
<li>AI'n yaada yaalii fayyaa ykn seeraa hin kennu</li>
</ul>

<h2>4. Qabiyyee Fayyadamaa (User Content)</h2>
<p>Ati qabiyyee maxxansite:</p>
<ul>
<li>Maqaa kee waliin mul'achuu danda'a</li>
<li>To'annoo jalatti ta'a</li>
<li>Seera cabsu yoo ta'e haqamuu danda'a</li>
</ul>

<h2>5. Iccitii Daa'immanii</h2>
<p>FaithLight daa'imman waggaa 13 gadiif hin qophaa'in. Daa'ima taanaan, hayyama maatii barbaachisa.</p>

<h2>6. Haquu Akaawuntii</h2>
<p>Yeroo barbaadde:</p>
<ul>
<li>Akaawuntii kee haquu dandeessa</li>
<li>Odeeffannoon kee sirnaan haqama (kan barbaachisu qofatu hafu)</li>
</ul>

<h2>7. Jijjiirama Imaammata</h2>
<p>Imaammanni kun yeroo gara yerootti jijjiiramuu danda'a. Jijjiiramni app keessatti ibsama.</p>

<h2>Qunnami</h2>
<p>Gaaffii yoo qabaatte: privacy@faithlight.com</p>`,
        version: '1.0'
      },

      // Terms of Service - English
      {
        policy_type: 'terms_of_service',
        lang: 'en',
        title: 'Terms of Service',
        content: `<h1>Terms of Service</h1>
<p>By accessing and using FaithLight, you accept and agree to be bound by the terms and provision of this agreement.</p>

<h2>User Responsibilities</h2>
<p>You agree to:</p>
<ul>
<li>Use the Service only for lawful purposes</li>
<li>Not post content that is harmful, abusive, or offensive</li>
<li>Respect the intellectual property rights of others</li>
<li>Respect other users and community members</li>
</ul>

<h2>AI Disclaimer</h2>
<p>FaithLight uses AI to generate content including devotionals, quizzes, and study materials. While we strive for accuracy:</p>
<ul>
<li>AI responses may contain errors or inaccuracies</li>
<li>Always verify critical information with Scripture</li>
<li>Do not rely solely on AI for theological or doctrinal guidance</li>
</ul>

<h2>Account Termination</h2>
<p>We reserve the right to terminate your account if you violate these terms or engage in harmful behavior.</p>

<h2>Changes to Terms</h2>
<p>We may update these terms at any time. Continued use of the Service constitutes acceptance of new terms.</p>`,
        version: '1.0'
      },

      // Terms of Service - Oromo (Full)
      {
        policy_type: 'terms_of_service',
        lang: 'om',
        title: 'Haala Tajaajilaa',
        content: `<h1>Haala Tajaajilaa – FaithLight</h1>

<p>FaithLight fayyadamuun, seerota kana ni walii galla:</p>

<h2>1. Kaayyoo App</h2>
<p>FaithLight kenna:</p>
<ul>
<li>Dubbisaa Kitaaba Qulqulluu</li>
<li>AI barnootaa</li>
<li>Karoora hoggansa kiristaanaa</li>
<li>Qormaata fi gareewwan</li>
</ul>
<p>App kun barnootaa fi guddina amantii qofaaf.</p>

<h2>2. Dirqama Fayyadamaa</h2>
<p>Ati dirqama qabda:</p>
<ul>
<li>Odeeffannoo sirrii kennuu</li>
<li>Namoota kabajuu</li>
<li>Qabiyyee miidhaa hin maxxansin</li>
<li>Siyaasa filannoo hin beeksisin</li>
<li>Jibbaa ykn doorsisa hin babal'isin</li>
</ul>

<h2>3. AI Daangaa</h2>
<ul>
<li>AI'n sirrii ta'uu hin mirkaneessu</li>
<li>Yaada fayyaa, seeraa, ykn siyaasa hin kennu</li>
<li>Kitaaba Qulqulluu irratti mirkaneessi</li>
</ul>

<h2>4. Karoora Leenjii fi Ragaa</h2>
<p>Ragaan xumura barnootaa:</p>
<ul>
<li>Leenjii keessaa qofa</li>
<li>Mootummaa ykn dhaabbata seeraa irraa beekamtii hin mirkaneessu (yoo ibsame malee)</li>
</ul>

<h2>5. Akaawuntii Cufuu</h2>
<p>Seerota kana yoo cabsite:</p>
<ul>
<li>Akaawuntiin kee cufamuu danda'a</li>
<li>Qabiyyeen kee haqamuu danda'a</li>
</ul>

<h2>6. Jijjiirama Haala</h2>
<p>Haalanni kun yeroo gara yerootti jijjiiramuu danda'a. Jijjiiramni app keessatti ibsama.</p>

<h2>Qunnami</h2>
<p>Gaaffii yoo qabaatte: terms@faithlight.com</p>`,
        version: '1.0'
      },

      // App Store Description - English
      {
        policy_type: 'app_store_description',
        lang: 'en',
        title: 'App Store Description',
        content: `FaithLight - World-Class Bible Learning

📖 Read the Bible - Access multiple translations online and offline
🎧 Listen to Audio - Hear the Bible in high-quality audio
🤖 Study with AI - Get personalized devotionals, quizzes, and lessons
👥 Discuss in Groups - Join Bible study groups and prayer communities
🧠 Take Quizzes - Test your knowledge with interactive Bible quizzes
📚 Create Study Plans - Build custom reading plans
🎯 Track Progress - Monitor your spiritual growth

AI-Powered Features:
- Personalized devotionals on any Scripture
- Interactive Bible quizzes
- Sermon preparation assistance
- Study guides and summaries

Offline Support:
- Download chapters and books for offline reading
- Study without internet connection
- Sync changes when online

Grow your faith with FaithLight - Where Scripture meets innovation.

"Your word is a lamp to my feet and a light to my path." - Psalm 119:105`,
        version: '1.0'
      },

      // App Store Description - Oromo
      {
        policy_type: 'app_store_description',
        lang: 'om',
        title: 'Ibsa Stores iApp',
        content: `FaithLight – Barnoota Kitaaba Qulqulluu Addunyaa Guutuu

📖 Kitaaba Qulqulluu Dubbisi - Hiikkaawwan baay'ee online fi offline
🎧 Sagalee Dhaggeeffadhu - Sagalee QMH fayyadami
🤖 AI Waliin Baradhu - Cimsannaa, quiz, fi barnoota dhuunfaa
👥 Gareewwan Keessatti Mari'adhu - Garee barnoota fi kadhiicha seeni
🧠 Quiz Dorgomi - Beekumsa kee quiz walwal-xiinxalinaa irratti qori
📚 Karooraa Uumi - Karoora dubbisaa dhuunfaa uumi
🎯 Tarkaanfii Qori - Guddina amantii kee sakatta'i

Midhaa AI:
- Cimsannaa dhuunfaa Lakkoofsa Kitaabaa irratti
- Quiz walwal-xiinxalinaa
- Gargaarsa sagalee hojjedhu
- Qajeela fi guddina

Deeggarsi Offline:
- Boqonnaa fi kitaaba offline duwwaad
- Kallattiiwwan hin barbaachisiinee baradi
- Yommuu online ta\'etti wal-walqabsiif

Amantii kee FaithLight irraa guddisi – Bakka Lakkoofsa Kitaabaa fi salphinaa walitti argaman.

"Dubbiin kee ibsa miillaa koo ti fi ifa daddarbaa koo." - Psaalmii 119:105`,
        version: '1.0'
      }
    ];

    // Bulk create policies
    const result = await base44.asServiceRole.entities.PolicyContent.bulkCreate(policies);

    return Response.json({ 
      success: true, 
      created: result.length,
      message: `Seeded ${result.length} policy documents (Privacy Policy, Terms of Service, App Store Description in English + Oromo)` 
    });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});