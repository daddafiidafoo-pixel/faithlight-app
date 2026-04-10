import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * seedChurches - Seed example churches into the database
 * Call this once to populate with sample data
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const churches = [
      {
        name: 'Grace Community Church',
        city: 'Toronto',
        country: 'Canada',
        latitude: 43.6629,
        longitude: -79.3957,
        pastor_name: 'Rev. David Chen',
        phone: '(416) 555-0123',
        website: 'gracecommunity.org',
        description: 'A vibrant faith community dedicated to biblical teaching and spiritual growth.',
        service_times: 'Sunday 9am & 11am, Wednesday 7pm',
        follower_count: 245
      },
      {
        name: 'Hope Baptist Church',
        city: 'Toronto',
        country: 'Canada',
        latitude: 43.6705,
        longitude: -79.3795,
        pastor_name: 'Pastor James Williams',
        phone: '(416) 555-0456',
        website: 'hopebaptist.com',
        description: 'Celebrating 50 years of service with a focus on community outreach and discipleship.',
        service_times: 'Sunday 10am & 6pm',
        follower_count: 189
      },
      {
        name: 'Redeemer Church',
        city: 'Mississauga',
        country: 'Canada',
        latitude: 43.5890,
        longitude: -79.6411,
        pastor_name: 'Rev. Michael Rodriguez',
        phone: '(905) 555-0789',
        website: 'redeemerchurch.ca',
        description: 'Modern worship with timeless biblical truths. Everyone is welcome.',
        service_times: 'Sunday 9am, 11am, 6pm',
        follower_count: 312
      },
      {
        name: 'Faith Assembly',
        city: 'Brampton',
        country: 'Canada',
        latitude: 43.7315,
        longitude: -79.7624,
        pastor_name: 'Apostle Sarah Johnson',
        phone: '(905) 555-1012',
        website: 'faithassembly.org',
        description: 'Experiencing God\'s presence through authentic worship and powerful preaching.',
        service_times: 'Sunday 10am, Friday 7:30pm',
        follower_count: 156
      },
      {
        name: 'Victory Church',
        city: 'Markham',
        country: 'Canada',
        latitude: 43.8509,
        longitude: -79.2711,
        pastor_name: 'Pastor Timothy Lee',
        phone: '(905) 555-3456',
        website: 'victorychurch.ca',
        description: 'Building disciples, transforming communities, celebrating diversity.',
        service_times: 'Sunday 9am & 11am (English & Mandarin)',
        follower_count: 278
      },
      {
        name: 'Bethel Covenant Church',
        city: 'Oakville',
        country: 'Canada',
        latitude: 43.4516,
        longitude: -79.2042,
        pastor_name: 'Rev. Patricia Okonkwo',
        phone: '(905) 555-7890',
        website: 'bethelcovenant.org',
        description: 'Committed to biblical truth, passionate prayer, and radical generosity.',
        service_times: 'Sunday 10am, Wednesday 6:30pm Bible Study',
        follower_count: 201
      },
      {
        name: 'Living Water Ministries',
        city: 'Hamilton',
        country: 'Canada',
        latitude: 43.2557,
        longitude: -79.8711,
        pastor_name: 'Pastor Kwame Asante',
        phone: '(905) 555-2468',
        website: 'livingwater.ca',
        description: 'A place of healing, hope, and spiritual renewal for all people.',
        service_times: 'Sunday 11am, Thursday 6pm Prayer Meeting',
        follower_count: 134
      }
    ];

    const created = [];
    for (const church of churches) {
      try {
        const newChurch = await base44.asServiceRole.entities.Church.create(church);
        created.push(newChurch.id);
      } catch (error) {
        console.warn(`Failed to create ${church.name}:`, error.message);
      }
    }

    console.log(`✓ Seeded ${created.length} churches`);
    return Response.json({ success: true, created_count: created.length, church_ids: created });
  } catch (error) {
    console.error('Seed churches error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});