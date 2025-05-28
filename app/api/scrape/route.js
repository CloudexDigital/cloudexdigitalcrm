// File: app/api/scrape/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';
import puppeteer from 'puppeteer';

const FSQ_KEY = process.env.FOURSQUARE_API_KEY;
let dailyCounts = {};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const radius  = parseInt(searchParams.get('radius') || '1000', 10);
    if (!address) {
      return NextResponse.json({ error: 'Missing address' }, { status: 400 });
    }

    // 1) Geocode
    const nom = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: address, format: 'json', limit: 1 }
    });
    if (!nom.data.length) {
      return NextResponse.json({ error: 'Unable to geocode' }, { status: 400 });
    }
    const { lat, lon } = nom.data[0];

    // 2) Foursquare search
    const searchRes = await axios.get('https://api.foursquare.com/v3/places/search', {
      params: { ll: `${lat},${lon}`, radius, limit: 50 },
      headers: { Authorization: FSQ_KEY }
    });
    const venues = searchRes.data.results || [];

    // 3) Enrich + fallback-scrape
    const enriched = await Promise.all(
      venues.map(async (v) => {
        // call Foursquare details API first
        let detail = {};
        try {
          const det = await axios.get(`https://api.foursquare.com/v3/places/${v.fsq_id}`, {
            headers: { Authorization: FSQ_KEY },
            params: { fields: 'tel,website,rating,stats' }
          });
          detail = det.data;
        } catch (_) {}

        let { tel, website, rating, stats } = detail;
        let reviews = stats?.total_ratings ?? null;

        // **FALLBACK**: if no phone or website, scrape the Foursquare **web** page
        if ((!tel || !website)) {
          try {
            const browser = await puppeteer.launch({
              args: ['--no-sandbox','--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setUserAgent(
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
              'AppleWebKit/537.36 (KHTML, like Gecko) ' +
              'Chrome/114.0.0.0 Safari/537.36'
            );
            // navigate to the venue’s public page
            await page.goto(`https://foursquare.com/v/${v.fsq_id}`, {
              waitUntil: 'domcontentloaded',
              timeout: 30000
            });
            // extract phone & website from the sidebar
            const data = await page.evaluate(() => {
              const phoneEl   = document.querySelector('.VenueSidebar .venue-contactItem--phone a');
              const webEl     = document.querySelector('.VenueSidebar .venue-contactItem--external a');
              return {
                phone: phoneEl?.textContent.trim()   || null,
                website: webEl?.href                 || null
              };
            });
            await browser.close();
            // override only if we didn’t get them from API
            tel     = tel     || data.phone;
            website = website || data.website;
          } catch (e) {
            console.warn(`Web scrape failed for ${v.fsq_id}:`, e.message);
          }
        }

        return {
          name:    v.name,
          address: v.location?.formatted_address || null,
          phone:   tel      || null,
          website: website  || null,
          rating:  rating   != null ? rating : null,
          reviews: reviews
        };
      })
    );

    // 4) Counter
    const today = new Date().toISOString().slice(0,10);
    dailyCounts[today] = (dailyCounts[today]||0) + 1;

    return NextResponse.json({ count: dailyCounts[today], results: enriched });
  } catch (err) {
    console.error('/api/scrape error:', err.stack||err);
    return NextResponse.json({ error: err.message||'Unknown' }, { status: 500 });
  }
}
