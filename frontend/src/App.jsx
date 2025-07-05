
import './App.css'

import { useMyContext } from './context';
import { useState } from 'react';
import { Utils } from 'alchemy-sdk';
import { ethers } from 'ethers';

function zip(arr1, arr2) {
    let result = [];
    for (let i = 0; i < Math.min(arr1.length,
                    arr2.length); i++) {
        result.push([arr1[i], arr2[i]]);
    }
    return result;
}

function setVal(arr, newVal, index) {
  if (index === 0) {
    return [newVal, ...arr.slice(1,arr.length)];
  }
  return [...arr.slice(0,index), newVal, ...arr.slice(index+1,arr.length)];
}


function App() {



  const {accounts, addAccount, setData, removeAccount} = useMyContext();
  const [accAddresses, setAccAddresses] = useState([""]);
  const [accStates, setAccStates] = useState([0]);
  const [accNetworks, setAccNetworks] = useState(["Mainnet"]);

  const networkValues = {mainnet: "Mainnet", sepolia: "Sepolia"};

  // Not yet fetched!
  // Loading...
  // Incorrect address!
  // An error occured. Try again later.
  // (fetched)
  console.log(`address: ${accounts[0].address}`);

  return (
    <>
      <h1 className='title'>Welcome</h1>
      <div className='accounts'>
        {accounts.map((acc) => (
          <div className='account' key={acc.id}>

            {accounts.length > 1 && (
              <div className='remove-acc-container'>
              <div className='remove-account' onClick={() => removeAccount(acc.id)}>
                Remove
            </div>
            </div>
            )}
            

            <div className='acc-title'>Address</div>
            <form className='form' onSubmit={async (e) => {
                  e.preventDefault();

                  setAccStates((prev) => setVal(prev, 1, acc.id)); // to loading
                  await new Promise((resolve) => setTimeout(resolve, 0));

                  if (!ethers.isAddress(accAddresses[acc.id])) {
                    setAccStates((prev) => setVal(prev, 2, acc.id)); // Invalid address
                  } else if (await setData(acc.id, accAddresses[acc.id], accNetworks[acc.id])) {
                    setAccStates((prev) => setVal(prev, 4, acc.id)); // Success
                  } else {
                    setAccStates((prev) => setVal(prev, 3, acc.id));; // Failure
                  }
                }}>
              <input className='input' type="text" value={accAddresses[acc.id]} onChange={
                (e) => {
                  setAccAddresses((prev) => setVal(prev, e.target.value, acc.id));
                }
              }></input>
              <button className='form-button' type="submit">Search</button>
            </form>
            
            <div className='networks-div'>
              Select network
              <select
                  className="networks"
                  value={accNetworks[acc.id]}
                  onChange={(e) => {
              setAccNetworks((prev) => setVal(prev, e.target.value, acc.id));
            }}>
                {Object.keys(networkValues).map((k) => (
                  <option key={k} value={networkValues[k]}>{networkValues[k]}</option>
                ))}
                </select>
              </div>



            <div className='acc-data'>
              {accStates[acc.id] === 4 && acc.data ? (
                <div className='acc-loaded-data'>
                  Data:
                  <div className='token-data-section'>
                    <div className='bold-text'>
                      Address: 
                    </div>
                    <div className='normal-text'>
                      {acc.address}
                    </div>
                  </div>
                  {zip(acc.data, [...Array(Object.keys(acc.data).length).keys()]).map(
                    ([field, n]) => (
                    <div className='token-data' key={n}>
                      <div className='token-data-section'>
                        <div className='bold-text'>
                        Symbol: 
                        </div>
                        <div className='normal-text'>
                        {field.symbol}
                        </div>
                      </div>
                      <div className='token-data-section'>
                        <div className='bold-text'>
                        Name: 
                        </div>
                        <div className='normal-text'>
                        {field.name}
                        </div>
                      </div>
                      <div className='token-data-section'>
                        <div className='bold-text'>
                        Balance: 
                        </div>
                        <div className='normal-text'>
                        {
                        Utils.formatUnits(field.balance, field.decimals)
                        }
                        </div>
                         
                      </div>
                    </div>

                  ))}
                  </div>
              )
               : (
                accStates[acc.id] === 1 ? (
                  <div className='loading'>Loading...</div>
                ) : (
                  accStates[acc.id] === 2 ? (
                    <div className='incor-addr'>Incorrect address!</div>
                  ) : (
                    accStates[acc.id] === 3 ? (
                      <div className='error'>An error occured. Try again later.</div>
                    ) : (
                      <div className='nothing'>Nothing here yet.</div>
                    )
                  )
                )
                
              )}
            </div> 
          </div>
        ))}
        <div className='add-account'>
          <img className='add-acc-button' onClick={addAccount} src='/plus.png' alt="plus image" />
        </div>
      </div>
    </>
  )
}

export default App
