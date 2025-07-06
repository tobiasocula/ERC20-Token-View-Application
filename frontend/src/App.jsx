
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

  const findAccIndex = (id) => {
        for (let i=0; i<accounts.length; i++) {
            if (accounts[i].id === id) {
                return i;
            }
        }
    }

  console.log(`address: ${accounts[0].address}`);

  return (
    <>
      <h1 className='title'>Welcome</h1>
      <div className='accounts'>
        {accounts.map((acc) => (
          <div className='account' key={acc.id}>

            {accounts.length > 1 && (
              <div className='remove-acc-container'>
              <div className='remove-account' onClick={() => removeAccount(findAccIndex(acc.id))}>
                Remove
            </div>
            </div>
            )}
            

            <div className='acc-title'>Address</div>
            <form className='form' onSubmit={async (e) => {
                  e.preventDefault();

                  const index = findAccIndex(acc.id);
                  setAccStates((prev) => setVal(prev, 1, index)); // to loading
                  await new Promise((resolve) => setTimeout(resolve, 0));

                  if (!ethers.utils.isAddress(accAddresses[index])) {
                    setAccStates((prev) => setVal(prev, 2, index)); // Invalid address
                  } else if (await setData(index, accAddresses[index], accNetworks[index])) {
                    setAccStates((prev) => setVal(prev, 4, index)); // Success
                  } else {
                    setAccStates((prev) => setVal(prev, 3, index));; // Failure
                  }
                }}>
              <input className='input' type="text" value={accAddresses[findAccIndex(acc.id)]} onChange={
                (e) => {
                  setAccAddresses((prev) => setVal(prev, e.target.value, findAccIndex(acc.id)));
                }
              }></input>
              <button className='form-button' type="submit">Search</button>
            </form>
            
            <div className='networks-div'>
              Select network
              <select
                  className="networks"
                  value={accNetworks[findAccIndex(acc.id)]}
                  onChange={(e) => {
              setAccNetworks((prev) => setVal(prev, e.target.value, findAccIndex(acc.id)));
            }}>
                {Object.keys(networkValues).map((k) => (
                  <option key={k} value={networkValues[k]}>{networkValues[k]}</option>
                ))}
                </select>
              </div>



            <div className='acc-data'>
              {accStates[findAccIndex(acc.id)] === 4 && acc.data ? (
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
                accStates[findAccIndex(acc.id)] === 1 ? (
                  <div className='loading'>Loading...</div>
                ) : (
                  accStates[findAccIndex(acc.id)] === 2 ? (
                    <div className='incor-addr'>Incorrect address!</div>
                  ) : (
                    accStates[findAccIndex(acc.id)] === 3 ? (
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
          <div className='add-account-frame'>
          <img className='add-acc-button' onClick={addAccount} src='/plus.png' alt="plus image" />
          </div>
        </div>
      </div>
    </>
  )
}

export default App
