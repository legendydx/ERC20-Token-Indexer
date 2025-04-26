import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import "./App.css"
import Home from "./Pages/Home";
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import TokenWallet from './Pages/Tokenwallet';
import TokenSelection from './Pages/TokenSelectionPage';



function App(){
  return(
    <>
    <BrowserRouter>
    <Routes>
    <Route index element={<TokenWallet/>} />
    <Route path="tokenselection" element={<TokenSelection/>} />
    <Route path="/home" element={<Home/>}/>
     <Route path="/signup" element={<Signup/>} />
     <Route path="/login" element={<Login/>} />
     
   


    </Routes>
    </BrowserRouter>
    </>
  )
}


export default App;