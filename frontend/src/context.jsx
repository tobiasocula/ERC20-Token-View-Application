import { createContext, useState, useContext, useEffect } from 'react';
import { Alchemy, Network } from 'alchemy-sdk';

const Context = createContext();

export const useMyContext = () => useContext(Context)

export const ContextProvider = ({ children }) => {

    const [accounts, setAccounts] = useState([{
        address: "",
        id: 0,
        data: null
    }]);

    useEffect(() => {
        const storedAccounts = localStorage.getItem("accounts")
        if (storedAccounts) {setAccounts(JSON.parse(storedAccounts))}
    }, [])

    useEffect(() => {
        // every time the favourites change -> update local storage
        // JSON.stringify = inverse operation of JSON.parse
        localStorage.setItem('accounts', JSON.stringify(accounts))
    }, [accounts])

    const addAccount = () => {
        setAccounts((prev) => [...prev, {
            address: "",
            id: prev[prev.length-1].id+1,
            data: null
        }]);
    }
    const removeAccount = (index) => {
        console.log(`removing account ${index}`)
        setAccounts((prev) => [
            ...prev.slice(0,index),
            ...prev.slice(index+1,prev.length)
        ]);
    }
    const setAddr = (index, addr) => {
        if (index !== 0) {
        setAccounts((prev) => [
            ...prev.slice(0,index),
            {address: addr, id: prev[index].id, data: prev[index].data},
            ...prev.slice(index+1,prev.length)
        ])
        } else {
            setAccounts((prev) => [
                {address: addr, id: prev[index].id, data: prev[index].data},
                ...prev.slice(1,prev.length)
            ])
        }
    }

    
    const setData = async (index, addr, network) => {
        let actualNetwork;
        if (network === "Mainnet") {
            actualNetwork = Network.ETH_MAINNET;
        } else {
            actualNetwork = Network.ETH_SEPOLIA;
        }
      const config = {
        apiKey: 'YNaf7MtOQ7bue4DBaeY8hBkuroqOc_c7',
        network: actualNetwork //Network.ETH_MAINNET,
      };
      console.log('test!')
      const alchemy = new Alchemy(config);
      console.log(`index: ${index}`)
      const data = await alchemy.core.getTokenBalances(addr);
      console.log('test!')
      setAddr(index, addr);

      const tokenDataPromises = [];
      for (let i = 0; i < data.tokenBalances.length; i++) {
        const tokenData = alchemy.core.getTokenMetadata(
            data.tokenBalances[i].contractAddress
        );
        tokenDataPromises.push(tokenData);
        }
    
        const td = await Promise.all(tokenDataPromises);
        //console.log(td); // array
        // const t = td[0];
        // console.log(t); // is object with symb, name, ...
        // console.log(td.length);
        // console.log(data.tokenBalances.length);

        const finalData = [];
        for (let i=0; i<data.tokenBalances.length; i++) {
            finalData.push({
                symbol: td[i].symbol,
                name: td[i].name,
                decimals: td[i].decimals,
                balance: data.tokenBalances[i].tokenBalance
            })
        }

        //set data
        setAccounts((prev) => [
            ...prev.slice(0,index), {
            address: prev[index].address,
            id: prev[index].id,
            data: finalData
            },
            ...prev.slice(index+1,prev.length)
        ])
        return true;
    }

    const value = {
        accounts, addAccount, setData, removeAccount
    }
    return (
        <Context.Provider value={value}>{children}</Context.Provider>
    )

}