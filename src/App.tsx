import appStyle from './App.module.scss';

export interface AppProps {}

const App = (props: AppProps) => {
  return (
    <div className={` ${appStyle.wrapper}`}>
      <h1>PHAROS</h1>
      <p>Iteration 1 prototype</p>

      <div style={{ marginTop: '1rem' }}>
        <p>Map placeholder</p>
        <p>Sidebar placeholder</p>
      </div>
    </div>
  );
};

export default App;
