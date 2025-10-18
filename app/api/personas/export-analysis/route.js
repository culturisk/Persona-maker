import { NextResponse } from 'next/server';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export async function POST(request) {
  try {
    const { persona, product } = await request.json();
    
    if (!persona) {
      return NextResponse.json({ error: 'Persona data required' }, { status: 400 });
    }

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 80, 40, 60],
      header: function(currentPage, pageCount) {
        return {
          text: 'Culturisk Persona Maker & Pricer - Comprehensive Persona Analysis',
          alignment: 'center',
          margin: [40, 25, 40, 0],
          fontSize: 12,
          bold: true,
          color: '#3b82f6'
        };
      },
      footer: function(currentPage, pageCount) {
        return {
          text: `Page ${currentPage} of ${pageCount}`,
          alignment: 'center',
          margin: [0, 20, 0, 0],
          fontSize: 9,
          color: '#666'
        };
      },
      content: [
        // Title
        {
          text: persona.name || 'Persona Analysis',
          style: 'title',
          margin: [0, 0, 0, 10]
        },
        {
          text: `Product/Service: ${product || 'General'}`,
          style: 'subtitle',
          margin: [0, 0, 0, 5]
        },
        {
          text: persona.positioning || '',
          style: 'subtitle',
          margin: [0, 0, 0, 20]
        },
        
        // Demographics Table
        {
          text: 'DEMOGRAPHIC PROFILE',
          style: 'sectionHeader',
          margin: [0, 10, 0, 10]
        },
        {
          table: {
            widths: ['35%', '65%'],
            body: [
              [
                { text: 'Target Audience', style: 'tableHeader' },
                { text: persona.name || 'N/A', style: 'tableCell' }
              ],
              [
                { text: 'Psychographic Profile', style: 'tableHeader' },
                { text: persona.positioning || 'N/A', style: 'tableCell' }
              ],
              [
                { text: 'Cultural Background', style: 'tableHeader' },
                { text: persona.culturalCues?.[0] || 'General audience', style: 'tableCell' }
              ],
              [
                { text: 'Economic Status', style: 'tableHeader' },
                { text: persona.economicCues?.[0] || 'Middle income', style: 'tableCell' }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 20]
        },
        
        // Targeting Strategy
        {
          text: 'TARGETING STRATEGY',
          style: 'sectionHeader',
          margin: [0, 10, 0, 10]
        },
        {
          table: {
            widths: ['35%', '65%'],
            body: [
              [
                { text: 'Digital Channels', style: 'tableHeader' },
                { text: 'Google Ads, Facebook, Instagram, LinkedIn', style: 'tableCell' }
              ],
              [
                { text: 'Content Marketing', style: 'tableHeader' },
                { text: 'Blog posts, Video content, Case studies, Testimonials', style: 'tableCell' }
              ],
              [
                { text: 'Email Strategy', style: 'tableHeader' },
                { text: 'Personalized offers with educational content', style: 'tableCell' }
              ],
              [
                { text: 'Social Proof', style: 'tableHeader' },
                { text: 'Customer reviews and ratings', style: 'tableCell' }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 20]
        },
        
        // Messaging Framework
        {
          text: 'MESSAGING FRAMEWORK',
          style: 'sectionHeader',
          margin: [0, 10, 0, 10],
          pageBreak: 'before'
        },
        {
          table: {
            widths: ['35%', '65%'],
            body: [
              [
                { text: 'Value Proposition', style: 'tableHeader' },
                { text: persona.messagingPillars?.[0] || 'Quality meets affordability', style: 'tableCell' }
              ],
              [
                { text: 'Key Messages', style: 'tableHeader' },
                { text: (persona.messagingPillars || ['Best value', 'Trusted quality']).join(', '), style: 'tableCell' }
              ],
              [
                { text: 'Call to Action', style: 'tableHeader' },
                { text: 'Try now with confidence', style: 'tableCell' }
              ],
              [
                { text: 'Communication Tone', style: 'tableHeader' },
                { text: 'Professional and clear', style: 'tableCell' }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 20]
        },
        
        // Communication Channels
        {
          text: 'COMMUNICATION CHANNELS',
          style: 'sectionHeader',
          margin: [0, 10, 0, 10]
        },
        {
          table: {
            widths: ['35%', '65%'],
            body: [
              [
                { text: 'Preferred Channels', style: 'tableHeader' },
                { text: 'Digital, Social Media, Email, Mobile App', style: 'tableCell' }
              ],
              [
                { text: 'Content Preferences', style: 'tableHeader' },
                { text: 'Educational, Value-driven, Problem-solving', style: 'tableCell' }
              ],
              [
                { text: 'Engagement Style', style: 'tableHeader' },
                { text: 'Interactive and responsive', style: 'tableCell' }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 20]
        },
        
        // Motivations & Barriers
        {
          text: 'MOTIVATIONS & BARRIERS',
          style: 'sectionHeader',
          margin: [0, 10, 0, 10]
        },
        {
          table: {
            widths: ['35%', '65%'],
            body: [
              [
                { text: 'Primary Motivators', style: 'tableHeader' },
                { text: (persona.culturalCues?.slice(0, 3) || ['Quality', 'Value', 'Reliability']).join(', '), style: 'tableCell' }
              ],
              [
                { text: 'Pain Points', style: 'tableHeader' },
                { text: (persona.generalizations?.slice(0, 3) || ['Budget constraints', 'Time limitations']).join(', '), style: 'tableCell' }
              ],
              [
                { text: 'Goals', style: 'tableHeader' },
                { text: 'Achieve value for money, Make informed decisions, Solve problems efficiently', style: 'tableCell' }
              ],
              [
                { text: 'Barriers', style: 'tableHeader' },
                { text: 'High prices, Complex processes, Lack of trust', style: 'tableCell' }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 20]
        },
        
        // Campaign Timeline
        {
          text: 'CAMPAIGN TIMELINE',
          style: 'sectionHeader',
          margin: [0, 10, 0, 10],
          pageBreak: 'before'
        },
        {
          ul: [
            { text: 'Week 1-2: Awareness building through social media and content', style: 'listItem' },
            { text: 'Week 3-4: Engagement campaigns with offers and testimonials', style: 'listItem' },
            { text: 'Week 5-6: Conversion focus with retargeting and email nurture', style: 'listItem' },
            { text: 'Week 7+: Retention and loyalty programs', style: 'listItem' }
          ],
          margin: [0, 0, 0, 20]
        },
        
        // Next Steps
        {
          text: 'NEXT STEPS',
          style: 'sectionHeader',
          margin: [0, 10, 0, 10]
        },
        {
          text: '1. Define pricing strategy based on economic profile',
          style: 'listItem',
          margin: [0, 5, 0, 5]
        },
        {
          text: '2. Create content calendar aligned with campaign timeline',
          style: 'listItem',
          margin: [0, 0, 0, 5]
        },
        {
          text: '3. Set up tracking and analytics for all channels',
          style: 'listItem',
          margin: [0, 0, 0, 5]
        },
        {
          text: '4. Launch pilot campaigns to test messaging',
          style: 'listItem',
          margin: [0, 0, 0, 20]
        },
        
        // Footer
        {
          text: [
            { text: 'Generated with ', fontSize: 9, color: '#666' },
            { text: 'Culturisk Persona Maker & Pricer', fontSize: 9, bold: true, color: '#3b82f6' },
            { text: ` on ${new Date().toLocaleDateString()}`, fontSize: 9, color: '#666' }
          ],
          alignment: 'center',
          margin: [0, 30, 0, 0]
        }
      ],
      styles: {
        title: {
          fontSize: 24,
          bold: true,
          color: '#1a1a1a'
        },
        subtitle: {
          fontSize: 12,
          color: '#666',
          italics: true
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          color: '#3b82f6',
          background: '#f0f9ff',
          fillColor: '#f0f9ff'
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: '#333',
          fillColor: '#f3f4f6'
        },
        tableCell: {
          fontSize: 10,
          color: '#1a1a1a'
        },
        listItem: {
          fontSize: 10,
          lineHeight: 1.5,
          margin: [0, 3, 0, 3]
        }
      }
    };
    
    return new Promise((resolve) => {
      pdfMake.createPdf(docDefinition).getBuffer((buffer) => {
        resolve(
          new NextResponse(buffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="persona-analysis-${persona.name.replace(/\s+/g, '-').toLowerCase()}.pdf"`
            }
          })
        );
      });
    });
  } catch (error) {
    console.error('Error exporting persona analysis PDF:', error);
    return NextResponse.json({ error: 'Failed to export PDF' }, { status: 500 });
  }
}
