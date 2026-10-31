import {BrowserRouter, Routes, Route, useParams} from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";

function TempMeetingPage() {
    const {id} = useParams();
    return <div>
        <h1>Successful creation and navigation to:</h1>
        <h2> /m/{id}</h2>
    </div>
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/m/:id" element={<TempMeetingPage/>}/>
            </Routes>
        </BrowserRouter>
    )
        ;
}
