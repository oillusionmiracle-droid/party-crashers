import React from 'react';
import { createRoot } from 'react-dom/client';
import { Onboarding } from './onboarding/Onboarding';

function finishOnboarding(action) {
  // The flow is reusable: replace this callback with your app router/auth flow.
  try { localStorage.setItem('pc-onboarding-v2', 'complete'); } catch {}
  window.location.assign(action === 'start' ? '/discover.html?setup=1' : '/discover.html?browse=1');
}

createRoot(document.getElementById('root')).render(<Onboarding onComplete={finishOnboarding} />);
