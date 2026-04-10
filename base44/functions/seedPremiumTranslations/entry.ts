import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Check if already seeded
    const existing = await base44.asServiceRole.entities.LocaleStrings.filter(
      { key: 'premium.upgrade' },
      '-created_date',
      1
    );

    if (existing && existing.length > 0) {
      console.log('Premium translations already seeded');
      return Response.json({ message: 'Already seeded', count: 0 });
    }

    const translations = [
      // premium.upgrade
      { key: 'premium.upgrade', lang: 'en', value: 'Upgrade to Premium', category: 'buttons' },
      { key: 'premium.upgrade', lang: 'om', value: 'Premium ta\'i', category: 'buttons' },

      // premium.processing
      { key: 'premium.processing', lang: 'en', value: 'Processing your subscription…', category: 'common' },
      { key: 'premium.processing', lang: 'om', value: 'Galmeen kee hojjetamaa jira…', category: 'common' },

      // premium.active
      { key: 'premium.active', lang: 'en', value: 'Premium Active', category: 'common' },
      { key: 'premium.active', lang: 'om', value: 'Premium Hojii irra jira', category: 'common' },

      // premium.expired
      { key: 'premium.expired', lang: 'en', value: 'Subscription expired', category: 'common' },
      { key: 'premium.expired', lang: 'om', value: 'Galmeen kee xumurameera', category: 'common' },

      // premium.renewalDate
      { key: 'premium.renewalDate', lang: 'en', value: 'Renews on', category: 'common' },
      { key: 'premium.renewalDate', lang: 'om', value: 'Irra deebi\'ee haaromsa', category: 'common' },

      // premium.features
      { key: 'premium.features', lang: 'en', value: 'Premium Features', category: 'pages' },
      { key: 'premium.features', lang: 'om', value: 'Dandeettoo Premium', category: 'pages' },

      // premium.monthly
      { key: 'premium.monthly', lang: 'en', value: 'Monthly', category: 'common' },
      { key: 'premium.monthly', lang: 'om', value: 'Jidha Jidhaddu', category: 'common' },

      // premium.yearly
      { key: 'premium.yearly', lang: 'en', value: 'Yearly', category: 'common' },
      { key: 'premium.yearly', lang: 'om', value: 'Waggaa Tokkoo', category: 'common' },

      // premium.savings
      { key: 'premium.savings', lang: 'en', value: '17% savings', category: 'common' },
      { key: 'premium.savings', lang: 'om', value: '17% kaasaa', category: 'common' },

      // premium.upgradeNow
      { key: 'premium.upgradeNow', lang: 'en', value: 'Upgrade Now', category: 'buttons' },
      { key: 'premium.upgradeNow', lang: 'om', value: 'Gaaffi Harmaataa', category: 'buttons' },

      // premium.feature.aiPlans
      { key: 'premium.feature.aiPlans', lang: 'en', value: 'Advanced AI Study Plans', category: 'common' },
      { key: 'premium.feature.aiPlans', lang: 'om', value: 'Barnoota AI Guddina', category: 'common' },

      // premium.feature.devotionals
      { key: 'premium.feature.devotionals', lang: 'en', value: 'Unlimited Devotionals', category: 'common' },
      { key: 'premium.feature.devotionals', lang: 'om', value: 'Sodaachii Walii Qabamee', category: 'common' },

      // premium.feature.sermonBuilder
      { key: 'premium.feature.sermonBuilder', lang: 'en', value: 'Premium Sermon Builder', category: 'common' },
      { key: 'premium.feature.sermonBuilder', lang: 'om', value: 'Handhura Ibsa Premium', category: 'common' },

      // premium.feature.offline
      { key: 'premium.feature.offline', lang: 'en', value: 'Offline Content Access', category: 'common' },
      { key: 'premium.feature.offline', lang: 'om', value: 'Qabiyyeesa Offline', category: 'common' },

      // premium.feature.reports
      { key: 'premium.feature.reports', lang: 'en', value: 'Group Summary Reports', category: 'common' },
      { key: 'premium.feature.reports', lang: 'om', value: 'Gaaffi Garee ta\'aa', category: 'common' },

      // premium.feature.support
      { key: 'premium.feature.support', lang: 'en', value: 'Priority Support', category: 'common' },
      { key: 'premium.feature.support', lang: 'om', value: 'Gargaarsa Murteessaa', category: 'common' },
    ];

    // Create translations in bulk
    const created = await base44.asServiceRole.entities.LocaleStrings.bulkCreate(translations);

    console.log(`Created ${created.length} premium translations`);

    return Response.json({
      message: 'Premium translations seeded successfully',
      count: created.length,
    });
  } catch (error) {
    console.error('Error seeding premium translations:', error.message);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});