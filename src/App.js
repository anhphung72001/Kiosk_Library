import './App.scss';
import Header from './page/Header'
import ListProduct from './page/ListProduct';
import GridProduct from './page/GridProduct';

function App() {
  return (
    <div className="App">
      <Header/>
      {/* <ListProduct/> */}
      <GridProduct/>
    </div>
  );
}

export default App;
