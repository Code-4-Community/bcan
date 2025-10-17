// will later be renamed to "GrantContext" when front/backend schemas are aligned
import { createContext } from "react";

// Define the shape of the context
interface StatusContextType {
    curStatus: string;
    setCurStatus: React.Dispatch<React.SetStateAction<string>>;
}


export const StatusContext = createContext<StatusContextType>({
    curStatus: "",
    setCurStatus: () => {}, // No-op function as default
});