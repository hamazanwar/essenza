import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";

function About() {
  return (
    <>
      <Navbar />

      <main className="about-page">
        {/* Hero Section */}
        <section className="about-hero">
          <p className="about-small-title">THE ESSENZA STORY</p>

          <h1>
            THE ART OF
            <br />
            FRAGRANCE
          </h1>

          <p className="about-hero-text">
            ESSENZA is a modern fragrance brand created for those who believe
            that a scent is more than a fragrance — it is a reflection of
            personality, memories, and individuality.
          </p>
        </section>

        {/* About Section */}
        <section className="about-introduction">
          <div className="about-section-title">
            <span>01</span>
            <h2>ABOUT ESSENZA</h2>
          </div>

          <div className="about-section-content">
            <p>
              ESSENZA was created with a simple idea: to make refined
              fragrances accessible to everyone. Our collection is designed
              around timeless scents, modern elegance, and everyday luxury.
            </p>

            <p>
              From fresh and energetic notes to deep and sophisticated
              compositions, ESSENZA offers fragrances designed for different
              personalities, occasions, and moods.
            </p>
          </div>
        </section>

        {/* Philosophy */}
        <section className="about-philosophy">
          <div className="about-section-title">
            <span>02</span>
            <h2>OUR PHILOSOPHY</h2>
          </div>

          <div className="philosophy-grid">
            <div className="philosophy-card">
              <h3>SIMPLICITY</h3>
              <p>
                We believe true elegance does not need to be complicated.
                ESSENZA focuses on clean, balanced, and timeless fragrance
                experiences.
              </p>
            </div>

            <div className="philosophy-card">
              <h3>IDENTITY</h3>
              <p>
                Every fragrance tells a story. Our collection is created to
                help you express your individuality through scent.
              </p>
            </div>

            <div className="philosophy-card">
              <h3>ELEGANCE</h3>
              <p>
                From the fragrance itself to the experience of discovering
                it, ESSENZA is inspired by modern luxury and understated
                elegance.
              </p>
            </div>
          </div>
        </section>

        {/* Collections */}
        <section className="about-collections">
          <div className="about-section-title">
            <span>03</span>
            <h2>OUR COLLECTIONS</h2>
          </div>

          <div className="collections-content">
            <div>
              <h3>MEN</h3>
              <p>
                Confident and distinctive fragrances created for a bold and
                refined presence.
              </p>
            </div>

            <div>
              <h3>WOMEN</h3>
              <p>
                Elegant and expressive compositions designed to celebrate
                individuality and sophistication.
              </p>
            </div>

            <div>
              <h3>UNISEX</h3>
              <p>
                Versatile fragrances created to move beyond traditional
                boundaries and complement every personality.
              </p>
            </div>
          </div>
        </section>

        {/* Brand Statement */}
        <section className="about-statement">
          <p>
            "YOUR FRAGRANCE.
            <br />
            YOUR IDENTITY."
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default About;
