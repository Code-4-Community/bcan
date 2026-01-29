/**
 * App.tsx
 * Renders with <AppRoutes />.
 */
import "./styles/App.css";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { BrowserRouter as Router } from "react-router-dom";
import { observer } from "mobx-react-lite";

// Register store and mutators
import "./external/bcanSatchel/mutators";
import AppRoutes from "./routes/AppRoutes";
import Footer from "./main-page/Footer";

/**
 * Main app component that renders routes
 */
const App = observer(() => {
  return (
    <Router>
      <ChakraProvider value={defaultSystem}>
        <div className="app-wide">
        <div className="app-container">
          <AppRoutes />
        </div>
        <Footer/>
        </div>
      </ChakraProvider>
    </Router>
  );
});

export default App;
