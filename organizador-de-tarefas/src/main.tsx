import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {MotionConfig} from 'motion/react';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* reducedMotion="user" honra prefers-reduced-motion em todo o motion:
        desliga desenho, pulso e escalonamento, e os estados finais aparecem
        direto. O cursor da pauta continua andando — é informação. */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
);
