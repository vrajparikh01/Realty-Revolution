import logo from "../images/logo.png";

const Navigation = ({ account, setAccount }) => {
  const connectHandler = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } catch (err) {
        console.log(err);
      }
    }
  };
  return (
    <nav>
      <ul className="nav__links">
        <li>
          <a href="#">Buy</a>
        </li>
        <li>
          <a href="#">Rent</a>
        </li>
        <li>
          <a href="#">Sell</a>
        </li>
      </ul>

      <div className="nav__brand">
        <img src={logo} alt="logo" />
        <h2>RealtyRevolution</h2>
      </div>

      {account ? (
        <button className="nav__connect" type="button">
          {account.slice(0, 6) + "..." + account.slice(38, 42)}{" "}
        </button>
      ) : (
        <button className="nav__connect" type="button" onClick={connectHandler}>
          Connect
        </button>
      )}
    </nav>
  );
};

export default Navigation;
