import React, { useEffect, useState } from 'react';
import { history } from 'umi';
import Header from './components/Header';
import Banner from './components/Banner';
import GameCollection from './components/GameCollection';
import Features from './components/Features';
import Footer from './components/Footer';
import './index.css';

const TrangGioiThieu: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load CSS files
    const loadCSS = (href: string) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    };

    // Load template CSS files
    const cssFiles = [
      '/assets/css/animate.css',
      '/assets/css/flex-slider.css', 
      '/assets/css/fontawesome.css',
      '/assets/css/owl.css',
      '/assets/css/templatemo-liberty-market.css'
    ];

    cssFiles.forEach(loadCSS);

    // Preloader timer
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      // Clean up CSS when component unmounts
      cssFiles.forEach(href => {
        const link = document.querySelector(`link[href="${href}"]`);
        if (link) {
          document.head.removeChild(link);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      // Load scripts after preloader
      const loadScriptsSequentially = async () => {
        const scripts = [
          '/vendor/jquery/jquery.min.js',
          '/vendor/bootstrap/js/bootstrap.min.js',
          '/assets/js/isotope.min.js',
          '/assets/js/owl-carousel.js',
          '/assets/js/tabs.js',
          '/assets/js/popup.js',
          '/assets/js/custom.js'
        ];

        for (const src of scripts) {
          try {
            await new Promise<void>((resolve, reject) => {
              // Check if script already exists
              if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
              }

              const script = document.createElement('script');
              script.src = src;
              script.onload = () => resolve();
              script.onerror = () => reject(new Error(`Failed to load ${src}`));
              document.body.appendChild(script);
            });
          } catch (error) {
            console.warn(`Failed to load script: ${src}`, error);
          }
        }

        // Initialize plugins after all scripts loaded
        setTimeout(() => {
          if (window.jQuery) {
            try {
              // Initialize Owl Carousel
              window.jQuery('.owl-banner').owlCarousel({
                items: 1,
                loop: true,
                dots: false,
                nav: true,
                autoplay: true,
                autoplayTimeout: 5000,
                margin: 0,
                responsive: {
                  992: { items: 1 }
                }
              });
            } catch (error) {
              console.warn('Failed to initialize carousel:', error);
            }
          }
        }, 500);
      };

      loadScriptsSequentially();
    }
  }, [loading]);

  if (loading) {
    return (
      <div id="js-preloader" className="js-preloader">
        <div className="preloader-inner">
          <span className="dot"></span>
          <div className="dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="liberty-market-template">
      <Header />
      <Banner />
      <GameCollection />
      <Features />
      <Footer />
    </div>
  );
};

export default TrangGioiThieu;