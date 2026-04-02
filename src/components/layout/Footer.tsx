import Link from 'next/link';

export function Footer() {
  return (
    <footer className="ivg-footer">
      <div className="ivg-container">
        <div className="ivg-footer__top">
          <div className="ivg-footer__grid">
            <div className="ivg-footer__col-brand">
              <img src="/ivglogo.png" alt="IVG Logo" className="ivg-footer__logo" />
              <p className="ivg-footer__tagline">
                Premium e-liquids, serving over 100 countries globally.
              </p>
              <div className="ivg-footer__social">
                {/* Social icons placeholder */}
                <a href="#" className="ivg-footer__social-link" aria-label="Facebook">FB</a>
                <a href="#" className="ivg-footer__social-link" aria-label="Instagram">IG</a>
                <a href="#" className="ivg-footer__social-link" aria-label="Twitter">X</a>
              </div>
            </div>
            
            <div className="ivg-footer__col">
              <h3 className="ivg-footer__col-title">Portal</h3>
              <ul className="ivg-footer__links">
                <li><Link href="/dashboard" className="ivg-footer__link">Dashboard</Link></li>
                <li><Link href="/place-order" className="ivg-footer__link">Place Order</Link></li>
                <li><Link href="/my-orders" className="ivg-footer__link">My Orders</Link></li>
                <li><Link href="/support" className="ivg-footer__link">Support</Link></li>
              </ul>
            </div>

            <div className="ivg-footer__col">
              <h3 className="ivg-footer__col-title">About</h3>
              <ul className="ivg-footer__links">
                <li><Link href="/about" className="ivg-footer__link">About IVG</Link></li>
                <li><Link href="/distributors" className="ivg-footer__link">Distributors</Link></li>
                <li><Link href="/compliance" className="ivg-footer__link">Compliance</Link></li>
              </ul>
            </div>

            <div className="ivg-footer__col">
              <h3 className="ivg-footer__col-title">Legal</h3>
              <ul className="ivg-footer__links">
                <li><Link href="/terms" className="ivg-footer__link">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="ivg-footer__link">Privacy Policy</Link></li>
                <li><Link href="/cookie" className="ivg-footer__link">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="ivg-footer__bottom">
          <p className="ivg-footer__address">
            Acme Vape Limited (IVG) | Innovation House, PR1 1HD, United Kingdom
          </p>
          <p className="ivg-footer__warning">
            WARNING: This product contains nicotine. Nicotine is an addictive chemical. Only for use by adults 18+.
          </p>
          <p className="ivg-footer__copyright">
            &copy; {new Date().getFullYear()} Acme Vape Limited. All rights reserved. Code Site architecture by Devsinc.
          </p>
        </div>
      </div>
    </footer>
  );
}
