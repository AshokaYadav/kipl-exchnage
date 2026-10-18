import { LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/config/site";

export const metadata = { title: `Privacy Policy — ${siteConfig.brand}` };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      sections={[
        { h: "Information we collect", p: "Name, mobile number, email and transaction details you provide while registering and using the platform." },
        { h: "How we use it", p: "To verify your identity via OTP, process recharges, settle wallets, resolve disputes and provide support." },
        { h: "Data sharing", p: "We share data only with operators, API partners and payment providers as required to complete your transactions, or when required by law." },
        { h: "Security", p: "Access is protected with OTP-based login and token authentication. Never share your OTP with anyone." },
        { h: "Contact", p: `For privacy questions write to ${siteConfig.contact.email} or call ${siteConfig.contact.phone}.` },
      ]}
    />
  );
}
