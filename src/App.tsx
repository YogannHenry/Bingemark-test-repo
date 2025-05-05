import { BookmarkProvider } from "./context/BookmarkContext";
import Dashboard from "./components/Dashboard";

function App() {

  return (
    <BookmarkProvider>
      <Dashboard />
    </BookmarkProvider>
  );
}

export default App;
