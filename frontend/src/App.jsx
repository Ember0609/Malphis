import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Layout from './components/Layout';
import Home from './pages/Home';
import MLExplanation from './pages/MLExplanation';
import NNExplanation from './pages/NNExplanation';
import MalwareTest from './pages/MalwareTest';
import URLTest from './pages/URLTest';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="ml-explanation" element={<MLExplanation />} />
            <Route path="nn-explanation" element={<NNExplanation />} />
            <Route path="test-malware" element={<MalwareTest />} />
            <Route path="test-url" element={<URLTest />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
