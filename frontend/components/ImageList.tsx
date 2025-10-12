'use client'

import Image from "next/image"
import { useState } from "react"

interface Props {
    imagesList: string[]
}

const BackButton = ({ onclick }) => {
    return <div className="absolute top-0 left-0 bottom-0 flex items-center" onClick={onclick}>
        <button
            className="cursor-pointer m-5"            
        >
            <Image
                src={"/back-button.svg"}
                alt="back button of the preview"
                className="hover:scale-125"
                width={50}
                height={50}
            />
        </button>
    </div>
}

const ExitButton = ({ onclick }) => {
    return <button className="absolute top-0 left-0 p-5 cursor-pointer z-10" onClick={onclick}>
        <Image
            src={"/exit-button.svg"}
            width={50}
            height={50}
            alt="exit button"
        />
    </button>
}

const NextButton = ({ onclick }) => {
    return <div className="absolute top-0 group right-0 bottom-0 flex items-center" onClick={onclick}>
        <button
            className="cursor-pointer m-5"
        >
            <Image
                src={"/next-button.svg"}
                alt="next button of the preview"
                className="hover:scale-125"
                width={50}
                height={50}
            />
        </button>
    </div>
}

const ImageList = ({ imagesList }: Props) => {
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    const [isDisplayingImage, setIsDisplaying] = useState<boolean>(false)

    const addCurrentIndex = (value: number) => {
        setCurrentIndex((prev) => {
            return (prev + value + imagesList.length) % imagesList.length
        })
    }


    return (
        <div className="w-full h-full">
            {/* overlay */}
            {isDisplayingImage &&
                <div
                    className="fixed z-10 inset-0 w-screen h-screen bg-gray-500/50 flex justify-center items-center"

                >
    
                    {imagesList.length > 1 &&
                        <div>
                            <BackButton onclick={() => addCurrentIndex(-1)} />
                            <NextButton onclick={() => addCurrentIndex(1)} />
                        </div>
                    }
                    <ExitButton onclick={() => setIsDisplaying(false)} />
                    <img src={imagesList[currentIndex]}
                        className="object-contain w-[75%] h-[75%]"
                        alt="" />

                </div>
            }

            <div className="w-auto h-full max-w-[90vw] relative">
                {imagesList.length > 1 &&
                    <div>
                        <BackButton onclick={() => addCurrentIndex(-1)} />
                        <NextButton onclick={() => addCurrentIndex(1)} />


                    </div>
                }

                <button className="w-full h-full cursor-pointer" onClick={() => setIsDisplaying(true)}>
                    <img
                        src={imagesList[currentIndex]}
                        className="object-contain h-full w-full"
                        alt=""
                    />

                </button>

            </div>
        </div>
    )
}
export default ImageList