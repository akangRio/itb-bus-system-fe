import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import MobileLayout from "./layouts/MobileLayout";

function App() {
  return (
    <BrowserRouter>
      <MobileLayout>
        <AppRoutes />
      </MobileLayout>
    </BrowserRouter>
  );
}

export default App;
