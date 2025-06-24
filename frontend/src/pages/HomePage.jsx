import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: '🏠',
      title: 'Door-to-Door Service',
      description: 'We pickup and deliver directly to your location for maximum convenience.'
    },
    {
      icon: '⚡',
      title: 'Express Options',
      description: 'Choose from Standard, Express, or Premium delivery options to fit your needs.'
    },
    {
      icon: '💎',
      title: 'Quality Guaranteed',
      description: 'Professional cleaning with satisfaction guarantee and quality you can trust.'
    },
    {
      icon: '💰',
      title: 'Transparent Pricing',
      description: 'Know exactly what you pay with our clear, upfront pricing structure.'
    },
    {
      icon: '📱',
      title: 'Real-time Tracking',
      description: 'Track your order status in real-time from pickup to delivery.'
    },
    {
      icon: '⭐',
      title: 'Customer Reviews',
      description: 'Rate and review our services to help us continuously improve.'
    }
  ];

  const services = [
    {
      name: 'Standard Service',
      price: 'KSH 200/kg',
      duration: '48 hours',
      description: 'Perfect for regular laundry needs',
      features: ['Professional washing', 'Expert ironing', 'Quality guarantee'],
      popular: false
    },
    {
      name: 'Express Service',
      price: 'KSH 300/kg',
      duration: '24 hours',
      description: 'When you need it fast',
      features: ['Priority processing', 'Same-day service', 'Express delivery'],
      popular: true
    },
    {
      name: 'Premium Service',
      price: 'KSH 400/kg',
      duration: '72 hours',
      description: 'Luxury care for delicate items',
      features: ['Delicate fabric care', 'Premium treatment', 'Special handling'],
      popular: false
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background"></div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title animate-fadeIn">
                Kenya's Premier
                <span className="text-gradient"> Door-to-Door</span>
                <br />Laundry Service
              </h1>
              <p className="hero-description animate-fadeIn">
                Say goodbye to crowded laundry shops and long waiting times. 
                Order online, we pickup from your doorstep, clean professionally, 
                and deliver fresh clothes back to you.
              </p>
              <div className="hero-actions animate-fadeIn">
                {!isAuthenticated ? (
                  <>
                    <Link to="/register" className="btn btn-primary btn-large">
                      Start Your First Order
                    </Link>
                    <Link to="/login" className="btn btn-secondary btn-large">
                      I Have an Account
                    </Link>
                  </>
                ) : (
                  <Link to="/dashboard" className="btn btn-primary btn-large">
                    Go to Dashboard
                  </Link>
                )}
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-graphic">
                <div className="floating-icon">🧺</div>
                <div className="floating-icon">👕</div>
                <div className="floating-icon">🚚</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header text-center">
            <h2>Why Choose LaundryConnect?</h2>
            <p>Experience the future of laundry services with our comprehensive platform</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card animate-fadeIn hover-lift">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header text-center">
            <h2>How LaundryConnect Works</h2>
            <p>Three simple steps to fresh, clean clothes</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Place Order Online</h3>
                <p>Select service type, estimate weight, set your location, and schedule pickup</p>
              </div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>We Pickup & Clean</h3>
                <p>Our team collects your clothes, weighs them accurately, and cleans professionally</p>
              </div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Fresh Delivery</h3>
                <p>Clean, fresh clothes delivered back to your doorstep at the scheduled time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing">
        <div className="container">
          <div className="section-header text-center">
            <h2>Transparent Pricing</h2>
            <p>Choose the service level that fits your needs and budget</p>
          </div>
          <div className="pricing-grid">
            {services.map((service, index) => (
              <div key={index} className={`pricing-card ${service.popular ? 'popular' : ''}`}>
                {service.popular && <div className="popular-badge">Most Popular</div>}
                <div className="pricing-header">
                  <h3>{service.name}</h3>
                  <div className="price">{service.price}</div>
                  <div className="duration">{service.duration} turnaround</div>
                  <p className="description">{service.description}</p>
                </div>
                <ul className="features-list">
                  {service.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="check-icon">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link 
                  to={isAuthenticated ? "/customer/place-order" : "/register"} 
                  className="btn btn-primary"
                >
                  Choose Plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content text-center">
            <h2>Ready to Experience Convenience?</h2>
            <p>Join thousands of satisfied customers across Kenya</p>
            <Link 
              to={isAuthenticated ? "/dashboard" : "/register"} 
              className="btn btn-primary btn-large"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Today"}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>🧺 LaundryConnect Kenya</h3>
              <p>Transforming laundry services across Kenya with convenience, quality, and reliability.</p>
            </div>
            <div className="footer-section">
              <h4>Services</h4>
              <ul>
                <li>Washing & Ironing</li>
                <li>Express Delivery</li>
                <li>Premium Care</li>
                <li>Pickup & Delivery</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li>Contact Us</li>
                <li>Help Center</li>
                <li>Track Order</li>
                <li>FAQs</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li>About Us</li>
                <li>Careers</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2023 LaundryConnect Kenya. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;