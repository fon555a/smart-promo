import { fetchCamps } from "@/utils/actions"

type CampData = {
    id: number,
    name: string,
    description: string
}

const CampList = async () => {
    const campsData= await fetchCamps()
    return (
        <div>
            CampList
            {
                campsData.map((value: CampData) => {
                    return (
                    <div key={value.id}>
                        name: {value.name}
                        description: {value.description}
                    </div>
                    )
                })
            }
            
        </div>
    )
}
export default CampList