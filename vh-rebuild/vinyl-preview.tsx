import { createRoot } from 'react-dom/client';
import { VinylTour } from './components/vinyl-tour';
import './styles/globals.css';
import './styles/vinyl-tour.css';

createRoot(document.getElementById('root')!).render(<main className="vinyl-preview"><header className="vinyl-preview-nav"><button className="glass glass-action silver-trace" onClick={()=>{if(history.length>1)history.back();else location.href="./";}}>Back</button><span>Interaction preview</span></header><VinylTour/></main>);

