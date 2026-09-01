import { getPortfolioSummary } from './lib/portfolio';

// Placeholder only — proves the data/lib/services foundation compiles and wires
// together end to end. Real screens are built in a later phase.
function App() {
  const summary = getPortfolioSummary();

  return (
    <pre>
      {JSON.stringify(summary, null, 2)}
    </pre>
  );
}

export default App;
