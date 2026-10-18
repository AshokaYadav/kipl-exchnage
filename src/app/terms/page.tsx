import { LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/config/site";

export const metadata = { title: `Terms & Conditions — ${siteConfig.brand}` };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      sections={[
        { h: "Eligibility", p: "The platform is for registered B2B users in India — retailers, distributors and API partners." },
        { h: "Wallet & payments", p: "Wallet top-ups and settlements are subject to verification. Margins shown are maximum margins and may change with operator rates." },
        { h: "Disputes & refunds", p: "Failed recharges are refunded to the wallet after verification. Complaints must be raised within the time window shown in your dashboard." },
        { h: "Prohibited use", p: "Fraudulent, fake or misleading transactions and complaints lead to account suspension and blocked balances." },
        { h: "Contact", p: `Reach us at ${siteConfig.contact.email} / ${siteConfig.contact.phone}.` },
      ]}
    />
  );
}
