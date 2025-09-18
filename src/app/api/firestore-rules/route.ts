import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const rulesFilePath = path.join(process.cwd(), 'firestore.rules');

/**
 * Handles GET requests to fetch Firestore rules.
 * @returns {Promise<NextResponse>} A response with the rules content or an error.
 */
export async function GET(req: NextRequest) {
  try {
    const rules = await fs.readFile(rulesFilePath, 'utf8');
    return NextResponse.json({ rules });
  } catch (error) {
    console.error('Error reading Firestore rules file:', error);
    return NextResponse.json({ message: 'Error reading rules file.' }, { status: 500 });
  }
}

/**
 * Handles POST requests to update Firestore rules.
 * @param {NextRequest} req The request object containing the new rules.
 * @returns {Promise<NextResponse>} A response indicating success or failure.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rules } = body;

    if (typeof rules !== 'string') {
      return NextResponse.json({ message: 'Invalid rules format provided.' }, { status: 400 });
    }

    await fs.writeFile(rulesFilePath, rules, 'utf8');
    return NextResponse.json({ message: 'Firestore rules updated successfully.' });
  } catch (error) {
    console.error('Error writing Firestore rules file:', error);
    return NextResponse.json({ message: 'Error writing rules file.' }, { status: 500 });
  }
}
