import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";

function Contact() {
  const email = "essenza.store.perfume@gmail.com";

  return (
    <>
      <Navbar />

      <main className="contact-page">
        {/* Hero Section */}
        <section className="contact-hero">
          <p className="contact-small-title">GET IN TOUCH</p>

          <h1>
            LET'S
            <br />
            CONNECT
          </h1>

          <p className="contact-intro">
            Have a question about ESSENZA, our fragrances, or your order?
            We'd love to hear from you.
          </p>
        </section>

        {/* Contact Section */}
        <section className="contact-section">
          <div className="contact-section-title">
            <span>01</span>
            <h2>CONTACT US</h2>
          </div>

          <div className="contact-content">
            <p>
              For any questions, enquiries, feedback, or assistance, you can
              reach the ESSENZA team directly through email.
            </p>

            <a
              href={`mailto:${email}`}
              className="contact-email"
            >
              {email}
            </a>

            <a
              href={`mailto:${email}`}
              className="contact-button"
            >
              MAIL US
            </a>
          </div>
        </section>

        {/* Brand Message */}
        <section className="contact-message">
          <p>
            WE'RE HERE
            <br />
            TO HELP.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Contact;
