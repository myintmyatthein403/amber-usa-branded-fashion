import Navbar from "@/components/Navbar";

async function getSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export default async function PrivacyPolicy() {
  const settings = await getSettings();

  return (
    <main className="relative min-h-screen bg-[#FDFDFD]">
      <Navbar />
      
      <div className="pt-48 pb-32 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="space-y-4 mb-16 text-center">
          <span className="text-[#D4AF37] text-[10px] uppercase font-bold tracking-[0.4em]">Legal</span>
          <h1 className="text-5xl md:text-7xl font-serif text-[#1A1A1A]">Privacy Policy</h1>
        </div>

        <div className="prose prose-sm md:prose-base max-w-none text-[#1A1A1A]/70 font-sans leading-relaxed">
          {settings?.privacyPolicy ? (
            <div dangerouslySetInnerHTML={{ __html: settings.privacyPolicy }} />
          ) : (
            <div className="space-y-8">
              <section className="space-y-4">
                <h2 className="text-xl font-serif text-[#1A1A1A] uppercase tracking-wider">1. Introduction</h2>
                <p>
                  At Amber Brand Fashion, we respect your privacy and are committed to protecting your personal data. 
                  This privacy policy will inform you about how we look after your personal data when you visit our website 
                  (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-serif text-[#1A1A1A] uppercase tracking-wider">2. The Data We Collect</h2>
                <p>
                  Personal data, or personal information, means any information about an individual from which that person 
                  can be identified. We may collect, use, store and transfer different kinds of personal data about you 
                  which we have grouped together as follows:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Identity Data includes first name, last name, username or similar identifier.</li>
                  <li>Contact Data includes billing address, delivery address, email address and telephone numbers.</li>
                  <li>Financial Data includes payment card details.</li>
                  <li>Transaction Data includes details about payments to and from you and other details of products you have purchased from us.</li>
                  <li>Technical Data includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-serif text-[#1A1A1A] uppercase tracking-wider">3. How We Use Your Data</h2>
                <p>
                  We will only use your personal data when the law allows us to. Most commonly, we will use your personal 
                  data in the following circumstances:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>To register you as a new customer.</li>
                  <li>To process and deliver your order.</li>
                  <li>To manage our relationship with you.</li>
                  <li>To enable you to partake in a prize draw, competition or complete a survey.</li>
                  <li>To improve our website, products/services, marketing or customer relationships.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-serif text-[#1A1A1A] uppercase tracking-wider">4. Data Security</h2>
                <p>
                  We have put in place appropriate security measures to prevent your personal data from being accidentally 
                  lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to 
                  your personal data to those employees, agents, contractors and other third parties who have a business 
                  need to know.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-serif text-[#1A1A1A] uppercase tracking-wider">5. Contact Us</h2>
                <p>
                  If you have any questions about this privacy policy or our privacy practices, please contact our 
                  concierge team at hello@amberpremium.com.
                </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
