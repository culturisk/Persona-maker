import { NextResponse } from 'next/server';
import { generatePricingStrategyPDF } from '@/lib/pdf-export';

export async function POST(request) {
  try {
    const { persona, strategy } = await request.json();
    
    if (!persona || !strategy) {
      return NextResponse.json(
        { error: 'Missing persona or strategy data' },
        { status: 400 }
      );
    }
    
    // Generate PDF
    const pdfDoc = generatePricingStrategyPDF(persona, strategy);
    
    // Return as stream/buffer
    return new Promise((resolve) => {
      pdfDoc.getBuffer((buffer) => {
        resolve(
          new NextResponse(buffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="pricing-strategy-${persona.name.replace(/\s+/g, '-').toLowerCase()}.pdf"`
            }
          })
        );
      });
    });
  } catch (error) {
    console.error('Error exporting pricing strategy PDF:', error);
    return NextResponse.json(
      { error: 'Failed to export PDF' },
      { status: 500 }
    );
  }
}
