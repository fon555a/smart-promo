'use client'
import { useState } from "react"

const Counter = () => {
    const [count, setCount] = useState(0)

    return (
        <div className="text-5xl p-10">
            <button onClick={() => setCount(count + 1)}>
                Add
            </button>
            <p>Number {count}</p>
            <button onClick={() => setCount(count - 1)}>
                Subtract
            </button>
        </div>
    )
}
export default Counter