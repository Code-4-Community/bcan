/**
 * App.tsx
 * Renders with <AnimatedRoutes />.
 */
import "./App.css";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { BrowserRouter as Router } from "react-router-dom";
import { observer } from "mobx-react-lite";

// Register store and mutators
import "./external/bcanSatchel/mutators";
import AnimatedRoutes from "./animations/AnimatedRoutes";
import Footer from "./grant-info/components/Footer";

/**
 * Main app component that renders animated routes
 */
const App = observer(() => {
  return (
    <Router>
      <ChakraProvider value={defaultSystem}>
        <div className="app-wide">
        <div className="app-container">
          <AnimatedRoutes />
        </div>
        <Footer/>
        </div>
      </ChakraProvider>
    </Router>
  );
});

export default App;
