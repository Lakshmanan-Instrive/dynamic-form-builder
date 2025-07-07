import { BrowserRouter, Route, Routes } from "react-router-dom";
import DynamicFormGenerator from "./components/DynamicFormGenerator";
import FormPreview from "./components/FormPreview";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DynamicFormGenerator />} />
        <Route path="/preview" element={<FormPreview />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
