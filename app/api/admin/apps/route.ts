import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { APPS } from '@/lib/appData';
import { isOwnerEmail } from '@/lib/authUtils';
import { sendAppPublishNotification } from '@/lib/emailService';
import { getS3SignedReadUrl } from '@/lib/s3';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    let apps = await db.collection('application').find({}).toArray();

    // Auto-seed if database collection is empty
    if (apps.length === 0) {
      for (const app of APPS) {
        await db.collection('application').updateOne(
          { appId: app.id },
          {
            $setOnInsert: {
              appId: app.id,
              name: app.name,
              category: app.category,
              size: app.size,
              teaser: app.teaser,
              fullDescription: app.fullDescription,
              icon: app.icon,
              version: app.version || 'v1.0.1',
              fileName: app.fileName || `${app.name}-release.apk`,
              s3Key: app.s3Key || app.fileName || `${app.name}-release.apk`,
              screenshots: app.screenshots || [],
              downloadsCount: 0,
              reviewsCount: 0,
              averageRating: 5.0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
          { upsert: true }
        );
      }
      apps = await db.collection('application').find({}).toArray();
    }

    // Format id from appId, enrich any missing fields, and generate presigned read URLs
    const formatted = await Promise.all(
      apps.map(async (app) => {
        const fallbackStatic = APPS.find((a) => a.id === (app.appId || app.id)) || ({} as any);
        const rawIcon = app.icon || fallbackStatic.icon || '/placeholder-logo.png';
        const rawScreenshots = app.screenshots || fallbackStatic.screenshots || [];

        const signedIcon = await getS3SignedReadUrl(rawIcon);
        const signedScreenshots = await Promise.all(
          (rawScreenshots || []).map((s: string) => getS3SignedReadUrl(s))
        );

        return {
          ...app,
          id: app.appId || app.id,
          name: app.name || fallbackStatic.name || app.appId || 'Unknown App',
          category: app.category || fallbackStatic.category || 'General',
          size: app.size || fallbackStatic.size || '10.0 MB',
          teaser: app.teaser || fallbackStatic.teaser || '',
          fullDescription: app.fullDescription || fallbackStatic.fullDescription || '',
          icon: signedIcon,
          version: app.version || fallbackStatic.version || 'v1.0.0',
          fileName: app.fileName || fallbackStatic.fileName || `${app.name || app.appId}-release.apk`,
          s3Key: app.s3Key || fallbackStatic.s3Key || app.fileName || `${app.name || app.appId}-release.apk`,
          screenshots: signedScreenshots,
          _id: app._id.toString(),
        };
      })
    );

    return NextResponse.json(formatted);

  } catch (error) {
    console.error('[KatyalStore Admin Apps] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      id,
      category,
      size,
      teaser,
      fullDescription,
      icon,
      version,
      fileName,
      s3Key,
      releaseNotes,
      screenshots,
      ownerEmail,
    } = body;

    // Validate owner permissions if provided
    if (ownerEmail && !isOwnerEmail(ownerEmail)) {
      return NextResponse.json({ error: 'Owner not found or unauthorized.' }, { status: 404 });
    }

    if (!name || !category || !teaser || !fullDescription || !fileName) {
      return NextResponse.json(
        { error: 'Missing required app fields (name, category, teaser, fullDescription, fileName)' },
        { status: 400 }
      );
    }

    // Create a clean slug ID
    const appId = (id || name.toLowerCase().replace(/[^a-z0-9]/g, '-')).replace(/^-+|-+$/g, '');

    const db = await getDb();

    // Check if app with this ID already exists
    const existing = await db.collection('application').findOne({ appId });
    if (existing) {
      return NextResponse.json(
        { error: `An application with ID '${appId}' already exists. Please pick another name or ID.` },
        { status: 400 }
      );
    }

    const newAppDoc = {
      appId,
      name: name.trim(),
      category: category.trim(),
      size: size || '10.0 MB',
      teaser: teaser.trim(),
      fullDescription: fullDescription.trim(),
      icon: icon || '/placeholder-logo.png',
      version: version?.trim() || 'v1.0.0',
      fileName: fileName.trim(),
      s3Key: (s3Key || fileName).trim(),
      releaseNotes: releaseNotes?.trim() || 'Initial store release',
      screenshots: Array.isArray(screenshots) ? screenshots : [],
      ownerEmail: ownerEmail?.trim() || undefined,
      downloadsCount: 0,
      reviewsCount: 0,
      averageRating: 5.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('application').insertOne(newAppDoc);
    console.log(`[KatyalStore Admin] Published new app '${name}' (${appId}) with file '${fileName}'`);

    // Asynchronously dispatch Neo-Brutalist notification email
    sendAppPublishNotification({
      to: ownerEmail,
      appName: newAppDoc.name,
      appId: newAppDoc.appId,
      version: newAppDoc.version,
      category: newAppDoc.category,
      s3Key: newAppDoc.s3Key,
      size: newAppDoc.size,
      releaseNotes: newAppDoc.releaseNotes,
      isUpdate: false,
    }).catch((err) => console.error('[KatyalStore Email] Failed to send publish notification:', err));

    return NextResponse.json({
      success: true,
      message: `App '${name}' published successfully!`,
      app: {
        ...newAppDoc,
        id: appId,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[KatyalStore Admin Apps] POST Error:', error);
    return NextResponse.json({ error: 'Failed to publish application' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      category,
      size,
      teaser,
      fullDescription,
      icon,
      version,
      fileName,
      s3Key,
      releaseNotes,
      screenshots,
      ownerEmail,
    } = body;

    // Validate owner permissions if provided
    if (ownerEmail && !isOwnerEmail(ownerEmail)) {
      return NextResponse.json({ error: 'Owner not found or unauthorized.' }, { status: 404 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Application ID is required for updating' }, { status: 400 });
    }

    const db = await getDb();
    const existing = await db.collection('application').findOne({ appId: id });

    if (!existing) {
      return NextResponse.json({ error: `Application '${id}' not found` }, { status: 404 });
    }

    const updateFields: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (name) updateFields.name = name.trim();
    if (category) updateFields.category = category.trim();
    if (size) updateFields.size = size;
    if (teaser) updateFields.teaser = teaser.trim();
    if (fullDescription) updateFields.fullDescription = fullDescription.trim();
    if (icon) updateFields.icon = icon.trim();
    if (version) updateFields.version = version.trim();
    if (fileName) updateFields.fileName = fileName.trim();
    if (s3Key || fileName) updateFields.s3Key = (s3Key || fileName).trim();
    if (releaseNotes) updateFields.releaseNotes = releaseNotes.trim();
    if (Array.isArray(screenshots)) updateFields.screenshots = screenshots;
    if (ownerEmail) updateFields.ownerEmail = ownerEmail.trim();

    await db.collection('application').updateOne(
      { appId: id },
      { $set: updateFields }
    );

    console.log(`[KatyalStore Admin] Pushed update for '${id}':`, updateFields);

    // Asynchronously dispatch Neo-Brutalist update notification email
    sendAppPublishNotification({
      to: ownerEmail || existing.ownerEmail,
      appName: updateFields.name || existing.name || id,
      appId: id,
      version: updateFields.version || existing.version || 'Updated',
      category: updateFields.category || existing.category,
      s3Key: updateFields.s3Key || existing.s3Key,
      size: updateFields.size || existing.size,
      releaseNotes: updateFields.releaseNotes || existing.releaseNotes,
      isUpdate: true,
    }).catch((err) => console.error('[KatyalStore Email] Failed to send update notification:', err));

    return NextResponse.json({
      success: true,
      message: `Updated '${id}' successfully!`,
      updatedFields: updateFields,
    });
  } catch (error) {
    console.error('[KatyalStore Admin Apps] PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const ownerEmail = searchParams.get('ownerEmail');

    if (ownerEmail && !isOwnerEmail(ownerEmail)) {
      return NextResponse.json({ error: 'Owner not found or unauthorized.' }, { status: 404 });
    }

    if (!id) {
      return NextResponse.json({ error: 'App ID required' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('application').deleteOne({ appId: id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: `Application '${id}' not found` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Application '${id}' removed from store catalog.`,
    });
  } catch (error) {
    console.error('[KatyalStore Admin Apps] DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}
