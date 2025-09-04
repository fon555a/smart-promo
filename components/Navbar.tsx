import Link from "next/link"

const Navbar = () => {
    return (
        <nav className="bg-slate-200 p-4 flex justify-between items-center  text-2xl">
            <div className="flex gap-4">
                <Link href="/">Home</Link>
                <Link href="/about">About</Link>
                <Link href="/information">Information</Link>
                <Link href="/camp">Camping</Link>
            </div>
            
            <div className="flex gap-4">
                <Link href="/login">Login</Link>
                <Link href="/register">Register</Link>

            </div>
        </nav>
    )
}
export default Navbar