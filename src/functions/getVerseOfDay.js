/* eslint-disable no-undef */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Try to fetch from database first
    const verses = await base44.asServiceRole.entities.VerseOfDay.filter({
      date: today,
    });

    if (verses.length > 0) {
      return Response.json(verses[0]);
    }

    // If not in database, return a default verse
    const defaultVerses = [
      {
        date: today,
        book_id: 'JHN',
        book_name: 'John',
        chapter: 3,
        verse_start: 16,
        verse_end: 16,
        reference: 'John 3:16',
        text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
        theme: 'Love',
        language: 'en',
      }
    ];

    return Response.json(defaultVerses[0]);
  } catch (error) {
    console.error('Error fetching verse of day:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});