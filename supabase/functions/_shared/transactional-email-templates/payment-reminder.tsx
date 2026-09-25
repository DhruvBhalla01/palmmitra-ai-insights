import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  planName?: string
  price?: string
  reportUrl?: string
}

const PaymentReminder = ({ name, planName, price, reportUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your palm reading is saved — finish unlocking it whenever you're ready</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={goldRule} />
        <Text style={brand}>PALMMITRA</Text>
        <Heading style={h1}>{name ? `${name}, your reading is waiting` : 'Your reading is waiting'}</Heading>
        <Text style={text}>
          It looks like your payment for {planName || 'your full palm reading'} didn't go through. No money was taken for an incomplete payment.
        </Text>
        <Text style={text}>
          Your reading is saved. You can open it again and finish unlocking it with UPI, card or netbanking.
        </Text>
        <Section style={{ textAlign: 'center', margin: '28px 0' }}>
          <Button href={reportUrl || 'https://www.palmmitra.in'} style={button}>
            Open my reading{price ? ` · ${price}` : ''}
          </Button>
        </Section>
        <Text style={muted}>
          If money was deducted, it is usually refunded by your bank automatically within 5–7 days. Just reply to this email if you need help.
        </Text>
        <Hr style={hr} />
        <Text style={muted}>PalmMitra · For guidance and reflection only. Not medical, legal or financial advice.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PaymentReminder,
  subject: (d: Record<string, any>) => (d?.name ? `${d.name}, your palm reading is saved` : 'Your palm reading is saved'),
  displayName: 'Payment reminder',
  previewData: { name: 'Asha', planName: 'Full Destiny Report', price: '₹299', reportUrl: 'https://www.palmmitra.in/report/example' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, "Times New Roman", serif' }
const container = { padding: '32px 28px', maxWidth: '520px' }
const goldRule = { borderTop: '3px solid #D4AF37', width: '48px', margin: '0 0 20px' }
const brand = { fontSize: '12px', letterSpacing: '4px', color: '#B8912F', margin: '0 0 16px' }
const h1 = { fontSize: '24px', fontWeight: 'normal' as const, color: '#1a1208', margin: '0 0 16px' }
const text = { fontSize: '15px', lineHeight: '24px', color: '#3d3222', fontFamily: 'Arial, sans-serif', margin: '0 0 12px' }
const button = { backgroundColor: '#D4AF37', color: '#1a1208', padding: '14px 26px', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold' as const, fontFamily: 'Arial, sans-serif', textDecoration: 'none' }
const muted = { fontSize: '12px', lineHeight: '18px', color: '#8a7d68', fontFamily: 'Arial, sans-serif', margin: '0 0 8px' }
const hr = { borderColor: '#eadfc6', margin: '24px 0 12px' }
