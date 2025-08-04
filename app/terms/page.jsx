'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeftOutlined } from '@ant-design/icons';
import './page.scss';

const TermsPage = () => {
  return (
    <div className="terms-container">
      <div className="terms-header">
        <Link href="/" className="back-button">
          <ArrowLeftOutlined /> Back to Home
        </Link>
        <h1> TalkHub Terms of Service</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="terms-content">
        <section className="terms-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using TalkHub ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="terms-section">
          <h2>2. Description of Service</h2>
          <p>
            TalkHub is a social media platform that allows users to:
          </p>
          <ul>
            <li>Create and share posts, images, and content</li>
            <li>Connect with friends and other users</li>
            <li>Send and receive messages</li>
            <li>Create and manage their profile</li>
            <li>Engage with content through likes, comments, and shares</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>3. User Accounts</h2>
          <p>
            To use certain features of the Service, you must create an account. You agree to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and update your account information</li>
            <li>Keep your password secure and confidential</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>4. User Conduct</h2>
          <p>You agree not to use the Service to:</p>
          <ul>
            <li>Post content that is illegal, harmful, threatening, abusive, or defamatory</li>
            <li>Harass, bully, or intimidate other users</li>
            <li>Share personal information of others without consent</li>
            <li>Upload viruses, malware, or other harmful code</li>
            <li>Attempt to gain unauthorized access to the Service or other accounts</li>
            <li>Use automated systems to access the Service</li>
            <li>Impersonate another person or entity</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>5. Content Guidelines</h2>
          <p>When posting content, you must ensure it:</p>
          <ul>
            <li>Is original or you have permission to share it</li>
            <li>Does not violate copyright or intellectual property rights</li>
            <li>Is appropriate for all audiences</li>
            <li>Does not contain explicit sexual content or violence</li>
            <li>Respects the privacy and dignity of others</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>6. Privacy and Data Protection</h2>
          <p>
            Your privacy is important to us. Please review our <Link href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>, 
            which also governs your use of the Service, to understand our practices.
          </p>
        </section>

        <section className="terms-section">
          <h2>7. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by TalkHub and are protected by 
            international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
          <p>
            You retain ownership of content you post, but grant us a license to use, display, and distribute your content 
            as part of the Service.
          </p>
        </section>

        <section className="terms-section">
          <h2>8. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Service immediately, without prior notice, 
            for any reason, including breach of these Terms of Service.
          </p>
          <p>
            Upon termination, your right to use the Service will cease immediately. If you wish to terminate your account, 
            you may simply discontinue using the Service.
          </p>
        </section>

        <section className="terms-section">
          <h2>9. Limitation of Liability</h2>
          <p>
            In no event shall TalkHub, nor its directors, employees, partners, agents, suppliers, or affiliates, 
            be liable for any indirect, incidental, special, consequential, or punitive damages, including without 
            limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </p>
        </section>

        <section className="terms-section">
          <h2>10. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms of Service at any time. If a revision is material, 
            we will provide at least 30 days notice prior to any new terms taking effect.
          </p>
        </section>

        <section className="terms-section">
          <h2>11. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <div className="contact-info">
            <p>Email: technicalhassankhan.1@gmail.com</p>
            <p>Address: Street 123, City, Country</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
