import React from "react";
import { Link } from "react-router-dom";
import { LegalPageLayout, LegalSection } from "./LegalLayout"; // Adjust path as needed

// TODO: Update this date when you finalize the document
const LAST_UPDATED = "October 31, 2025";

const PrivacyPolicyPage = () => {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <LegalSection title="1. Introduction">
        <p>
          Welcome to 11jersey.com ("we", "our", "us"). We are committed to
          protecting your personal information and your right to privacy. This
          Privacy Policy explains what information we collect, how we use it,
          and what rights you have in relation to it.
        </p>
        <p>
          By using our Site, you agree to the collection and use of information
          in accordance with this policy.
        </p>
      </LegalSection>

      <LegalSection title="2. Information We Collect">
        <p>
          We collect personal information that you voluntarily provide to us
          when you register an account, place an order, or subscribe to our
          newsletter.
        </p>
        <p>The personal information we collect may include the following:</p>
        <ul>
          <li>
            <strong>Personal Identification Information:</strong> Name, email
            address, phone number.
          </li>
          <li>
            <strong>Address Information:</strong> Shipping address and billing
            address.
          </li>
          <li>
            <strong>Payment Information:</strong> We do not collect or store
            your payment card details. That information is provided directly to
            our third-party payment processors (e.g., Razorpay, Stripe) whose
            use of your personal information is governed by their Privacy
            Policy.
          </li>
          <li>
            <strong>Technical Data:</strong> IP address, browser type, and
            operating system, collected automatically through cookies and
            similar technologies.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How We Use Your Information">
        <p>
          We use the information we collect for various purposes, including to:
        </p>
        <ul>
          <li>Fulfill and manage your orders, payments, and returns.</li>
          <li>
            Communicate with you regarding your account or order, and respond to
            your inquiries.
          </li>
          <li>
            Send you marketing and promotional communications (e.g.,
            newsletters), if you have opted in to receive them.
          </li>
          <li>Improve and personalize your experience on our Site.</li>
          <li>
            Prevent fraudulent transactions and enhance the security of our
            Site.
          </li>
          <li>Comply with legal and regulatory requirements.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. How We Share Your Information">
        <p>
          We do not sell, trade, or rent your personal information to third
          parties. We may share your information with trusted third-party
          service providers to perform services on our behalf, such as:
        </p>
        <ul>
          <li>Payment processors to securely handle your payments.</li>
          <li>Shipping and logistics partners to deliver your orders.</li>
          <li>
            Marketing service providers (e.g., email marketing services) to send
            you communications you've agreed to receive.
          </li>
        </ul>
        <p>
          We may also disclose your information if required by law or to protect
          our rights in the event of a legal dispute.
        </p>
      </LegalSection>

      <LegalSection title="5. Data Security">
        <p>
          We use industry-standard security measures (such as SSL encryption) to
          protect your personal information. However, no method of transmission
          over the Internet or electronic storage is 100% secure. While we
          strive to use commercially acceptable means to protect your data, we
          cannot guarantee its absolute security.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies">
        <p>
          Our Site uses "cookies" to enhance your experience. Cookies are small
          files stored on your device that help us remember your preferences
          (like items in your cart) and understand how you use the Site. You can
          instruct your browser to refuse all cookies or to indicate when a
          cookie is being sent.
        </p>
      </LegalSection>

      <LegalSection title="7. Your Rights">
        <p>
          You have the right to access, update, or correct the personal
          information we hold about you at any time by logging into your
          account. You may also request the deletion of your personal account.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new policy on this page and updating
          the "Last Updated" date. We encourage you to review this policy
          periodically.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact Us">
        <p>
          If you have any questions or concerns about this Privacy Policy,
          please contact us at:
          <Link to="mailto:privacy@11jersey.com" className="ml-1">
            privacy@11jersey.com
          </Link>
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default PrivacyPolicyPage;
