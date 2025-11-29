import Hero from '@/components/landing/Hero';
import { Helmet } from 'react-helmet-async';

const Landing = () => {
  return (
    <>
      <Helmet>
        <title>SME Event Copilot - AI-Powered Corporate Event Planning</title>
        <meta name="description" content="Plan corporate events in minutes with AI-powered optimization, automated scheduling, vendor matching, and risk analytics." />
      </Helmet>
      <main>
        <Hero />
      </main>
    </>
  );
};

export default Landing;
