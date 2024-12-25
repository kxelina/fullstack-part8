import { useEffect } from 'react'

const Notification = ({ message, type, setMessage }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      setMessage(null)
    }, 5000)

    return () => clearTimeout(timeout)
  }, [message, setMessage])

  if (!message) {
    return null
  }

  let className = ''
  if (type === 'error') {
    className = 'error'
  } else if (type === 'success') {
    className = 'success'
  }

  return (
    <div className={className}>
      {message}
    </div>
  )
}

export default Notification