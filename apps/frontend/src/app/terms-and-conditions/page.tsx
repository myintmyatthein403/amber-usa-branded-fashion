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

export default async function TermsAndConditions() {
  const settings = await getSettings();

  return (
    <main className="relative min-h-screen bg-[#FDFDFD]">
      <Navbar />
      
      <div className="pt-48 pb-32 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="space-y-4 mb-16 text-center">
          <span className="text-[#D4AF37] text-[10px] uppercase font-bold tracking-[0.4em]">Legal</span>
          <h1 className="text-5xl md:text-7xl font-serif text-[#1A1A1A]">Terms & Conditions</h1>
        </div>

        <div className="prose prose-sm md:prose-base max-w-none text-[#1A1A1A]/70 font-sans leading-relaxed">
          {settings?.termsConditions ? (
            <div dangerouslySetInnerHTML={{ __html: settings.termsConditions }} />
          ) : (
            <div className="space-y-8">
              <section className="space-y-4">
                <h2 className="text-xl font-serif text-[#1A1A1A] uppercase tracking-wider">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using this website, you accept and agree to be bound by the terms and provision of 
                  this agreement. In addition, when using these particular services, you shall be subject to any 
                  posted guidelines or rules applicable to such services.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-serif text-[#1A1A1A] uppercase tracking-wider">2. Product Information</h2>
                <p>
                  We attempt to be as accurate as possible in the description of our products. However, we do not 
                  warrant that product descriptions or other content of this site are accurate, complete, reliable, 
                  current, or error-free. 
                </p>
                <p>
                  Prices and availability of products are subject to change without notice. All prices are in Myanmar Kyat (MMK).
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-serif text-[#1A1A1A] uppercase tracking-wider">3. Authenticity Guarantee</h2>
                <p>
                  Amber Brand Fashion guarantees that all items sold on our platform are 100% authentic and imported 
                  directly from the USA. We take authenticity very seriously and stand behind every product we sell.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-serif text-[#1A1A1A] uppercase tracking-wider">4. Ordering & Payment</h2>
                <p>
                  When you place an order, you are making an offer to purchase the products. We reserve the right to 
                  accept or decline your offer for any reason. Payment must be made through our authorized payment 
                  channels at the time of order or upon delivery as specified.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-serif text-[#1A1A1A] uppercase tracking-wider">5. Shipping & Delivery</h2>
                <p>
                  Delivery times are estimates and start from the date of shipping, rather than the date of order. 
                  We are not responsible for delivery delays beyond our control. Shipping costs and delivery 
                  methods will be specified during the checkout process.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-serif text-[#1A1A1A] uppercase tracking-wider">6. Returns & Refunds</h2>
                <p>
                  Due to the nature of imported goods, returns are only accepted for defective items or incorrect 
                  shipments reported within 48 hours of delivery. Please contact our concierge team for assistance 
                  with any issues.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-serif text-[#1A1A1A] uppercase tracking-wider">7. Limitation of Liability</h2>
                <p>
                  In no event shall Amber Brand Fashion be liable for any special, direct, indirect, consequential, 
                  or incidental damages or any damages whatsoever, whether in an action of contract, negligence or 
                  other tort, arising out of or in connection with the use of the Service or the contents of the Service.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-serif text-[#1A1A1A] uppercase tracking-wider">8. Changes to Terms</h2>
                <p>
                  We reserve the right to change these terms from time to time as we see fit and your continued 
                  use of the site will signify your acceptance of any adjustment to these terms.
                </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
