import { siteData } from "../../data/site";

export const metadata = {
  title: `Privacy Policy | ${siteData.name}`,
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-display text-4xl md:text-5xl tracking-wide uppercase mb-8">
          Privacy Policy
        </h1>
        
        <div className="prose prose-invert prose-p:text-muted prose-a:text-ice hover:prose-a:text-ice-hover space-y-6">
          <p><em>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</em></p>
          
          <p>
            This Privacy Policy explains how {siteData.name} (&quot;I&quot;, &quot;me&quot;, or &quot;my&quot;) collects, uses, and protects your information when you visit <strong>{siteData.domain}</strong>.
          </p>

          <h2 className="text-xl font-semibold text-text mt-8 mb-4">1. Information I Collect</h2>
          <p>
            When you use the contact form on this website, I collect the following information:
          </p>
          <ul className="list-disc pl-6 text-muted space-y-2">
            <li>Your name</li>
            <li>Your email address</li>
            <li>Your selected service interest</li>
            <li>Any information you provide in the message field</li>
          </ul>

          <h2 className="text-xl font-semibold text-text mt-8 mb-4">2. How I Use Your Information</h2>
          <p>
            The information collected through the contact form is used solely to read and reply to your inquiry. I do not sell, rent, or share your personal data with any third parties for marketing purposes.
          </p>

          <h2 className="text-xl font-semibold text-text mt-8 mb-4">3. Analytics</h2>
          <p>
            This website uses Google Analytics 4 (GA4) and Vercel Analytics to measure traffic and usage trends. These tools may collect non-personally identifiable information such as your browser type, device type, and the pages you visit. This helps me improve the website&apos;s performance and user experience.
          </p>

          <h2 className="text-xl font-semibold text-text mt-8 mb-4">4. Data Deletion</h2>
          <p>
            If you would like me to delete any personal information you have submitted through the contact form, please email me at <a href={`mailto:${siteData.email}`}>{siteData.email}</a> with your request, and I will remove your data promptly.
          </p>
        </div>
      </div>
    </div>
  );
}
