/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your secure sign-in link for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={goldRule} />
        <Text style={brand}>PALMMITRA</Text>
        <Heading style={h1}>Your sign-in link</Heading>
        <Text style={text}>
          Tap the button below to sign in to {siteName}. For your security, this
          link expires shortly and can only be used once.
        </Text>
        <Section style={{ textAlign: 'center', margin: '28px 0' }}>
          <Button style={button} href={confirmationUrl}>
            Sign in to PalmMitra
          </Button>
        </Section>
        <Text style={muted}>
          If you didn't request this link, you can safely ignore this email —
          your account stays secure.
        </Text>
        <Hr style={hr} />
        <Text style={muted}>
          PalmMitra · For guidance and reflection only. Not medical, legal or
          financial advice.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Georgia, "Times New Roman", serif',
}
const container = { padding: '32px 28px', maxWidth: '520px' }
const goldRule = {
  borderTop: '3px solid #D4AF37',
  width: '48px',
  margin: '0 0 20px',
}
const brand = {
  fontSize: '12px',
  letterSpacing: '4px',
  color: '#B8912F',
  margin: '0 0 16px',
}
const h1 = {
  fontSize: '24px',
  fontWeight: 'normal' as const,
  color: '#1a1208',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#3d3222',
  fontFamily: 'Arial, sans-serif',
  margin: '0 0 12px',
}
const button = {
  backgroundColor: '#D4AF37',
  color: '#1a1208',
  padding: '14px 26px',
  borderRadius: '10px',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  fontFamily: 'Arial, sans-serif',
  textDecoration: 'none',
}
const muted = {
  fontSize: '12px',
  lineHeight: '18px',
  color: '#8a7d68',
  fontFamily: 'Arial, sans-serif',
  margin: '0 0 8px',
}
const hr = { borderColor: '#eadfc6', margin: '24px 0 12px' }
