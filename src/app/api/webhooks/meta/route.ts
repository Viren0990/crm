import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Use environment variables for tokens. 
// Fallback for verification token if not set in .env yet.
const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'my_custom_meta_secret';

// 1. Webhook Verification 
// Meta sends a GET request here when you click "Verify and Save" in the App Dashboard
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === META_VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse('Forbidden', { status: 403 });
  }
}

// 2. Receiving Lead Data 
// Meta sends a POST request here when someone submits a Lead Ad form
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Make sure it's an event from a Page
    if (body.object === 'page') {
      
      // There can be multiple entries if batched
      for (const entry of body.entry) {
        
        // There can be multiple changes
        for (const change of entry.changes) {
          
          // Check if it's a leadgen event
          if (change.field === 'leadgen') {
            const leadgenId = change.value.leadgen_id;
            
            if (!leadgenId) continue;

            const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
            if (!META_ACCESS_TOKEN) {
              console.error('Missing META_ACCESS_TOKEN in environment variables.');
              // We return 200 to Facebook so they stop retrying, but we log the error.
              continue;
            }

            // Fetch the actual lead details from Graph API using the leadgen_id
            const graphApiUrl = `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${META_ACCESS_TOKEN}`;
            const graphResponse = await fetch(graphApiUrl);
            const leadData = await graphResponse.json();

            if (leadData.error) {
              console.error('Graph API Error:', leadData.error);
              continue;
            }

            // Meta stores form answers in an array called `field_data`
            // Format: [{name: 'full_name', values: ['John Doe']}, {name: 'email', values: ['john@...']}]
            let name = 'Unknown Lead';
            let email = null;
            let phone = null;

            if (leadData.field_data) {
              leadData.field_data.forEach((field: any) => {
                const val = field.values[0];
                if (field.name === 'full_name' || field.name === 'first_name') name = val;
                if (field.name === 'email') email = val;
                if (field.name === 'phone_number') phone = val;
              });
            }

            // Save the lead to the CRM database
            await prisma.lead.create({
              data: {
                name,
                email,
                phone,
                source: 'Meta ad',
                status: 'NEW',
                type: 'N/A', // Default to Not Known
                priority: 'WARM',
                activities: {
                  create: {
                    type: 'CREATED',
                    title: 'Lead imported via Meta Ads Webhook',
                    performedBy: 'System',
                  }
                }
              }
            });
            console.log(`Successfully saved Meta lead: ${name}`);
          }
        }
      }
      // Return 200 OK to Meta so they know we received it
      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    } else {
      // Not a page event
      return new NextResponse('Not Found', { status: 404 });
    }
  } catch (error) {
    console.error('Meta Webhook Error:', error);
    // Returning 200 even on some errors prevents Facebook from spamming retries
    // for non-recoverable code issues, though 500 is technically correct for crashes.
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
