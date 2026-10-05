import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";

function Home() {
  return (
    <div className="home-main">
      <Navbar />

      {/* HERO SECTION */}
      <section className="home-hero">
        <div className="hero-content">
          <p className="hero-small-text">ESSENZA FRAGRANT</p>

          <h1>
            FIND YOUR
            <br />
            SIGNATURE SCENT
          </h1>

          <p className="hero-description">
            Discover elegant fragrances crafted for every personality and every
            moment.
          </p>

          <Link to="/shop" className="hero-button">
  SHOP COLLECTION →
</Link>
        </div>
      </section>

      {/* ABOUT */}
      <section className="home-about">
        <p>ABOUT ESSENZA</p>

        <h2>
          A FRAGRANCE FOR
          <br />
          EVERY MOMENT.
        </h2>

        <p>
          ESSENZA brings together carefully selected fragrances designed to
          express individuality, confidence and elegance.
        </p>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
