'use client';

import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-gray-700 mb-4">
        This Privacy Policy describes how ModernMen Salon collects, uses, and discloses your Personal Information when you visit or make a purchase from the Site.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Collection of Personal Information</h2>
      <p className="text-gray-700 mb-4">
        When you visit the Site, we collect certain information about your device, your interaction with the Site, and information necessary to process your purchases. We may also collect additional information if you contact us for customer support. In this Privacy Policy, we refer to any information that can uniquely identify an individual (including the information below) as “Personal Information”. See the list below for more information about what Personal Information we collect and why.
      </p>

      <h3 className="text-xl font-semibold mb-2">Examples of Personal Information Collected:</h3>
      <ul className="list-disc list-inside text-gray-700 mb-4">
        <li>Device information: version of web browser, IP address, time zone, cookie information, what sites or products you view, search terms, and how you interact with the Site.</li>
        <li>Order information: your name, billing address, shipping address, payment information (including credit card numbers), email address, and phone number.</li>
        <li>Customer support information: name, email, phone number, and description of the inquiry.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-3">Sharing Personal Information</h2>
      <p className="text-gray-700 mb-4">
        We share your Personal Information with service providers to help us provide our services and fulfill our contracts with you, as described above. For example:
      </p>
      <ul className="list-disc list-inside text-gray-700 mb-4">
        <li>We use Payload CMS to power our online store. You can read more about how Payload uses your Personal Information here: [Link to Payload CMS Privacy Policy if applicable].</li>
        <li>We may share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-3">Your Rights</h2>
      <p className="text-gray-700 mb-4">
        If you are a European resident, you have the right to access Personal Information we hold about you and to ask that your Personal Information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
      <p className="text-gray-700 mb-4">
        For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at [Your Email Address] or by mail using the details provided below:
      </p>
      <p className="text-gray-700">
        [Your Business Name]<br/>
        [Your Business Address]<br/>
        [Your City, Postal Code, Country]
      </p>

      <p className="text-red-500 mt-8">
        <strong>NOTE: This is a placeholder Privacy Policy. Please consult with a legal professional to draft a comprehensive and legally compliant Privacy Policy for your specific business operations.</strong>
      </p>
    </div>
  );
}