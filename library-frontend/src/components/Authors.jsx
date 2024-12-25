import {gql, useQuery, useMutation} from '@apollo/client'
import {useState} from 'react'
import Select from 'react-select'
import Notification from './Notification'

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`

const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
    }
  }
`

const Authors = (props) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')  

  const authors = useQuery(ALL_AUTHORS)
  console.log(authors)
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{query: ALL_AUTHORS}],
    onError: (error) => {
      const messages = error.graphQLErrors.map(e => e.message).join('\n')
      setError(messages)
    },
    onCompleted: () => {
      setSuccess('Author updated successfully')
      setTimeout(() => {
        setSuccess('')
      }, 5000)}
  })

  if (!props.show) {
    return null
  }

  if (authors.loading) {
    return <div>loading...</div>
  }

  const submit = async (event) => {
    event.preventDefault()
    console.log('update author...')
    editAuthor({ variables: { name, setBornTo: parseInt(born) } })
    setName('')
    setBorn('')
  }

  const options = authors.data.allAuthors.map(a => ({value: a.name, label: a.name}))
  console.log(options)

  return (
    <div>
      <h2>authors</h2>
      <Notification message={error} type="error" setMessage={setError}/>
      <Notification message={success} type="success" setMessage={setSuccess}/>  
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
        name
        <Select options={options} onChange={(target)=> setName(target.value)} />
        </div>
        <div>
        born
        <input type="number" value={born} onChange={({target})=> setBorn(target.value)}/>
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default Authors
