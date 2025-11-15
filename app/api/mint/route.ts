import { NextRequest, NextResponse } from 'next/server';
import { generateMemeArt } from '@/lib/openai';
import { deployOnBaseSepolia } from '@/lib/blockchain';
import { chargeUser } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { thread, address } = await req.json();
    if (!thread || !address) {
      return NextResponse.json({ error: 'Thread and wallet address required' }, { status: 400 });
    }
    // 1. Generate meme art
    const image = await generateMemeArt(thread);
    // 2. Stripe charge
    await chargeUser();
    // 3. Deploy/mint
    const { tx, nft } = await deployOnBaseSepolia(address, image, thread);
    return NextResponse.json({ tx, nft, image });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
}
