import { Routes, Route } from 'react-router-dom';
import LandingPage from "./screens/LandingPage";

function App() {

  return (
    <>
      <Routes>
        <Route element={<LandingPage/>} path="/" />
      </Routes>
    </>
  )
}

export default App
