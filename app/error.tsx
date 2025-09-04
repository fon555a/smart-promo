'use client'

const error = ({error}: {error: Error}) => {
  return (
    <div>error: {error.message}</div>
  )
}
export default error