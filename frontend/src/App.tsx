/**
 * App.tsx
 *
 * Replaces your direct <Routes> usage with <AnimatedRoutes />.
 */
import "./App.css";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { BrowserRouter as Router } from "react-router-dom";
import { observer } from "mobx-react-lite";

// Register store and mutators
import "./external/bcanSatchel/mutators";
import { useAuthContext } from "./context/auth/authContext";
import AnimatedRoutes from "./animations/AnimatedRoutes";

const App = observer(() => {
  const { isAuthenticated } = useAuthContext();

  return (
    <Router>
      <ChakraProvider value={defaultSystem}>
        <div className="app-container">
          {/* Renders your entire route structure with transitions */}
          <AnimatedRoutes />
        </div>
      </ChakraProvider>
    </Router>
  );
});

export default App;
