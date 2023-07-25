import { useEffect, useState } from "react";
import { ethers } from "ethers";

import Navigation from "./components/Navigation";
import Home from "./components/Home";
import Search from "./components/Search";

import RealEstate from "./abi/RealEstate.json";
import Escrow from "./abi/Escrow.json";

import config from "./config.json";

function App() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState("");
  const [escrow, setEscrow] = useState("");
  const [homes, setHomes] = useState([]);

  const loadBlockchainData = async () => {
    // connect to metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    console.log(provider);

    let network = await provider.getNetwork();

    // console.log(config[network.chainId].escrow.address);
    // console.log(config[network.chainId].realEstate.address);

    // load both contracts
    const realEstate = new ethers.Contract(
      config[network.chainId].realEstate.address,
      RealEstate,
      provider
    );
    const totalSupply = await realEstate.totalSupply();
    // console.log(totalSupply.toString());

    const homes = [];

    for (let i = 0; i < totalSupply; i++) {
      const uri = await realEstate.tokenURI(i);
      const home = await fetch(uri);
      const homeJSON = await home.json();
      homes.push(homeJSON);
    }
    setHomes(homes);
    console.log(homes);

    const escrow = new ethers.Contract(
      config[network.chainId].escrow.address,
      Escrow,
      provider
    );
    setEscrow(escrow);

    // get the metamask account connected to app
    const accounts = await provider.listAccounts();
    console.log(accounts[0]);

    window.ethereum.on("accountsChanged", async () => {
      const accounts = await provider.listAccounts();
      setAccount(accounts[0]);
    });
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />
      <div className="cards__section">
        <h3>Properties for you</h3>
        <hr />
        <div className="cards">
          {homes.map((home, index) => (
            <div className="card" key={index}>
              <div className="card__image">
                <img src={home.image} alt="Home" />
              </div>
              <div className="card__info">
                <h4>{home.attributes[0].value} ETH</h4>
                <p>
                  <strong>{home.attributes[2].value}</strong> bds |
                  <strong>{home.attributes[3].value}</strong> ba |
                  <strong>{home.attributes[4].value}</strong> sqft
                </p>
                <p>{home.address}</p>
              </div>
            </div>
          ))}
          <div className="card">
            <div className="card__image">
              <img src="" alt="Home" />
            </div>
            <div className="card__info">
              <h4>2 ETH</h4>
              <p>
                <strong>3</strong> beds
                <strong>2</strong> baths
                <strong>1,200</strong> sqft
              </p>
              <p>1234 Main St, San Francisco, CA 94123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
