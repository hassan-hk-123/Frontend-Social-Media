'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeftOutlined } from '@ant-design/icons';
import './page.scss';

const PrivacyPage = () => {
  return (
    <div className="privacy-container">
      <div className="privacy-header">
        <Link href="/" className="back-button">
          <ArrowLeftOutlined /> Back to Home
        </Link>
        <h1>TalkHub Privacy Policy</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="privacy-content">
        <section className="privacy-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to TalkHub. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy explains how we collect, use, and safeguard your information when you use our service.
          </p>
        </section>

        <section className="privacy-section">
          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, username, profile picture</li>
            <li><strong>Profile Data:</strong> Bio, date of birth, location, education, interests</li>
            <li><strong>Content:</strong> Posts, comments, messages, images you share</li>
            <li><strong>Social Login:</strong> Information from Google and Facebook when you sign up using social accounts</li>
          </ul>

          <h3>2.2 Information We Collect Automatically</h3>
          <ul>
            <li><strong>Usage Data:</strong> How you interact with our service, pages visited, features used</li>
            <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
            <li><strong>Cookies:</strong> Small data files stored on your device to improve your experience</li>
            <li><strong>Log Data:</strong> Server logs including access times, pages viewed, and error messages</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process and complete transactions</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Communicate with you about products, services, and events</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
            <li>Personalize your experience and deliver relevant content</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>4. Social Login Information</h2>
          <p>
            When you sign up or log in using Google or Facebook, we may collect:
          </p>
          <ul>
            <li><strong>Google Login:</strong> Name, email address, profile picture, and Google ID</li>
            <li><strong>Facebook Login:</strong> Name, email address, profile picture, and Facebook ID</li>
          </ul>
          <p>
            This information is used to create and manage your account. We do not have access to your 
            social media passwords or other personal information from these platforms.
          </p>
        </section>

        <section className="privacy-section">
          <h2>5. Information Sharing and Disclosure</h2>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:</p>
          <ul>
            <li><strong>With Your Consent:</strong> When you explicitly agree to share your information</li>
            <li><strong>Service Providers:</strong> Trusted third parties who assist us in operating our service</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>6. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information against unauthorized access, 
            alteration, disclosure, or destruction. These measures include:
          </p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication procedures</li>
            <li>Secure hosting and infrastructure</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>7. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our services and fulfill 
            the purposes outlined in this privacy policy. When you delete your account, we will delete or 
            anonymize your personal information, except where we are required to retain it for legal purposes.
          </p>
        </section>

        <section className="privacy-section">
          <h2>8. Your Rights and Choices</h2>
          <p>You have the following rights regarding your personal information:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal information</li>
            <li><strong>Correction:</strong> Update or correct your personal information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
            <li><strong>Objection:</strong> Object to certain processing of your personal information</li>
            <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>9. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to enhance your experience on our platform. 
            You can control cookie settings through your browser preferences. However, disabling cookies 
            may affect the functionality of our service.
          </p>
        </section>

        <section className="privacy-section">
          <h2>10. Third-Party Services</h2>
          <p>
            Our service may contain links to third-party websites or services. We are not responsible for 
            the privacy practices of these third parties. We encourage you to read their privacy policies 
            before providing any personal information.
          </p>
        </section>

        <section className="privacy-section">
          <h2>11. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13 years of age. We do not knowingly collect 
            personal information from children under 13. If you are a parent or guardian and believe your 
            child has provided us with personal information, please contact us immediately.
          </p>
        </section>

        <section className="privacy-section">
          <h2>12. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. 
            We ensure that such transfers comply with applicable data protection laws and implement 
            appropriate safeguards to protect your information.
          </p>
        </section>

        <section className="privacy-section">
          <h2>13. Changes to This Privacy Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes by 
            posting the new privacy policy on this page and updating the "Last updated" date. 
            We encourage you to review this privacy policy periodically.
          </p>
        </section>

        <section className="privacy-section">
          <h2>14. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our data practices, please contact us:
          </p>
          <div className="contact-info">
            <p><strong>Email:</strong> technicalhassanjhan.1@gmial.com</p>
            <p><strong>Address:</strong> Street 123, City, Country</p>
            <p><strong>Data Protection Officer:</strong> dpo@talkhub.com</p>
          </div>
        </section>

        <section className="privacy-section">
          <h2>15. Legal Basis for Processing (GDPR)</h2>
          <p>
            For users in the European Union, our legal basis for processing personal information includes:
          </p>
          <ul>
            <li><strong>Consent:</strong> When you explicitly agree to our processing</li>
            <li><strong>Contract:</strong> To provide our services under our terms</li>
            <li><strong>Legitimate Interest:</strong> To improve our services and prevent fraud</li>
            <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;

