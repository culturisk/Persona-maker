import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export function generatePersonaPDF(persona) {
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 80, 40, 60],
    header: function(currentPage, pageCount) {
      return {
        text: 'Culturisk Persona Maker & Pricer - Persona Report',
        alignment: 'center',
        margin: [40, 25, 40, 0],
        style: 'header',
        fontSize: 14,
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
        text: persona.name || 'Unnamed Persona',
        style: 'title',
        margin: [0, 0, 0, 10]
      },
      {
        text: persona.positioning || '',
        style: 'subtitle',
        margin: [0, 0, 0, 20]
      },
      
      // Overview Section
      {
        text: 'Overview',
        style: 'sectionHeader',
        margin: [0, 10, 0, 10]
      },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            [
              { text: 'Created', style: 'tableLabel' },
              { text: new Date(persona.createdAt).toLocaleDateString(), style: 'tableValue' }
            ],
            [
              { text: 'Segment', style: 'tableLabel' },
              { text: persona.segmentName || 'N/A', style: 'tableValue' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20]
      },
      
      // Cultural Cues Section
      {
        text: 'Cultural Insights',
        style: 'sectionHeader',
        margin: [0, 10, 0, 10]
      },
      {
        ul: (persona.culturalCues || []).map(cue => ({
          text: cue,
          style: 'listItem'
        })),
        margin: [0, 0, 0, 20]
      },
      
      // Economic Cues Section
      {
        text: 'Economic Profile',
        style: 'sectionHeader',
        margin: [0, 10, 0, 10]
      },
      {
        ul: (persona.economicCues || []).map(cue => ({
          text: cue,
          style: 'listItem'
        })),
        margin: [0, 0, 0, 20]
      },
      
      // Messaging Pillars
      {
        text: 'Messaging Pillars',
        style: 'sectionHeader',
        margin: [0, 10, 0, 10],
        pageBreak: 'before'
      },
      {
        ol: (persona.messagingPillars || []).map(pillar => ({
          text: pillar,
          style: 'listItem'
        })),
        margin: [0, 0, 0, 20]
      },
      
      // Generalizations
      {
        text: 'Key Generalizations',
        style: 'sectionHeader',
        margin: [0, 10, 0, 10]
      },
      {
        ul: (persona.generalizations || []).map(gen => ({
          text: gen,
          style: 'listItem'
        })),
        margin: [0, 0, 0, 20]
      },
      
      // Generated Footer
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
      header: {
        fontSize: 12,
        bold: true,
        color: '#22c55e'
      },
      title: {
        fontSize: 24,
        bold: true,
        color: '#1a1a1a'
      },
      subtitle: {
        fontSize: 14,
        color: '#666',
        italics: true
      },
      sectionHeader: {
        fontSize: 16,
        bold: true,
        color: '#22c55e'
      },
      tableLabel: {
        bold: true,
        fontSize: 10,
        color: '#666'
      },
      tableValue: {
        fontSize: 10,
        color: '#1a1a1a'
      },
      listItem: {
        fontSize: 11,
        lineHeight: 1.5,
        margin: [0, 3, 0, 3]
      }
    }
  };
  
  return pdfMake.createPdf(docDefinition);
}

export function generatePricingStrategyPDF(persona, strategy) {
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 80, 40, 60],
    header: function(currentPage, pageCount) {
      return {
        text: 'Culturisk Persona Maker & Pricer - Pricing Strategy',
        alignment: 'center',
        margin: [40, 25, 40, 0],
        style: 'header',
        fontSize: 14,
        bold: true,
        color: '#22c55e'
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
        text: `Pricing Strategy for ${persona.name}`,
        style: 'title',
        margin: [0, 0, 0, 20]
      },
      
      // Executive Summary
      {
        text: 'Executive Summary',
        style: 'sectionHeader',
        margin: [0, 0, 0, 10],
        color: '#22c55e'
      },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            [
              { text: 'Pricing Model', style: 'tableLabel' },
              { text: strategy.pricingModel || 'N/A', style: 'tableValue' }
            ],
            [
              { text: 'Anchor Price', style: 'tableLabel' },
              { text: strategy.anchorPrice || 'N/A', style: 'tableValue' }
            ],
            [
              { text: 'Value Metric', style: 'tableLabel' },
              { text: strategy.valueMetric || 'N/A', style: 'tableValue' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20]
      },
      
      // Pricing Tiers
      {
        text: 'Pricing Tiers',
        style: 'sectionHeader',
        margin: [0, 10, 0, 10],
        color: '#22c55e'
      },
      ...(strategy.tiers || []).map(tier => ({
        stack: [
          {
            columns: [
              {
                text: tier.name,
                style: 'tierName',
                width: '50%'
              },
              {
                text: tier.price,
                style: 'tierPrice',
                width: '50%',
                alignment: 'right'
              }
            ]
          },
          {
            ul: (tier.features || []).map(feature => ({
              text: feature,
              fontSize: 10
            })),
            margin: [0, 5, 0, 15]
          }
        ]
      })),
      
      // Psychological Tactics
      {
        text: 'Psychological Pricing Tactics',
        style: 'sectionHeader',
        margin: [0, 10, 0, 10],
        pageBreak: 'before',
        color: '#22c55e'
      },
      {
        ul: (strategy.psychologicalTactics || []).map(tactic => ({
          text: tactic,
          fontSize: 11,
          margin: [0, 3, 0, 3]
        })),
        margin: [0, 0, 0, 20]
      },
      
      // Market Positioning
      {
        text: 'Market Positioning',
        style: 'sectionHeader',
        margin: [0, 10, 0, 10],
        color: '#22c55e'
      },
      {
        stack: [
          {
            text: 'Value Proposition',
            style: 'subsectionHeader',
            margin: [0, 0, 0, 5]
          },
          {
            text: strategy.valueProposition || 'N/A',
            fontSize: 10,
            margin: [0, 0, 0, 15]
          },
          {
            text: 'Competitive Positioning',
            style: 'subsectionHeader',
            margin: [0, 0, 0, 5]
          },
          {
            text: strategy.competitivePositioning || 'N/A',
            fontSize: 10,
            margin: [0, 0, 0, 15]
          },
          {
            text: 'Price Justification',
            style: 'subsectionHeader',
            margin: [0, 0, 0, 5]
          },
          {
            text: strategy.priceJustification || 'N/A',
            fontSize: 10,
            margin: [0, 0, 0, 15]
          }
        ]
      },
      
      // Payment Options
      {
        text: 'Payment Options & Incentives',
        style: 'sectionHeader',
        margin: [0, 10, 0, 10],
        pageBreak: 'before',
        color: '#22c55e'
      },
      {
        text: 'Accepted Payment Methods',
        style: 'subsectionHeader',
        margin: [0, 0, 0, 5]
      },
      {
        ul: (strategy.paymentOptions || []).map(option => ({
          text: option,
          fontSize: 10
        })),
        margin: [0, 0, 0, 15]
      },
      {
        text: 'Upsell & Cross-sell Opportunities',
        style: 'subsectionHeader',
        margin: [0, 0, 0, 5]
      },
      {
        ul: (strategy.upsellCrossSell || []).map(item => ({
          text: item,
          fontSize: 10
        })),
        margin: [0, 0, 0, 20]
      },
      
      // Footer
      {
        text: [
          { text: 'Generated with ', fontSize: 9, color: '#666' },
          { text: 'Pricer', fontSize: 9, bold: true, color: '#22c55e' },
          { text: ` on ${new Date().toLocaleDateString()}`, fontSize: 9, color: '#666' }
        ],
        alignment: 'center',
        margin: [0, 30, 0, 0]
      }
    ],
    styles: {
      header: {
        fontSize: 12,
        bold: true,
        color: '#22c55e'
      },
      title: {
        fontSize: 22,
        bold: true,
        color: '#1a1a1a'
      },
      sectionHeader: {
        fontSize: 16,
        bold: true,
        color: '#22c55e'
      },
      subsectionHeader: {
        fontSize: 12,
        bold: true,
        color: '#333'
      },
      tierName: {
        fontSize: 14,
        bold: true,
        color: '#1a1a1a'
      },
      tierPrice: {
        fontSize: 18,
        bold: true,
        color: '#22c55e'
      },
      tableLabel: {
        bold: true,
        fontSize: 10,
        color: '#666'
      },
      tableValue: {
        fontSize: 10,
        color: '#1a1a1a'
      }
    }
  };
  
  return pdfMake.createPdf(docDefinition);
}
