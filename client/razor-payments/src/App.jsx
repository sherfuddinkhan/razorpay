import { useState } from 'react'
import PaymentButton from './Components/PaymentButton'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <PaymentButton/>
    </>
  )
}

export default App
