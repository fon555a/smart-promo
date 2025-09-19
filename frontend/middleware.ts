import { NextResponse } from "next/server"

export const middleware = (request: Request) => {
    // console.log("Hello middleware")
    // return NextResponse.redirect(new URL("/", request.url))
}

export const config = {
    // matcher: ["/about/:path*", "/information/:path*"]
}